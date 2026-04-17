import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { randomUUID } from "crypto"

export type TicketStatus = "open" | "pending" | "resolved" | "closed"

export type CreateTicketInput = {
  title: string
  content: string
  customer_email?: string
  guest_token?: string
}

export type ListTicketsInput = {
  customer_email?: string
  guest_token?: string
  status?: TicketStatus | TicketStatus[]
  q?: string
  page?: number
  limit?: number
}

export type AddMessageInput = {
  ticket_id: string
  sender_type: "user" | "admin"
  content: string
}

function generateTicketId(): string {
  return `ticket_${randomUUID().replace(/-/g, "").slice(0, 12)}`
}

function generateMessageId(): string {
  return `tmsg_${randomUUID().replace(/-/g, "").slice(0, 12)}`
}

const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["pending", "closed"],
  pending: ["resolved", "closed", "open"],
  resolved: ["closed", "open"],
  closed: ["open"],
}

export class TicketService {
  constructor(private readonly scope: any) {}

  private get knex() {
    const knex = this.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION ?? "pg_connection")
    if (!knex) throw new Error("Could not resolve 'pg_connection' from request scope")
    return knex
  }

  // ─── CREATE ────────────────────────────────────────────────────────────────

  async createTicket(input: CreateTicketInput): Promise<{ ticket: any; guest_token?: string }> {
    const { title, content, customer_email, guest_token: inputGuestToken } = input
    const now = new Date()

    let resolvedGuestToken: string | undefined = inputGuestToken
    let isNewGuestToken = false

    if (!customer_email && !resolvedGuestToken) {
      resolvedGuestToken = randomUUID()
      isNewGuestToken = true
    }

    const id = generateTicketId()
    const msgId = generateMessageId()

    await this.knex.transaction(async (trx: any) => {
      await trx("ticket").insert({
        id,
        title,
        status: "open",
        customer_email: customer_email ?? null,
        guest_token: resolvedGuestToken ?? null,
        created_at: now,
        updated_at: now,
      })
      await trx("ticket_message").insert({
        id: msgId,
        ticket_id: id,
        sender_type: "user",
        content,
        created_at: now,
        updated_at: now,
      })
    })

    const ticket = await this.knex("ticket").where("id", id).first()
    const result: { ticket: any; guest_token?: string } = { ticket }
    if (isNewGuestToken) result.guest_token = resolvedGuestToken
    return result
  }

  // ─── LIST ──────────────────────────────────────────────────────────────────

  async listTickets(input: ListTicketsInput = {}) {
    const { customer_email, guest_token, status, q, page = 1, limit = 20 } = input
    let query = this.knex("ticket").whereNull("deleted_at")

    if (customer_email) query = query.where("customer_email", customer_email)
    else if (guest_token) query = query.where("guest_token", guest_token)

    if (status) {
      if (Array.isArray(status)) query = query.whereIn("status", status)
      else query = query.where("status", status)
    }

    if (q) {
      query = query.where(function (this: any) {
        this.whereRaw(`title ILIKE ?`, [`%${q}%`])
          .orWhereRaw(`customer_email ILIKE ?`, [`%${q}%`])
      })
    }

    const countResult = await query.clone().count("id as count").first()
    const count = parseInt(countResult?.count ?? "0", 10)

    const tickets = await query
      .orderBy("updated_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit)

    return { tickets, count, page, limit }
  }

  // ─── GET ───────────────────────────────────────────────────────────────────

  async getTicket(id: string): Promise<{ ticket: any; messages: any[] } | null> {
    const ticket = await this.knex("ticket").where("id", id).whereNull("deleted_at").first()
    if (!ticket) return null

    const messages = await this.knex("ticket_message")
      .where("ticket_id", id)
      .whereNull("deleted_at")
      .orderBy("created_at", "asc")

    return { ticket, messages }
  }

  // ─── STATUS UPDATE ─────────────────────────────────────────────────────────

  async updateTicketStatus(id: string, newStatus: TicketStatus): Promise<any> {
    const ticket = await this.knex("ticket").where("id", id).whereNull("deleted_at").first()
    if (!ticket) throw new Error(`Ticket ${id} not found`)

    const current = ticket.status as TicketStatus
    if (!VALID_TRANSITIONS[current]?.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${current} → ${newStatus}`)
    }

    const update: Record<string, any> = { status: newStatus, updated_at: new Date() }
    if (newStatus === "resolved") update.resolved_at = new Date()

    await this.knex("ticket").where("id", id).update(update)
    return this.knex("ticket").where("id", id).first()
  }

  // ─── ADD MESSAGE ───────────────────────────────────────────────────────────

  async addMessage(input: AddMessageInput): Promise<any> {
    const { ticket_id, sender_type, content } = input
    const ticket = await this.knex("ticket").where("id", ticket_id).whereNull("deleted_at").first()
    if (!ticket) throw new Error(`Ticket ${ticket_id} not found`)
    if (ticket.status === "closed") throw new Error("Cannot message a closed ticket")

    const now = new Date()
    const msgId = generateMessageId()

    await this.knex.transaction(async (trx: any) => {
      await trx("ticket_message").insert({
        id: msgId,
        ticket_id,
        sender_type,
        content,
        created_at: now,
        updated_at: now,
      })

      // Reopen resolved ticket when user sends a new message
      if (sender_type === "user" && ticket.status === "resolved") {
        await trx("ticket").where("id", ticket_id).update({ status: "open", updated_at: now })
      } else {
        await trx("ticket").where("id", ticket_id).update({ updated_at: now })
      }
    })

    return this.knex("ticket_message").where("id", msgId).first()
  }

  // ─── MIGRATE GUEST TICKETS ────────────────────────────────────────────────

  async migrateGuestTickets(guest_token: string, customer_email: string): Promise<number> {
    const result = await this.knex("ticket")
      .where("guest_token", guest_token)
      .whereNull("customer_email")
      .whereNull("deleted_at")
      .update({ customer_email, guest_token: null, updated_at: new Date() })
    return result
  }

  // ─── STATS ────────────────────────────────────────────────────────────────

  async getTicketStats(): Promise<Record<TicketStatus, number>> {
    const rows = await this.knex("ticket")
      .whereNull("deleted_at")
      .groupBy("status")
      .select("status")
      .count("id as count")

    const stats: Record<string, number> = { open: 0, pending: 0, resolved: 0, closed: 0 }
    for (const row of rows) {
      stats[row.status] = parseInt(row.count, 10)
    }
    return stats as Record<TicketStatus, number>
  }

  // ─── RATE LIMIT CHECK ─────────────────────────────────────────────────────

  async checkGuestRateLimit(guest_token: string): Promise<boolean> {
    const since = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    const result = await this.knex("ticket_message")
      .join("ticket", "ticket.id", "ticket_message.ticket_id")
      .where("ticket.guest_token", guest_token)
      .where("ticket_message.sender_type", "user")
      .where("ticket_message.created_at", ">=", since)
      .count("ticket_message.id as count")
      .first()

    const count = parseInt(result?.count ?? "0", 10)
    return count < 10
  }
}
