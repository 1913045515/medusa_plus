export type PayPalMode = "sandbox" | "live"

interface TokenCache {
  accessToken: string
  expiresAt: number // Unix ms
}

interface PayPalOrderAmount {
  currency_code: string
  value: string
}

interface CreateOrderPayload {
  intent: "CAPTURE"
  purchase_units: Array<{
    amount: PayPalOrderAmount
    custom_id?: string
  }>
}

interface PayPalOrderResponse {
  id: string
  status: string
  links?: Array<{ href: string; rel: string; method: string }>
}

interface PayPalCaptureResponse {
  id: string
  status: string
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id: string; status: string; amount: PayPalOrderAmount }>
    }
  }>
}

interface PayPalRefundResponse {
  id: string
  status: string
}

export class PayPalClient {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly mode: PayPalMode
  private tokenCache: TokenCache | null = null

  constructor(clientId: string, clientSecret: string, mode: PayPalMode) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.mode = mode
  }

  get baseUrl(): string {
    return this.mode === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com"
  }

  private async fetchAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64")

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`PayPal OAuth failed (${res.status}): ${body}`)
    }

    const data = await res.json() as { access_token: string; expires_in: number }
    return data.access_token
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now()
    // Refresh if missing or within 60 seconds of expiry
    if (!this.tokenCache || this.tokenCache.expiresAt - now < 60_000) {
      let retries = 0
      while (retries <= 1) {
        try {
          const token = await this.fetchAccessToken()
          // PayPal tokens typically last 3600s; store with 60s buffer
          this.tokenCache = { accessToken: token, expiresAt: now + 3540_000 }
          break
        } catch (err) {
          if (retries === 1) throw err
          retries++
        }
      }
    }
    return this.tokenCache!.accessToken
  }

  private async apiRequest<T>(
    path: string,
    method: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.getAccessToken()
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      let message = `PayPal API error (${res.status})`
      try {
        const json = JSON.parse(text)
        message = json.message || json.error_description || message
      } catch {
        // use raw text if not JSON
        if (text) message += `: ${text}`
      }
      throw new Error(message)
    }

    // 204 No Content
    if (res.status === 204) return {} as T
    return res.json() as Promise<T>
  }

  async createOrder(
    currencyCode: string,
    amount: string,
    customId?: string
  ): Promise<PayPalOrderResponse> {
    const payload: CreateOrderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currencyCode, value: amount },
          ...(customId ? { custom_id: customId } : {}),
        },
      ],
    }
    return this.apiRequest<PayPalOrderResponse>("/v2/checkout/orders", "POST", payload)
  }

  async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    return this.apiRequest<PayPalCaptureResponse>(
      `/v2/checkout/orders/${orderId}/capture`,
      "POST",
      {}
    )
  }

  async refundCapture(captureId: string, amount?: { currency_code: string; value: string }): Promise<PayPalRefundResponse> {
    const body = amount ? { amount } : {}
    return this.apiRequest<PayPalRefundResponse>(
      `/v2/payments/captures/${captureId}/refund`,
      "POST",
      body
    )
  }

  /** Test connectivity by obtaining an access token. */
  async testConnection(): Promise<void> {
    // Force refresh
    this.tokenCache = null
    await this.getAccessToken()
  }
}
