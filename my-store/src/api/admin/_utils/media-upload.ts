import { createWriteStream } from "node:fs"
import { rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"
import Busboy from "busboy"
import type { MedusaRequest } from "@medusajs/framework/http"

export type ParsedAdminUpload = {
  field_name: string
  file_name: string
  mime_type: string
  size_bytes: number
  temp_file_path: string
  cleanup: () => Promise<void>
  /** Extra form fields captured alongside the file */
  fields: Record<string, string>
}

/**
 * Busboy defaults to Latin-1 for multipart header parsing.
 * Modern browsers send non-ASCII filenames (e.g., Chinese) as UTF-8 bytes
 * inside the Content-Disposition header without percent-encoding.
 * This means Busboy decodes them as Latin-1, producing garbled text.
 *
 * This function detects the mis-decoding and re-interprets the raw bytes
 * as UTF-8 if the result is clean.
 */
function fixFilenameEncoding(raw: string): string {
  if (!raw || /^[\x00-\x7F]*$/.test(raw)) return raw
  try {
    const utf8Attempt = Buffer.from(raw, "latin1").toString("utf8")
    if (!utf8Attempt.includes("\uFFFD")) return utf8Attempt
  } catch {
    // ignore — fall through to return raw
  }
  return raw
}

export async function parseAdminUploadRequest(
  req: MedusaRequest,
  maxFileSizeBytes: number
): Promise<ParsedAdminUpload> {
  const contentType = req.headers["content-type"] || ""

  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new Error("Content-Type must be multipart/form-data")
  }

  return await new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: maxFileSizeBytes,
      },
    })

    let settled = false
    let fileFound = false
    let fileName = ""
    let fieldName = ""
    let mimeType = "application/octet-stream"
    let tempFilePath = ""
    let sizeBytes = 0
    let limitReached = false
    const extraFields: Record<string, string> = {}
    // Promise that resolves/rejects when the write stream finishes
    let writeStreamDone: Promise<void> = Promise.resolve()

    const cleanup = async () => {
      if (tempFilePath) {
        await rm(tempFilePath, { force: true }).catch(() => undefined)
      }
    }

    const finalizeReject = async (error: Error) => {
      if (settled) {
        return
      }

      settled = true
      await cleanup()
      reject(error)
    }

    busboy.on("field", (name, value) => {
      extraFields[name] = value
    })

    busboy.on("file", (incomingFieldName, file, info) => {
      if (fileFound) {
        file.resume()
        void finalizeReject(new Error("Only one file is allowed per request"))
        return
      }

      fileFound = true
      fieldName = incomingFieldName
      fileName = fixFilenameEncoding(info.filename || "upload.bin")
      mimeType = info.mimeType || "application/octet-stream"
      tempFilePath = join(tmpdir(), `course-media-${randomUUID()}`)

      const writeStream = createWriteStream(tempFilePath)

      // Track write stream completion as a Promise so we can await it in
      // busboy's "finish" handler (busboy fires before writeStream finishes)
      writeStreamDone = new Promise<void>((res, rej) => {
        writeStream.on("finish", res)
        writeStream.on("error", (error) => {
          rej(error instanceof Error ? error : new Error("Failed to persist uploaded file"))
        })
      })

      file.on("data", (chunk: Buffer) => {
        sizeBytes += chunk.length
      })

      file.on("limit", () => {
        limitReached = true
        writeStream.destroy(new Error(`Uploaded file exceeds ${maxFileSizeBytes} bytes limit`))
      })

      file.on("error", (error) => {
        void finalizeReject(error instanceof Error ? error : new Error("Failed to read uploaded file"))
      })

      file.pipe(writeStream)
    })

    busboy.on("error", (error) => {
      void finalizeReject(error instanceof Error ? error : new Error("Failed to parse upload request"))
    })

    busboy.on("finish", async () => {
      if (settled) {
        return
      }

      if (!fileFound) {
        await finalizeReject(new Error("No file uploaded"))
        return
      }

      if (limitReached) {
        await finalizeReject(new Error(`Uploaded file exceeds ${maxFileSizeBytes} bytes limit`))
        return
      }

      // Wait for the write stream to fully flush before checking size
      try {
        await writeStreamDone
      } catch (error) {
        await finalizeReject(error instanceof Error ? error : new Error("Failed to persist uploaded file"))
        return
      }

      if (sizeBytes <= 0) {
        await finalizeReject(new Error("Uploaded file is empty"))
        return
      }

      settled = true
      resolve({
        field_name: fieldName,
        file_name: fileName,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        temp_file_path: tempFilePath,
        cleanup,
        fields: extraFields,
      })
    })

    req.pipe(busboy)
  })
}