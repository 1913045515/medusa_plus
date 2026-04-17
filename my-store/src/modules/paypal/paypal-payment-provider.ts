import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/types"
import { Logger } from "@medusajs/framework/types"
import { PayPalClient } from "./paypal-client"
import PaypalModuleService, { decryptSecret } from "./service"
import { PAYPAL_MODULE } from "./index"

type InjectedDependencies = {
  logger: Logger
  [key: string]: unknown
}

// Stored in payment session data
interface PayPalSessionData {
  paypal_order_id?: string
  paypal_capture_id?: string
  status?: string
  error?: string
}

export class PayPalPaymentProvider extends AbstractPaymentProvider<Record<string, unknown>> {
  static identifier = "pp_paypal"

  private logger: Logger
  private paypalService: PaypalModuleService

  constructor(container: InjectedDependencies, config: Record<string, unknown> = {}) {
    super(container as any, config)
    this.logger = container.logger as Logger
    this.paypalService = container[PAYPAL_MODULE] as PaypalModuleService
  }

  private async getClient(): Promise<PayPalClient> {
    const configs = await this.paypalService.listPaypalConfigs()
    if (!configs || configs.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "PayPal is not configured. Please set up PayPal credentials in admin settings."
      )
    }
    const config = configs[0]
    let secret: string
    try {
      secret = decryptSecret(config.client_secret_encrypted)
    } catch {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Failed to decrypt PayPal client secret. Ensure PAYPAL_CONFIG_ENCRYPTION_KEY is set correctly."
      )
    }
    return new PayPalClient(config.client_id, secret, config.mode as "sandbox" | "live")
  }

  private getSessionData(input: { data?: Record<string, unknown> }): PayPalSessionData {
    return (input.data || {}) as PayPalSessionData
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    try {
      const client = await this.getClient()
      const decimalAmount = (Number(input.amount) / 100).toFixed(2)
      const order = await client.createOrder(
        input.currency_code.toUpperCase(),
        decimalAmount
      )
      return {
        id: order.id,
        data: {
          paypal_order_id: order.id,
          status: order.status,
        },
        status: PaymentSessionStatus.PENDING,
      }
    } catch (err: any) {
      this.logger.error("[PayPal] initiatePayment failed:", err.message)
      return {
        id: "",
        data: { error: err.message },
        status: PaymentSessionStatus.ERROR,
      }
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data, status: PaymentSessionStatus.PENDING }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const sessionData = this.getSessionData(input)
    const paypalOrderId =
      (input.context as any)?.paypal_order_id || sessionData.paypal_order_id
    if (!paypalOrderId) {
      return {
        data: { ...sessionData, error: "Missing PayPal order ID" },
        status: PaymentSessionStatus.ERROR,
      }
    }
    return {
      data: { ...sessionData, paypal_order_id: paypalOrderId, status: "APPROVED" },
      status: PaymentSessionStatus.AUTHORIZED,
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const sessionData = this.getSessionData(input)
    const orderId = sessionData.paypal_order_id
    if (!orderId) {
      return {
        data: { ...sessionData, error: "Missing PayPal order ID for capture", paypal_status: "ERROR" },
      }
    }
    try {
      const client = await this.getClient()
      const capture = await client.captureOrder(orderId)
      const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id
      if (capture.status === "COMPLETED") {
        return {
          data: { ...sessionData, paypal_capture_id: captureId, paypal_status: "COMPLETED" },
        }
      }
      return {
        data: { ...sessionData, paypal_status: capture.status },
      }
    } catch (err: any) {
      this.logger.error("[PayPal] capturePayment failed:", err.message)
      return {
        data: { ...sessionData, error: err.message, paypal_status: "ERROR" },
      }
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const sessionData = this.getSessionData(input)
    return {
      data: { ...sessionData, paypal_status: "CANCELLED" },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const sessionData = this.getSessionData(input)
    const captureId = sessionData.paypal_capture_id
    if (!captureId) {
      return {
        data: { ...sessionData, error: "Missing PayPal capture ID for refund" },
      }
    }
    try {
      const client = await this.getClient()
      await client.refundCapture(captureId)
      return {
        data: { ...sessionData, paypal_status: "REFUNDED" },
      }
    } catch (err: any) {
      this.logger.error("[PayPal] refundPayment failed:", err.message)
      return {
        data: { ...sessionData, error: err.message },
      }
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const sessionData = this.getSessionData(input)
    const status = sessionData.status
    switch (status) {
      case "COMPLETED":
        return { status: PaymentSessionStatus.CAPTURED }
      case "APPROVED":
        return { status: PaymentSessionStatus.AUTHORIZED }
      case "CANCELLED":
        return { status: PaymentSessionStatus.CANCELED }
      case "CREATED":
      case "SAVED":
      case "PAYER_ACTION_REQUIRED":
        return { status: PaymentSessionStatus.PENDING }
      default:
        if (sessionData.error) return { status: PaymentSessionStatus.ERROR }
        return { status: PaymentSessionStatus.PENDING }
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    // PayPal webhooks not handled in this implementation
    return { action: "not_supported" as any }
  }
}
