export type Ticket = {
  id: string
  title: string
  status: "open" | "pending" | "resolved" | "closed"
  customer_email: string | null
  guest_token: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export type TicketMessage = {
  id: string
  ticket_id: string
  sender_type: "user" | "admin"
  content: string
  created_at: string
}

export type CreateTicketInput = {
  title: string
  content: string
  customer_email?: string
  guest_token?: string
}

export const GUEST_TOKEN_KEY = "ticket_guest_token"

export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(GUEST_TOKEN_KEY)
}

export function setGuestToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(GUEST_TOKEN_KEY, token)
}

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
}

function getPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ||
    ""
  )
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBackendUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": getPublishableKey(),
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function listTickets(params: {
  customer_email?: string
  guest_token?: string
  status?: string
  page?: number
}): Promise<{ tickets: Ticket[]; count: number }> {
  const query = new URLSearchParams()
  if (params.customer_email) query.set("customer_email", params.customer_email)
  if (params.guest_token) query.set("guest_token", params.guest_token)
  if (params.status) query.set("status", params.status)
  if (params.page) query.set("page", String(params.page))
  return apiFetch(`/store/tickets?${query}`)
}

export async function createTicket(
  input: CreateTicketInput
): Promise<{ ticket: Ticket; guest_token?: string }> {
  return apiFetch("/store/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getTicket(
  id: string,
  guestToken?: string | null
): Promise<{ ticket: Ticket; messages: TicketMessage[] }> {
  return apiFetch(`/store/tickets/${id}`)
}

export async function sendMessage(
  ticketId: string,
  content: string,
  guestToken?: string | null
): Promise<{ message: TicketMessage }> {
  return apiFetch(`/store/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, guest_token: guestToken }),
  })
}

export async function closeTicket(id: string): Promise<{ ticket: Ticket }> {
  return apiFetch(`/store/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "closed" }),
  })
}

export async function migrateGuestTickets(
  guestToken: string,
  customerEmail: string
): Promise<{ migrated: number }> {
  return apiFetch("/store/tickets/migrate", {
    method: "POST",
    body: JSON.stringify({ guest_token: guestToken, customer_email: customerEmail }),
  })
}
