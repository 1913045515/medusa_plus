import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { getStoreSettings } from "@lib/data/store-settings"
import { getMenuItems } from "@lib/data/menu-items"
import { retrieveCustomer } from "@lib/data/customer"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchModal from "@modules/layout/components/search-modal"

const DEFAULT_PRIMARY_MENU_ITEMS = [
  { id: "store", title: "Shop", href: "/store", target: "_self", is_visible: true },
  { id: "courses", title: "Courses", href: "/courses", target: "_self", is_visible: true },
  { id: "blog", title: "Journal", href: "/blog", target: "_self", is_visible: true },
]

export default async function Nav() {
  const [regions, locales, currentLocale, storeSettings, menuItems, customer] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    getStoreSettings(),
    getMenuItems("front"),
    retrieveCustomer().catch(() => null),
  ])
  const cartEnabled = storeSettings.cartEnabled
  const primaryMenuItems = (menuItems.length ? menuItems : DEFAULT_PRIMARY_MENU_ITEMS)
    .filter((item) => item.is_visible && item.href !== "/" && item.href !== "/account")
    .slice(0, 5)
  const accountLabel = customer ? "Account" : "Sign in"

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="border-b border-[#dac7b0] bg-[rgba(251,247,241,0.96)] shadow-[0_8px_24px_rgba(52,38,19,0.06)] backdrop-blur-xl">
        <nav className="content-container flex min-h-[70px] items-center gap-3 py-3 text-sm text-[#34291f] lg:min-h-[78px] lg:gap-4 lg:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-[250px] lg:flex-none">
            <div className="lg:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                cartEnabled={cartEnabled}
                menuItems={menuItems}
                customerEmail={customer?.email ?? null}
              />
            </div>

            <LocalizedClientLink
              href="/"
              className="group flex min-w-0 flex-col text-[#241d16]"
              data-testid="nav-store-link"
            >
              <span className="truncate text-[1.02rem] font-semibold tracking-[0.12em] uppercase text-[#241d16] transition-colors group-hover:text-[#5b4631] sm:text-[1.1rem] lg:text-[1.2rem]">
                Cross Stand
              </span>
            </LocalizedClientLink>
          </div>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-[#deccb5] bg-white/90 px-3 py-2 shadow-[0_16px_40px_rgba(59,42,20,0.08)]">
              {primaryMenuItems.map((item) => (
                <LocalizedClientLink
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  className="rounded-full px-4 py-2 text-[12px] font-semibold tracking-[0.18em] uppercase text-[#564430] transition-all duration-200 hover:bg-[#efe3d0] hover:text-[#211810]"
                  data-testid={`desktop-nav-${item.id}-link`}
                >
                  {item.title}
                </LocalizedClientLink>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 lg:max-w-[360px] lg:flex-none">
            <div className="hidden items-center rounded-full border border-[#deccb5] bg-white/90 px-3 py-2 shadow-[0_12px_24px_rgba(74,53,24,0.06)] md:flex">
              <SearchModal locale={currentLocale} />
            </div>
            <LocalizedClientLink
              href="/account"
              className="hidden rounded-full border border-[#dbc7ae] bg-white/90 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#4f3f2e] transition-colors hover:border-[#ccb695] hover:bg-[#f7efe1] sm:inline-flex"
              data-testid="nav-account-link"
            >
              {accountLabel}
            </LocalizedClientLink>
            <div className="md:hidden">
              <SearchModal locale={currentLocale} />
            </div>
            {cartEnabled && (
              <div className="rounded-full border border-[#dbc7ae] bg-white/90 px-4 py-2 shadow-[0_12px_30px_rgba(74,53,24,0.07)]">
                <Suspense
                  fallback={
                    <LocalizedClientLink
                      className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#4f3f2e]"
                      href="/cart"
                      data-testid="nav-cart-link"
                    >
                      Cart (0)
                    </LocalizedClientLink>
                  }
                >
                  <CartButton />
                </Suspense>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-[#eadbc7] bg-[#f8f2e9] lg:hidden">
          <div className="content-container flex gap-2 overflow-x-auto py-2 pr-1 no-scrollbar">
            {primaryMenuItems.map((item) => (
              <LocalizedClientLink
                key={item.id}
                href={item.href}
                target={item.target}
                className="whitespace-nowrap rounded-full border border-[#e0ceb8] bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5c4a37] shadow-[0_8px_18px_rgba(74,53,24,0.04)] sm:px-4 sm:text-[11px]"
                data-testid={`mobile-nav-${item.id}-link`}
              >
                {item.title}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </header>
    </div>
  )
}
