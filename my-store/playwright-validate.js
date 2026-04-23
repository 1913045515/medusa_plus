// Validation tests: API-level + browser storefront check
// Run: node playwright-validate.js
let chromium
try { chromium = require('playwright').chromium }
catch { chromium = require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright').chromium }

require('dotenv').config()

const BACKEND    = 'http://127.0.0.1:9000'
const STOREFRONT = 'http://localhost:8000'
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'test-pw@medusa.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TestPass1234!'

const PUB_KEY = 'pk_0ab9cc5b6f32fcfc17cb1c354d37062ccd7547b5332e9e54db2ce483eeee7ac2'

// Use Node.js 18+ built-in fetch (undici) – handles dual-stack correctly on Windows
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
  const ok   = msg => { console.log('  OK  ' + msg); passed++ }
  const fail = msg => { console.error('  FAIL ' + msg); failed++ }

  // 1. Auth
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
      ok('Admin auth OK, token=' + (token ? token.substring(0,20)+'...' : 'none'))
    } else {
      fail('Auth ' + r.status + ': ' + r.text().substring(0,100))
    }
  } catch(e) { fail('Auth error: ' + (e.cause ? JSON.stringify(e.cause) : e.message)) }

  const ah = token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : {}

  // 2. content-pages
  console.log('\n[2] GET /admin/content-pages ...')
  try {
    const r = await nodeFetch(BACKEND + '/admin/content-pages', { headers: ah })
    if (r.status === 200) {
      const b = r.json()
      ok('content-pages 200, count=' + (b.count !== undefined ? b.count : (b.content_pages||[]).length))
    } else {
      fail('content-pages ' + r.status + ': ' + r.text().substring(0,200))
    }
  } catch(e) { fail('content-pages error: ' + e.message) }

  // 3. file-assets
  console.log('\n[3] GET /admin/file-assets ...')
  try {
    const r = await nodeFetch(BACKEND + '/admin/file-assets?limit=20&offset=0', { headers: ah })
    if (r.status === 200) {
      const b = r.json()
      ok('file-assets 200, count=' + (b.count !== undefined ? b.count : (b.file_assets||[]).length))
    } else {
      fail('file-assets ' + r.status + ': ' + r.text().substring(0,200))
    }
  } catch(e) { fail('file-assets error: ' + e.message) }

  // 3b. file-assets URL endpoint (if any files exist)
  console.log('\n[3b] GET /admin/file-assets/:id/url (if file exists) ...')
  try {
    const r = await nodeFetch(BACKEND + '/admin/file-assets?limit=1&offset=0', { headers: ah })
    if (r.status === 200) {
      const b = r.json()
      const items = b.file_assets || []
      if (items.length > 0) {
        const firstId = items[0].id
        // Check is_public field exists in response
        const hasIsPublic = items[0].is_public !== undefined
        if (!hasIsPublic) fail('file-assets response missing is_public field (migration may not have run)')
        else ok('file-assets response has is_public field=' + items[0].is_public)
        const r2 = await nodeFetch(BACKEND + '/admin/file-assets/' + firstId + '/url', { headers: ah })
        if (r2.status === 200) {
          const b2 = r2.json()
          if (b2.url) ok('file-assets URL endpoint OK, url starts with=' + b2.url.substring(0, 40))
          else fail('URL endpoint returned no url field')
        } else {
          fail('file-assets URL endpoint ' + r2.status + ': ' + r2.text().substring(0, 200))
        }
      } else {
        ok('file-assets URL endpoint skipped (no files exist)')
      }
    } else {
      fail('file-assets list for URL test: ' + r.status)
    }
  } catch(e) { fail('file-assets URL error: ' + e.message) }

  // 3c. admin menu items API
  console.log('\n[3c] GET /admin/menu-items?type=admin ...')
  try {
    const r = await nodeFetch(BACKEND + '/admin/menu-items?type=admin', { headers: ah })
    if (r.status === 200) {
      const b = r.json()
      const cnt = (b.menu_items||[]).length
      ok('admin menu-items: ' + cnt + ' items in DB')
      // Check PayPal item exists with new /app/ path
      const all = b.menu_items || []
      const paypal = all.find(x => x.href === '/app/settings/paypal')
      if (paypal) ok('PayPal admin menu item present with /app/ path (id=' + paypal.id + ', visible=' + paypal.is_visible + ')')
      else fail('PayPal admin menu item missing or wrong path (expected /app/settings/paypal)')
      // Verify NO /a/ paths remain
      const oldPaths = all.filter(x => x.href && x.href.startsWith('/a/'))
      if (oldPaths.length === 0) ok('No legacy /a/ paths in admin menu (all use /app/ prefix)')
      else fail(oldPaths.length + ' legacy /a/ paths still in DB: ' + oldPaths.map(x=>x.href).join(', '))
      // Verify "扩展设置" parent exists
      const extParent = all.find(x => x.title === '扩展设置')
      if (extParent) {
        const children = all.filter(x => x.parent_id === extParent.id)
        if (children.length > 0) ok('扩展设置 parent has ' + children.length + ' children (extensions grouped)')
        else fail('扩展设置 parent has no children')
      } else fail('扩展设置 parent missing')
    } else {
      fail('admin menu-items ' + r.status + ': ' + r.text().substring(0, 200))
    }
  } catch(e) { fail('admin menu-items error: ' + e.message) }

  // 3d. file upload to public bucket
  console.log('\n[3d] POST /admin/file-assets with is_public=true ...')
  let createdFileId = null
  try {
    // Create a minimal 1x1 PNG via base64
    const pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    const buf = Buffer.from(pngB64, 'base64')
    const fd = new FormData()
    fd.append('file', new Blob([buf], { type: 'image/png' }), 'pw-test-public.png')
    fd.append('is_public', 'true')
    const r = await fetch(BACKEND + '/admin/file-assets', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: fd,
    })
    const j = await r.json().catch(()=>({}))
    if (r.status === 201) {
      const asset = j.file_asset
      createdFileId = asset.id
      if (asset.is_public === true) ok('Public upload OK, is_public=true, bucket=' + asset.s3_bucket)
      else fail('Public upload returned is_public=' + asset.is_public + ' (expected true)')
    } else {
      fail('Public upload ' + r.status + ': ' + JSON.stringify(j).substring(0, 200))
    }
  } catch(e) { fail('Public upload error: ' + e.message) }

  // 3e. URL endpoint for the public file should return permanent (not temporary)
  if (createdFileId) {
    console.log('\n[3e] GET /admin/file-assets/:id/url for public file ...')
    try {
      const r = await nodeFetch(BACKEND + '/admin/file-assets/' + createdFileId + '/url', { headers: ah })
      if (r.status === 200) {
        const b = r.json()
        if (b.is_temporary === false) ok('Public file URL returns is_temporary=false (permanent), url=' + b.url.substring(0, 60))
        else fail('Public file URL is_temporary=' + b.is_temporary + ' (expected false)')
      } else {
        fail('Public URL endpoint ' + r.status)
      }
    } catch(e) { fail('Public URL error: ' + e.message) }

    // Cleanup: delete test file
    await nodeFetch(BACKEND + '/admin/file-assets/' + createdFileId, { method: 'DELETE', headers: ah }).catch(()=>{})
    console.log('     (test file deleted)')
  }

  // 4. store menu-items
  console.log('\n[4] GET /store/menu-items?type=front ...')
  try {
    const r = await nodeFetch(BACKEND + '/store/menu-items?type=front', {
      headers: { 'x-publishable-api-key': PUB_KEY }
    })
    if (r.status === 200) {
      const b = r.json()
      const cnt = (b.menu_items||[]).length
      if (cnt > 0) ok('store menu-items front: ' + cnt + ' items from DB')
      else fail('store menu-items returned 0 items')
    } else {
      fail('store menu-items ' + r.status + ': ' + r.text().substring(0,100))
    }
  } catch(e) { fail('store menu-items error: ' + e.message) }

  // 5. create+update menu item
  console.log('\n[5] POST /admin/menu-items (create) ...')
  let createdId = null
  try {
    const r = await nodeFetch(BACKEND + '/admin/menu-items', {
      method: 'POST', headers: ah,
      body: JSON.stringify({ menu_type:'front', title:'PW-Test', href:'/pw-test', is_visible:true, target:'_self' }),
    })
    if (r.status === 201) {
      createdId = r.json().menu_item && r.json().menu_item.id
      ok('Menu item created id=' + createdId)
    } else {
      fail('Create ' + r.status + ': ' + r.text().substring(0,200))
    }
  } catch(e) { fail('Create error: ' + e.message) }

  if (createdId) {
    console.log('\n[6] PUT /admin/menu-items/:id (update) ...')
    try {
      const r = await nodeFetch(BACKEND + '/admin/menu-items/' + createdId, {
        method: 'PUT', headers: ah,
        body: JSON.stringify({ title: 'PW-Test-Updated', is_visible: false }),
      })
      if (r.status === 200) {
        const b = r.json()
        const updated = b.menu_item && b.menu_item.title
        ok('Menu item updated, title="' + updated + '"')
        if (updated !== 'PW-Test-Updated') fail('Title mismatch: got "' + updated + '"')
      } else {
        fail('Update ' + r.status + ': ' + r.text().substring(0,200))
      }
    } catch(e) { fail('Update error: ' + e.message) }

    console.log('\n[6b] POST /admin/menu-items/reorder ...')
    try {
      const listR = await nodeFetch(BACKEND + '/admin/menu-items?type=front', { headers: ah })
      const items = listR.json().menu_items || []
      if (items.length >= 2) {
        // Reverse sort order of first two items
        const reorderPayload = items.slice(0, 2).map((item, i) => ({
          id: item.id,
          parent_id: item.parent_id || null,
          sort_order: 1 - i,
        }))
        const rr = await nodeFetch(BACKEND + '/admin/menu-items/reorder', {
          method: 'POST', headers: ah,
          body: JSON.stringify({ items: reorderPayload }),
        })
        if (rr.status === 200) ok('Menu reorder OK')
        else fail('Reorder ' + rr.status + ': ' + rr.text().substring(0,200))
      } else {
        ok('Menu reorder skipped (need >= 2 items)')
      }
    } catch(e) { fail('Reorder error: ' + e.message) }

    // cleanup
    await nodeFetch(BACKEND + '/admin/menu-items/' + createdId, { method:'DELETE', headers:ah }).catch(()=>{})
    console.log('     (test item deleted)')
  }

  // 6c. Verify admin /app/* routes are reachable (HTML 200, not 404)
  console.log('\n[6c] HEAD /app/* admin routes (no auth needed for HTML shell) ...')
  const appRoutes = ['/app', '/app/blogs', '/app/file-assets', '/app/menu-items', '/app/content-pages']
  for (const path of appRoutes) {
    try {
      const r = await nodeFetch(BACKEND + path)
      if (r.status === 200) ok('GET ' + path + ' → 200')
      else fail('GET ' + path + ' → ' + r.status)
    } catch(e) { fail('GET ' + path + ' error: ' + e.message) }
  }

  // 7. browser check
  console.log('\n[7] Browser: storefront side menu ...')
  let browser = null
  try {
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(STOREFRONT, { waitUntil: 'domcontentloaded', timeout: 25000 })

    const btn = page.getByTestId('nav-menu-button')
    if (await btn.isVisible({ timeout: 8000 })) {
      await btn.click()
      await page.waitForTimeout(800)
      const fallback = await page.locator('text=首页').isVisible({ timeout: 2000 }).catch(()=>false)
      const dbLinks  = await page.locator('[data-testid^="menu-"]').count()
      if (!fallback && dbLinks > 0) {
        ok('Storefront shows ' + dbLinks + ' DB-driven menu items (no Chinese fallback)')
      } else if (fallback) {
        fail('Storefront still shows hardcoded Chinese fallback (restart storefront to pick up env fix)')
      } else {
        ok('Storefront side menu opened, no Chinese fallback detected')
      }
    } else {
      fail('nav-menu-button not found')
    }
  } catch(e) { fail('Browser error: ' + e.message) }
  finally { if (browser) await browser.close().catch(()=>{}) }

  console.log('\n' + '-'.repeat(55))
  console.log('Results: ' + passed + ' passed, ' + failed + ' failed')
  if (failed === 0) console.log('ALL CHECKS PASSED')
  process.exitCode = failed > 0 ? 1 : 0
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
