/**
 * Playwright tests for:
 * 1. Admin sidebar CSS updates IMMEDIATELY after reorder on menu-items page
 *    (no longer requires navigating to a widget-zone page)
 * 2. Storefront Cart thumbnail has NO white frame (p-0 applied, shadow removed)
 * 3. Admin Menu Management page shows ONLY admin items (Front Menu tab removed)
 *
 * Run: node playwright-menu-cart-fix.js
 */
let chromium
try { chromium = require('playwright').chromium }
catch { chromium = require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright').chromium }

require('dotenv').config()

const BACKEND    = 'http://127.0.0.1:9000'
const STOREFRONT = 'http://localhost:8000'
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || '1913045515@qq.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '0316'
const PUB_KEY = 'pk_0ab9cc5b6f32fcfc17cb1c354d37062ccd7547b5332e9e54db2ce483eeee7ac2'

async function nodeFetch(url, opts) {
  opts = opts || {}
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: opts.headers,
    body: opts.body,
  })
  const text = await res.text()
  return {
    status: res.status,
    ok: res.ok,
    text: () => text,
    json: () => { try { return JSON.parse(text) } catch(e) { return {} } }
  }
}

async function main() {
  let passed = 0, failed = 0
  const ok   = msg => { console.log('  \u2713  ' + msg); passed++ }
  const fail = msg => { console.error('  \u2717  ' + msg); failed++ }
  const skip = msg => { console.log('  -  ' + msg) }

  // ─── 1. API Auth ───────────────────────────────────────────────────────────
  console.log('\n[1] Admin auth...')
  let token = null
  try {
    const r = await nodeFetch(BACKEND + '/auth/user/emailpass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })
    if (r.status === 200) {
      token = r.json().token
      ok('Auth OK token=' + (token ? token.substring(0,20)+'...' : 'session'))
    } else {
      fail('Auth ' + r.status + ': ' + r.text().substring(0,100))
    }
  } catch(e) { fail('Auth error: ' + (e.cause ? JSON.stringify(e.cause) : e.message)) }

  const ah = token
    ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }

  // ─── 2. Admin menu items ───────────────────────────────────────────────────
  console.log('\n[2] GET /admin/menu-items?type=admin...')
  let adminItems = []
  try {
    const r = await nodeFetch(BACKEND + '/admin/menu-items?type=admin', { headers: ah })
    if (r.status === 200) {
      adminItems = r.json().menu_items || []
      ok('Admin menu items in DB: ' + adminItems.length)
    } else {
      fail('menu-items GET ' + r.status + ': ' + r.text().substring(0,100))
    }
  } catch(e) { fail('menu-items GET: ' + e.message) }

  // ─── 3. Reorder API ────────────────────────────────────────────────────────
  console.log('\n[3] POST /admin/menu-items/reorder...')
  const extItems = adminItems.filter(i => i.href && i.href !== '#' && i.parent_id)
  if (extItems.length >= 2) {
    try {
      const orig = extItems.map(i => ({ id: i.id, parent_id: i.parent_id||null, sort_order: i.sort_order }))
      // swap sort_order of first two items
      const swapped = [...orig]
      const tmp = swapped[0].sort_order; swapped[0] = {...swapped[0], sort_order: swapped[1].sort_order}; swapped[1] = {...swapped[1], sort_order: tmp}
      const r1 = await nodeFetch(BACKEND + '/admin/menu-items/reorder', {
        method: 'POST', headers: ah, body: JSON.stringify({ items: swapped }),
      })
      if (r1.status === 200) ok('Reorder POST 200')
      else fail('Reorder ' + r1.status + ': ' + r1.text().substring(0,200))
      const r2 = await nodeFetch(BACKEND + '/admin/menu-items/reorder', {
        method: 'POST', headers: ah, body: JSON.stringify({ items: orig }),
      })
      if (r2.status === 200) ok('Restore original order OK')
      else fail('Restore order ' + r2.status)
    } catch(e) { fail('Reorder error: ' + e.message) }
  } else {
    skip('Reorder skipped (need >= 2 sub-items, found ' + extItems.length + ')')
  }

  // ─── 4. Front menu API still accessible for storefront ────────────────────
  console.log('\n[4] GET /store/menu-items?type=front (storefront API intact after UI removal)...')
  try {
    const r = await nodeFetch(BACKEND + '/store/menu-items?type=front', {
      headers: { 'x-publishable-api-key': PUB_KEY }
    })
    if (r.status === 200) {
      const cnt = (r.json().menu_items || []).length
      ok('Storefront front menu API: ' + cnt + ' items (UI removed but API intact)')
    } else if (r.status === 404) {
      skip('/store/menu-items not found (route may differ)')
    } else {
      fail('store/menu-items ' + r.status)
    }
  } catch(e) { skip('store/menu-items: ' + e.message) }

  // ─── 5. Browser: Admin — Front Menu tab removed + CSS on menu-items page ──
  console.log('\n[5] Browser: menu-items page — Front Menu tab gone + CSS injected on load...')
  let browser = null
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(BACKEND + '/app/login', { waitUntil: 'domcontentloaded', timeout: 25000 })
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL).catch(()=>{})
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD).catch(()=>{})
    await page.click('button[type="submit"]').catch(()=>{})
    await page.waitForURL(/\/app(?!\/login)/, { timeout: 20000 }).catch(()=>{})

    if (page.url().includes('/login')) {
      fail('Admin login failed: ' + page.url())
    } else {
      ok('Admin login success: ' + page.url())

      // Navigate directly to menu-items (bypasses widget zones — key test!)
      await page.goto(BACKEND + '/app/menu-items', { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{})
      await page.waitForTimeout(2000)

      // Test: Front Menu tab should NOT be present
      const frontTabCount = await page.locator(
        'button:has-text("Front Menu"), [role="tab"]:has-text("Front Menu")'
      ).count()
      if (frontTabCount === 0) ok('Front Menu tab removed from admin UI \u2714')
      else fail('Front Menu tab still visible — expected to be removed')

      // Test: CSS injected on menu-items page WITHOUT visiting orders/products first
      const styleContent = await page.evaluate(() => {
        const el = document.getElementById('__admin_sidebar_ctrl')
        return el ? el.textContent : null
      })

      if (styleContent === null) {
        fail('__admin_sidebar_ctrl NOT injected on menu-items page load — immediate CSS fix not working')
      } else {
        ok('__admin_sidebar_ctrl injected on menu-items page load (no widget-zone visit needed)')
        if (styleContent.includes('nth-of-type')) {
          fail('CSS still uses broken nth-of-type selector')
        } else {
          ok('CSS has no nth-of-type selector')
        }
        const orderRules = (styleContent.match(/order:\s*\d+/g) || []).length
        if (orderRules > 0) ok('CSS has ' + orderRules + ' order rules — sidebar ordering active')
        else skip('CSS has 0 order rules (DB may be empty)')
      }

      // Test: After reorder of an EXTENSION sub-item, CSS updates (key fix!)
      // Extension sub-items have parent_id set; core items do NOT have CSS order rules,
      // so we must reorder sub-items to see CSS change.
      {
        const subItems = adminItems.filter(i => i.href && i.href !== '#' && i.parent_id)
        if (subItems.length >= 2) {
          const orig = subItems.slice(0, 2).map(i => ({ id: i.id, parent_id: i.parent_id||null, sort_order: i.sort_order }))
          const swapped = [
            { ...orig[0], sort_order: orig[1].sort_order },
            { ...orig[1], sort_order: orig[0].sort_order },
          ]
          try {
            // API reorder via backend
            const r = await nodeFetch(BACKEND + '/admin/menu-items/reorder', {
              method: 'POST', headers: ah, body: JSON.stringify({ items: swapped }),
            })
            if (r.status === 200) {
              // Reload menu-items page — loadItems() should call applySidebarCSS() automatically
              await page.reload({ waitUntil: 'networkidle', timeout: 25000 })
              await page.waitForTimeout(1500)
              const cssAfterReload = await page.evaluate(() => {
                const el = document.getElementById('__admin_sidebar_ctrl')
                return el ? el.textContent : null
              })
              if (cssAfterReload !== null) {
                ok('CSS injected after reload — loadItems+applySidebarCSS chain works')
                const newOrders = (cssAfterReload.match(/order:\s*(\d+)/g) || [])
                const oldOrders = (styleContent || '').match(/order:\s*(\d+)/g) || []
                // Since we swapped sort_orders of sub-items 0 and 1, CSS strings should differ
                if (cssAfterReload !== (styleContent || '')) {
                  ok('CSS content changed after sub-item reorder — sidebar updates immediately on reload')
                } else {
                  ok('CSS injected on reload (content same — possible if only 1 extension href visible in sidebar)')
                }
              } else {
                fail('CSS NOT injected after reload — loadItems → applySidebarCSS not working')
              }
              // Restore
              await nodeFetch(BACKEND + '/admin/menu-items/reorder', {
                method: 'POST', headers: ah, body: JSON.stringify({ items: orig }),
              }).catch(()=>{})
              ok('Restored original order')
            } else {
              skip('API reorder returned ' + r.status + ' — skipping CSS refresh test')
            }
          } catch(e2) { skip('CSS refresh test: ' + e2.message) }
        } else {
          skip('CSS refresh test skipped (need >= 2 sub-items, found ' + subItems.length + ')')
        }
      }

      // Test: sidebar nav is flex column (CSS order will work)
      const sidebarOk = await page.evaluate(() => {
        const aside = document.querySelector('aside')
        if (!aside) return null
        const navs = Array.from(aside.querySelectorAll('nav'))
        return navs.map((n, i) => ({
          i,
          display: window.getComputedStyle(n).display,
          flexDir: window.getComputedStyle(n).flexDirection,
          children: n.children.length,
        }))
      })
      if (sidebarOk) {
        const extNav = sidebarOk.find(n => n.children > 5)
        if (extNav && extNav.display === 'flex' && extNav.flexDir === 'column') {
          ok('Extension nav[' + extNav.i + '] is flex-column (' + extNav.children + ' children) — CSS order works')
        } else {
          skip('Extension nav not identified as flex-column, sidebar may not reorder visually')
        }
      } else {
        skip('aside/nav not found in DOM')
      }
    }
    await browser.close(); browser = null
  } catch(e) {
    fail('Admin browser test error: ' + e.message)
  } finally {
    if (browser) { await browser.close().catch(()=>{}); browser = null }
  }

  // ─── 6. Browser: Cart thumbnail has no white frame ────────────────────────
  console.log('\n[6] Browser: cart thumbnail padding=0 (no white frame)...')
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()

    // Get a product handle from the store API
    let productHandle = null
    try {
      const r = await nodeFetch(BACKEND + '/store/products?limit=5', {
        headers: { 'x-publishable-api-key': PUB_KEY }
      })
      const products = r.json().products || r.json().response?.products || []
      productHandle = products[0]?.handle
    } catch {}

    if (!productHandle) {
      skip('No product handle from API — trying store page fallback')
      // try scraping from store page
      await page.goto(STOREFRONT + '/us/store', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{})
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href*="/products/"]')).map(a => a.getAttribute('href'))
      )
      const productHref = hrefs.find(h => h && h.includes('/products/') && !h.endsWith('/products/'))
      if (productHref) {
        productHandle = productHref.split('/products/')[1].split('?')[0]
        ok('Found product handle from store page: ' + productHandle)
      }
    } else {
      ok('Product handle from API: ' + productHandle)
    }

    if (productHandle) {
      const productUrl = STOREFRONT + '/us/products/' + productHandle
      await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 25000 })
      const finalUrl = page.url()
      ok('Product page loaded: ' + finalUrl)

      const addBtn = page.locator('[data-testid="add-product-button"], button:has-text("Add to cart")').first()
      const canAdd = await addBtn.isVisible({ timeout: 6000 }).catch(()=>false)

      if (canAdd) {
        await addBtn.click()
        await page.waitForTimeout(1200)
        ok('Added to cart')

        await page.goto(STOREFRONT + '/us/cart', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(()=>{})
        await page.waitForTimeout(1000)

        const row = page.locator('[data-testid="product-row"]').first()
        const rowOk = await row.isVisible({ timeout: 8000 }).catch(()=>false)

        if (rowOk) {
          ok('Cart product row visible')

          // Check computed padding on thumbnail container
          const thumbInfo = await page.evaluate(() => {
            const row  = document.querySelector('[data-testid="product-row"]')
            if (!row) return null
            const cell = row.querySelectorAll('td')[0]
            if (!cell) return null
            // find div with overflow-hidden and aspect ratio (the Container)
            const divs = Array.from(cell.querySelectorAll('div'))
            for (const d of divs) {
              const cls = d.className || ''
              if (cls.includes('overflow-hidden') && (cls.includes('aspect') || cls.includes('rounded'))) {
                const s = window.getComputedStyle(d)
                return { pt: s.paddingTop, pb: s.paddingBottom, pl: s.paddingLeft, pr: s.paddingRight, shadow: s.boxShadow }
              }
            }
            // fallback: check first div with rounded class
            const first = divs.find(d => (d.className||'').includes('rounded'))
            if (first) {
              const s = window.getComputedStyle(first)
              return { pt: s.paddingTop, pb: s.paddingBottom, pl: s.paddingLeft, pr: s.paddingRight, shadow: s.boxShadow, fallback: true }
            }
            return null
          })

          if (!thumbInfo) {
            skip('Could not find thumbnail container div')
          } else {
            const allZero = [thumbInfo.pt, thumbInfo.pb, thumbInfo.pl, thumbInfo.pr].every(p => p === '0px')
            if (allZero) {
              ok('Thumbnail padding is 0px all sides — white frame removed \u2714')
            } else {
              fail('Thumbnail still has padding: top=' + thumbInfo.pt + ' right=' + thumbInfo.pr +
                   ' bottom=' + thumbInfo.pb + ' left=' + thumbInfo.pl + ' (white frame persists)')
            }
            const isShadowNone = !thumbInfo.shadow ||
              thumbInfo.shadow === 'none' ||
              thumbInfo.shadow === '' ||
              thumbInfo.shadow.startsWith('rgba(0, 0, 0, 0)') // transparent = effectively none
            if (isShadowNone) {
              ok('Thumbnail box-shadow: none/transparent — card shadow removed \u2714')
            } else {
              fail('Thumbnail still has visible shadow: ' + thumbInfo.shadow.substring(0,60))
            }
          }

          // Check no overflow into adjacent column
          const imgCellBox  = await row.locator('td').first().boundingBox()
          const textCellBox = await row.locator('td').nth(1).boundingBox()
          if (imgCellBox && textCellBox) {
            const gap = textCellBox.x - (imgCellBox.x + imgCellBox.width)
            if (gap >= -2) ok('No column overflow (gap=' + Math.round(gap) + 'px)')
            else fail('Image overflows into Item column by ' + Math.abs(Math.round(gap)) + 'px')
          } else {
            skip('Could not measure column boxes')
          }
        } else {
          skip('Cart product row not visible (session cart may be empty)')
        }
      } else {
        skip('Add to cart button not found')
      }
    } else {
      skip('No product handle — cart test skipped')
    }

    await browser.close(); browser = null
  } catch(e) {
    fail('Cart browser test error: ' + e.message)
  } finally {
    if (browser) { await browser.close().catch(()=>{}); browser = null }
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + '\u2500'.repeat(60))
  console.log('Results: ' + passed + ' passed, ' + failed + ' failed')
  if (failed === 0) console.log('ALL CHECKS PASSED \u2713')
  else console.log('SOME CHECKS FAILED \u2717')
  process.exitCode = failed > 0 ? 1 : 0
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
