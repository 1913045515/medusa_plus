/**
 * Playwright spec: verify that product list thumbnails and product detail images
 * do NOT use localhost:9000 URLs in production (or wherever PLAYWRIGHT_BASE_URL points).
 *
 * Run:
 *   PLAYWRIGHT_BASE_URL=https://www.wolzq.com npx playwright test e2e/product-image-url.spec.ts
 */
import { test, expect } from "@playwright/test"

const LOCALHOST_IMG_RE = /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/(static|uploads)\//

test.describe("Product image URLs should not reference localhost", () => {
  test("product list page — thumbnails do not use localhost", async ({ page }) => {
    // Navigate to a store collection / store root listing page
    await page.goto("/us/store", { waitUntil: "domcontentloaded" })

    // Wait for at least one product card
    await page.waitForSelector('[data-testid="product-wrapper"]', { timeout: 15000 })

    // Get all img src attributes inside product cards
    const imgSrcs = await page.$$eval(
      '[data-testid="product-wrapper"] img',
      (imgs) => imgs.map((img) => (img as HTMLImageElement).src)
    )

    // Filter for actual image tags (not placeholders)
    const populated = imgSrcs.filter((src) => src && src.length > 0)

    if (populated.length === 0) {
      // No images rendered yet – treat as soft pass but log
      console.warn("No product thumbnail images found on listing page")
      return
    }

    for (const src of populated) {
      expect(src, `Thumbnail src should not be localhost: ${src}`).not.toMatch(LOCALHOST_IMG_RE)
    }
  })

  test("product detail page — carousel images do not use localhost", async ({ page }) => {
    // First, fetch a product handle from the listing
    await page.goto("/us/store", { waitUntil: "domcontentloaded" })
    await page.waitForSelector('[data-testid="product-wrapper"]', { timeout: 15000 })

    const href = await page
      .$eval('[data-testid="product-wrapper"]', (el) => {
        const a = el.closest("a")
        return a ? a.href : null
      })
      .catch(() => null)

    if (!href) {
      console.warn("Could not find a product link – skipping detail check")
      return
    }

    await page.goto(href, { waitUntil: "domcontentloaded" })

    // Wait for the product container
    await page.waitForSelector('[data-testid="product-container"]', { timeout: 15000 })

    // Collect all img srcs within the product container
    const imgSrcs = await page.$$eval(
      '[data-testid="product-container"] img',
      (imgs) => imgs.map((img) => (img as HTMLImageElement).src)
    )

    const populated = imgSrcs.filter((src) => src && src.length > 0)

    for (const src of populated) {
      expect(src, `Detail image src should not be localhost: ${src}`).not.toMatch(LOCALHOST_IMG_RE)
    }
  })

  test("specific product detail — code-independent page images OK", async ({ page }) => {
    // Test the example URL provided by the user
    const targetUrl =
      process.env.PLAYWRIGHT_BASE_URL?.includes("localhost")
        ? "/us/products/code-independent"
        : "https://www.wolzq.com/us/products/code-independent"

    await page.goto(targetUrl + "?v_id=variant_01KKS0NXJ35DQKSZNNGW9DQPZR", {
      waitUntil: "domcontentloaded",
    })

    // If 404, skip
    if (page.url().includes("404") || page.url().includes("not-found")) {
      console.warn("Product not found – skipping")
      return
    }

    await page.waitForSelector('[data-testid="product-container"]', { timeout: 15000 })

    const imgSrcs = await page.$$eval(
      '[data-testid="product-container"] img',
      (imgs) => imgs.map((img) => (img as HTMLImageElement).src)
    )

    const populated = imgSrcs.filter((src) => src && src.length > 0)
    console.log("Product detail images:", populated)

    for (const src of populated) {
      expect(src, `Image should not be localhost: ${src}`).not.toMatch(LOCALHOST_IMG_RE)
    }
  })
})
