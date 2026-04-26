let chromium

try {
  chromium = require("playwright").chromium
} catch {
  chromium = require("C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright").chromium
}

const normalizeBackendUrl = (url) => url.replace("://localhost", "://127.0.0.1")

const BACKEND = normalizeBackendUrl(process.env.BACKEND_URL || "http://localhost:9000")
const STOREFRONT = process.env.STOREFRONT_URL || "http://localhost:8002"
const STOREFRONT_ORIGIN = new URL(STOREFRONT).origin
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_0ab9cc5b6f32fcfc17cb1c354d37062ccd7547b5332e9e54db2ce483eeee7ac2"
const COUNTRY_CODE = process.env.COUNTRY_CODE || "us"
const CUSTOMER_PASSWORD = process.env.PLAYWRIGHT_CUSTOMER_PASSWORD || "TestPass1234!"

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(url, options = {}, retries = 10) {
  let lastError = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetch(url, options)
    } catch (error) {
      const connectionCode = error?.cause?.code || error?.code
      if (connectionCode !== "ECONNREFUSED" || attempt === retries - 1) {
        throw error
      }

      lastError = error
      await delay(500 * (attempt + 1))
    }
  }

  throw lastError || new Error(`Failed to fetch ${url}`)
}

async function requestJson(path, options = {}) {
  const headers = {
    ...(options.skipJsonContentType ? {} : { "content-type": "application/json" }),
    "x-publishable-api-key": PUBLISHABLE_KEY,
    ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetchWithRetry(`${BACKEND}${path}`, {
    method: options.method || "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body),
    redirect: options.redirect || "follow",
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${text}`)
  }

  return data
}

async function requestSameOrigin(path, options = {}) {
  const headers = {
    ...(options.cookie ? { cookie: options.cookie } : {}),
    ...(options.headers || {}),
  }

  return fetchWithRetry(`${STOREFRONT}${path}`, {
    method: options.method || "GET",
    headers,
    redirect: options.redirect || "follow",
  })
}

async function findRegion() {
  const regionParams = new URLSearchParams({ fields: "*countries" })
  const data = await requestJson(`/store/regions?${regionParams.toString()}`)
  const region = (data.regions || []).find((entry) =>
    (entry.countries || []).some((country) => country.iso_2 === COUNTRY_CODE)
  )

  assert(region, `No region found for country code ${COUNTRY_CODE}`)

  return region
}

async function findVirtualResourceProduct() {
  const productParams = new URLSearchParams({
    country_code: COUNTRY_CODE,
    limit: "100",
    fields: "title,handle,metadata,*variants",
  })
  const data = await requestJson(`/store/products?${productParams.toString()}`)

  const product = (data.products || []).find(
    (entry) =>
      entry.metadata?.is_virtual === true &&
      entry.metadata?.virtual_product_type === "resource" &&
      entry.metadata?.resource_file_asset_id &&
      (entry.variants || []).length > 0
  )

  assert(product, "No virtual resource product with a file asset was found")

  return product
}

async function createVirtualCart(regionId, variantId, token) {
  const cartResponse = await requestJson("/store/carts", {
    method: "POST",
    token,
    body: { region_id: regionId },
  })

  const cartId = cartResponse.cart?.id
  assert(cartId, "Cart creation did not return an id")

  await requestJson(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    token,
    body: { variant_id: variantId, quantity: 1 },
  })

  await requestJson(`/store/carts/${cartId}/normalize-virtual-line-items`, {
    method: "POST",
    token,
    body: {},
  })

  return cartId
}

async function updateVirtualCart(cartId, email, token) {
  return requestJson(`/store/carts/${cartId}`, {
    method: "POST",
    token,
    body: {
      email,
      billing_address: {
        first_name: "Play",
        last_name: "Wright",
        address_1: "Digital delivery",
        city: "Online",
        country_code: COUNTRY_CODE,
        postal_code: "10001",
        province: "Digital",
        phone: "1234567890",
      },
      shipping_address: {
        first_name: "Play",
        last_name: "Wright",
        address_1: "Digital delivery",
        city: "Online",
        country_code: COUNTRY_CODE,
        postal_code: "10001",
        province: "Digital",
        phone: "1234567890",
      },
    },
  })
}

async function ensurePaymentCollection(cartId, token) {
  const paymentCollection = await requestJson("/store/payment-collections", {
    method: "POST",
    token,
    body: { cart_id: cartId },
  })

  return paymentCollection.payment_collection.id
}

async function createCustomerAccount() {
  const email = `playwright-${Date.now()}@example.com`

  const registerResponse = await fetchWithRetry(`${BACKEND}/auth/customer/emailpass/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: CUSTOMER_PASSWORD }),
  })
  const registerPayload = await registerResponse.json()
  assert(registerResponse.ok, `Customer register failed: ${JSON.stringify(registerPayload)}`)

  await requestJson("/store/customers", {
    method: "POST",
    token: registerPayload.token,
    body: {
      email,
      first_name: "Play",
      last_name: "Wright",
    },
  })

  const loginResponse = await fetchWithRetry(`${BACKEND}/auth/customer/emailpass`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: CUSTOMER_PASSWORD }),
  })
  const loginPayload = await loginResponse.json()
  assert(loginResponse.ok, `Customer login failed: ${JSON.stringify(loginPayload)}`)

  return { email, token: loginPayload.token }
}

