"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

// ─── OTP 注册流程 Server Actions ─────────────────────────────────

/** 检查邮箱是否已注册，返回 { exists: boolean } */
export async function checkEmailExists(
  email: string
): Promise<{ exists: boolean } | { error: string }> {
  try {
    const res = await sdk.client.fetch<{ exists: boolean }>(
      "/store/auth/check-email",
      { method: "POST", body: { email: email.trim().toLowerCase() } }
    )
    return { exists: res.exists }
  } catch (err: any) {
    const body = err?.response?.json ? await err.response.json().catch(() => null) : null
    return { error: body?.message ?? err?.message ?? "检查失败 / Check failed" }
  }
}

/** Step 1: 发送邮箱验证码 */
export async function sendEmailOtp(
  email: string
): Promise<{ success: true } | { error: string; cooldown_seconds?: number }> {
  try {
    await sdk.client.fetch("/store/auth/email-otp/send", {
      method: "POST",
      body: { email },
    })
    return { success: true }
  } catch (err: any) {
    const body = err?.response?.json ? await err.response.json().catch(() => null) : null
    const message = body?.message ?? err?.message ?? "发送失败 / Send failed"
    const cooldown_seconds = body?.cooldown_seconds
    return { error: message, ...(cooldown_seconds ? { cooldown_seconds } : {}) }
  }
}

/** Step 2: 验证 OTP，成功返回 verifiedToken */
export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<{ success: true; verified_token: string } | { error: string }> {
  try {
    const res = await sdk.client.fetch<{ success: boolean; verified_token: string }>(
      "/store/auth/email-otp/verify",
      { method: "POST", body: { email, otp } }
    )
    return { success: true, verified_token: res.verified_token }
  } catch (err: any) {
    const body = err?.response?.json ? await err.response.json().catch(() => null) : null
    const message = body?.message ?? err?.message ?? "验证失败 / Verification failed"
    return { error: message }
  }
}

/** Step 3: 使用 verifiedToken 完成注册并自动登录 */
export async function registerWithOtp(
  _currentState: unknown,
  formData: FormData
): Promise<string | null> {
  const verified_token = formData.get("verified_token") as string
  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string
  const email = formData.get("email") as string

  try {
    const res = await sdk.client.fetch<{ token: string }>(
      "/store/auth/register-with-otp",
      {
        method: "POST",
        body: { verified_token, first_name, last_name, phone, password },
      }
    )

    await setAuthToken(res.token)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return "__REGISTER_SUCCESS__"
  } catch (err: any) {
    const body = err?.response?.json ? await err.response.json().catch(() => null) : null
    return body?.message ?? err?.message ?? "注册失败 / Registration failed"
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
