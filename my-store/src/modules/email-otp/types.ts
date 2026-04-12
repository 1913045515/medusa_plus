export type OtpEntry = {
  otp: string
  attempts: number
  createdAt: number   // ms timestamp
  expiresAt: number   // ms timestamp
}

// verifiedToken payload: `<email>:<expiresAt ms>:<hmac>`
export type VerifiedTokenPayload = {
  email: string
  expiresAt: number
}