async function verifyResponsiveShell() {
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const pages = [
      {
        name: "home",
        url: `${STOREFRONT}/${COUNTRY_CODE}`,
        ready: async (page) => page.getByTestId("nav-store-link").waitFor({ state: "visible", timeout: 20000 }),
      },
      {
        name: "store",
        url: `${STOREFRONT}/${COUNTRY_CODE}/store`,
        ready: async (page) => page.getByTestId("store-page-title").waitFor({ state: "visible", timeout: 30000 }),
      },
    ]

    for (const current of pages) {
      const page = await context.newPage()
      await page.goto(current.url, { waitUntil: "domcontentloaded", timeout: 60000 })
      await current.ready(page)
      await page.waitForTimeout(1000)

      const bodyText = await page.locator("body").innerText()
      const metrics = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }))

      assert(!bodyText.includes("Application error"), `${current.name} page rendered an application error`)
      assert(!bodyText.includes("Runtime Error"), `${current.name} page rendered a runtime error`)
      assert(
        metrics.scrollWidth <= metrics.innerWidth && metrics.bodyScrollWidth <= metrics.innerWidth,
        `${current.name} page overflowed horizontally: ${JSON.stringify(metrics)}`
      )

      await page.screenshot({
        path: `${process.cwd()}/${current.name}-responsive-validation.png`,
        fullPage: true,
      })

      console.log(`[shell] ${current.name} responsive check passed ${JSON.stringify(metrics)}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
}

async function verifyVirtualCheckoutRedirect(regionId, variantId) {
  const cartId = await createVirtualCart(regionId, variantId)
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext()
    await context.addCookies([
      {
        name: "_medusa_cart_id",
        value: cartId,
        url: STOREFRONT_ORIGIN,
      },
    ])

    const page = await context.newPage()
    const checkoutUrl = `${STOREFRONT}/${COUNTRY_CODE}/checkout?step=address`

    await page.goto(checkoutUrl, { waitUntil: "domcontentloaded", timeout: 45000 })
    await page.getByTestId("shipping-email-input").waitFor({ state: "visible", timeout: 15000 })

    const bodyBefore = await page.locator("body").innerText()
    assert(!bodyBefore.includes("NEXT_REDIRECT"), "NEXT_REDIRECT rendered before submitting address")

    await page.getByTestId("shipping-email-input").fill(`virtual-checkout-${Date.now()}@example.com`)

    await Promise.all([
      page.waitForURL(new RegExp(`/checkout\\?step=payment$`), { timeout: 20000 }),
      page.getByTestId("submit-address-button").click(),
    ])

    const bodyAfter = await page.locator("body").innerText()
    assert(!bodyAfter.includes("NEXT_REDIRECT"), "NEXT_REDIRECT rendered after submitting address")
    await page.getByTestId("digital-delivery-summary").waitFor({ state: "visible", timeout: 15000 })

    console.log(`[checkout] virtual cart redirected to payment for cart ${cartId}`)
  } finally {
    await browser.close()
  }
}

async function verifyPayPalAmount(regionId, variantId) {
  const customer = await createCustomerAccount()
  const cartId = await createVirtualCart(regionId, variantId, customer.token)
  const cartResponse = await updateVirtualCart(cartId, customer.email, customer.token)
  const paymentCollectionId = await ensurePaymentCollection(cartId, customer.token)
  const sessionResponse = await requestJson(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    {
      method: "POST",
      token: customer.token,
      body: { provider_id: "pp_paypal_paypal" },
    }
  )

  const session = (sessionResponse.payment_collection?.payment_sessions || []).find(
    (entry) => entry.provider_id === "pp_paypal_paypal"
  )

  assert(session, "PayPal payment session was not created")

  const expectedAmount = Number(cartResponse.cart.total).toFixed(2)
  const actualAmount = session.data?.paypal_order_amount

  assert(actualAmount === expectedAmount, `PayPal amount mismatch: expected ${expectedAmount}, got ${actualAmount}`)
  assert(session.data?.paypal_order_id, "PayPal order id was missing from payment session data")

  console.log(`[paypal] order amount ${actualAmount} matched cart total ${expectedAmount}`)
}

async function createVirtualOrder(regionId, variantId, fileAssetId) {
  const customer = await createCustomerAccount()
  const cartId = await createVirtualCart(regionId, variantId, customer.token)
  const cartResponse = await updateVirtualCart(cartId, customer.email, customer.token)
  const paymentCollectionId = await ensurePaymentCollection(cartId, customer.token)

  await requestJson(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
    method: "POST",
    token: customer.token,
    body: { provider_id: "pp_system_default" },
  })

  const completeResponse = await requestJson(`/store/carts/${cartId}/complete`, {
    method: "POST",
    token: customer.token,
  })

  assert(completeResponse.type === "order", `Cart completion did not return an order: ${JSON.stringify(completeResponse)}`)

  await requestJson("/store/course-purchases/from-order", {
    method: "POST",
    token: customer.token,
    body: { order_id: completeResponse.order.id },
  })

  return {
    email: customer.email,
    token: customer.token,
    cart: cartResponse.cart,
    order: completeResponse.order,
    fileAssetId,
  }
}

async function verifyVirtualOrderExperience(regionId, product) {
  const orderFixture = await createVirtualOrder(
    regionId,
    product.variants[0].id,
    product.metadata.resource_file_asset_id
  )
  const authCookie = `_medusa_jwt=${encodeURIComponent(orderFixture.token)}`
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } })
    await context.addCookies([
      {
        name: "_medusa_jwt",
        value: orderFixture.token,
        url: STOREFRONT_ORIGIN,
        httpOnly: true,
      },
    ])

    const page = await context.newPage()
    const orderUrl = `${STOREFRONT}/${COUNTRY_CODE}/account/orders/details/${orderFixture.order.id}`
    await page.goto(orderUrl, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.getByTestId("order-details-container").waitFor({ state: "visible", timeout: 30000 })

    const bodyText = await page.locator("body").innerText()
    assert(
      /虚拟商品已直接送达|Virtual product delivered directly/.test(bodyText),
      "Virtual fulfillment copy was not rendered on the order details page"
    )
    assert(/下载|Download/.test(bodyText), "Download action was not rendered on the order details page")

    const statusResponse = await requestSameOrigin(
      `/api/file-assets/${orderFixture.fileAssetId}/status?order_id=${orderFixture.order.id}`,
      {
        cookie: authCookie,
      }
    )
    const statusPayload = await statusResponse.json()
    assert(statusResponse.ok, `Download status route failed: ${JSON.stringify(statusPayload)}`)
    assert(statusPayload.remaining_downloads === 3, `Expected a fresh order to start with 3 downloads, got ${JSON.stringify(statusPayload)}`)

    const downloadResponse = await requestSameOrigin(
      `/api/file-assets/${orderFixture.fileAssetId}/download?order_id=${orderFixture.order.id}`,
      {
        cookie: authCookie,
        redirect: "manual",
      }
    )
    const redirectLocation = downloadResponse.headers.get("location") || ""
    const contentDisposition = downloadResponse.headers.get("content-disposition") || ""

    assert(
      [200, 301, 302, 303, 307, 308].includes(downloadResponse.status),
      `Download route returned an unexpected status: status=${downloadResponse.status}`
    )

    if (downloadResponse.status === 200) {
      assert(
        /attachment/i.test(contentDisposition),
        `Download response was missing attachment headers: ${contentDisposition}`
      )
    } else {
      assert(
        /amazonaws\.com|x-amz-/i.test(redirectLocation),
        `Download redirect did not look like a signed S3 URL: ${redirectLocation}`
      )
    }

    const statusAfterDownloadResponse = await requestSameOrigin(
      `/api/file-assets/${orderFixture.fileAssetId}/status?order_id=${orderFixture.order.id}`,
      {
        cookie: authCookie,
      }
    )
    const statusAfterDownloadPayload = await statusAfterDownloadResponse.json()
    assert(
      statusAfterDownloadResponse.ok && statusAfterDownloadPayload.remaining_downloads === 2,
      `Expected download count to decrement per order, got ${JSON.stringify(statusAfterDownloadPayload)}`
    )

    console.log(`[order] order ${orderFixture.order.id} rendered direct-delivery status and validated download delivery`) 
  } finally {
    await browser.close()
  }
}

async function main() {
  console.log(`[setup] backend=${BACKEND}`)
  console.log(`[setup] storefront=${STOREFRONT}`)

  const region = await findRegion()
  const product = await findVirtualResourceProduct()
  const variantId = product.variants[0]?.id

  assert(variantId, `Virtual product ${product.title} has no variant id`)

  console.log(`[data] region=${region.id}`)
  console.log(`[data] virtual resource product=${product.title} (${product.handle})`)

  await verifyResponsiveShell()
  await verifyVirtualCheckoutRedirect(region.id, variantId)
  await verifyPayPalAmount(region.id, variantId)
  await verifyVirtualOrderExperience(region.id, product)

  console.log("PASS responsive shell, virtual checkout, PayPal amount, and secure download validation")
}

main().catch((error) => {
  console.error("FAIL", error)
  process.exit(1)
})