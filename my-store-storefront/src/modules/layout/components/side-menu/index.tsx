"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark, ChevronDown } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment, useState, useEffect } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"
import type { MenuItemData } from "@lib/data/menu-items"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  cartEnabled?: boolean
  menuItems?: MenuItemData[]
  customerEmail?: string | null
}

const TICKET_LAST_VIEWED_PREFIX = "ticket_last_viewed_"
const TICKET_UNREAD_PREFIX = "ticket_unread_"

/**
 * Fetches /store/tickets and returns true if any ticket has an unread admin reply.
 * Falls back to guest_token from localStorage when customerEmail is not provided.
 * Polling interval: 30 s (lightweight – only nav badge, not the chat view).
 */
function useHasUnreadTickets(customerEmail?: string | null): boolean {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
    const PUB_KEY =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY ??
      ""

    const check = async () => {
      if (typeof window === "undefined") return
      const guestToken = localStorage.getItem("ticket_guest_token")
      if (!customerEmail && !guestToken) {
        setHasUnread(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (customerEmail) params.set("customer_email", customerEmail)
        else if (guestToken) params.set("guest_token", guestToken)

        const res = await fetch(`${BACKEND}/store/tickets?${params}`, {
          credentials: "include",
          headers: { "x-publishable-api-key": PUB_KEY },
        })
        if (!res.ok) return

        const data = await res.json()
        const tickets: Array<{ id: string; last_admin_reply_at?: string | null }> =
          data.tickets ?? []

        let anyUnread = false
        for (const t of tickets) {
          if (!t.last_admin_reply_at) {
            localStorage.removeItem(TICKET_UNREAD_PREFIX + t.id)
            continue
          }
          const lastViewedMs = parseInt(
            localStorage.getItem(TICKET_LAST_VIEWED_PREFIX + t.id) ?? "0",
            10
          )
          const isUnread = new Date(t.last_admin_reply_at).getTime() > lastViewedMs
          if (isUnread) {
            anyUnread = true
            localStorage.setItem(TICKET_UNREAD_PREFIX + t.id, "1")
          } else {
            localStorage.removeItem(TICKET_UNREAD_PREFIX + t.id)
          }
        }
        setHasUnread(anyUnread)
      } catch {
        // Silently ignore – nav badge is non-critical
      }
    }

    check()
    // Re-check every 30 s (nav badge doesn't need to be as aggressive as the chat view)
    const timer = setInterval(check, 30_000)
    // Sync immediately when storage changes in another tab (e.g. user reads a ticket)
    const onStorage = () => { check() }
    window.addEventListener("storage", onStorage)
    return () => {
      clearInterval(timer)
      window.removeEventListener("storage", onStorage)
    }
  }, [customerEmail])

  return hasUnread
}

// Fallback hardcoded items when DB is unavailable
const FALLBACK_ITEMS: MenuItemData[] = [
  { id: "home", menu_type: "front", title: "首页", href: "/", icon: null, parent_id: null, sort_order: 0, is_visible: true, target: "_self" },
  { id: "store", menu_type: "front", title: "商店", href: "/store", icon: null, parent_id: null, sort_order: 1, is_visible: true, target: "_self" },
  { id: "courses", menu_type: "front", title: "课程", href: "/courses", icon: null, parent_id: null, sort_order: 2, is_visible: true, target: "_self" },
  { id: "blog", menu_type: "front", title: "博客", href: "/blog", icon: null, parent_id: null, sort_order: 3, is_visible: true, target: "_self" },
  { id: "account", menu_type: "front", title: "账户", href: "/account", icon: null, parent_id: null, sort_order: 4, is_visible: true, target: "_self" },
]

function MenuItemRow({ item, close, hasUnread }: { item: MenuItemData; close: () => void; hasUnread?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  // Show unread badge if this item links to support/tickets
  const isSupport = item.href?.includes("/support") || item.href?.includes("/ticket")

  return (
    <li>
      <div className="flex items-center gap-2">
        <LocalizedClientLink
          href={item.href}
          className="flex-1 flex items-center gap-2 rounded-lg px-2 py-2 text-2xl font-medium leading-8 transition-colors hover:bg-white/10 hover:text-ui-fg-disabled sm:text-[1.75rem] sm:leading-9"
          onClick={close}
          target={item.target}
          data-testid={`menu-${item.id}-link`}
        >
          {item.title}
          {isSupport && hasUnread && (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mb-auto mt-2" title="有未读消息" />
          )}
        </LocalizedClientLink>
        {hasChildren && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="展开子菜单"
          >
            <ChevronDown className={clx("w-4 h-4 transition-transform duration-200", expanded ? "rotate-180" : "")} />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <ul className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/20 pl-3">
          {item.children!.map((child) => (
            <li key={child.id}>
              <LocalizedClientLink
                href={child.href}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-base font-medium transition-colors hover:bg-white/10 hover:text-ui-fg-disabled"
                onClick={close}
                target={child.target}
                data-testid={`menu-${child.id}-link`}
              >
                {child.title}
                {(child.href?.includes("/support") || child.href?.includes("/ticket")) && hasUnread && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 shrink-0" title="有未读消息" />
                )}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

const SideMenu = ({ regions, locales, currentLocale, cartEnabled = true, menuItems, customerEmail }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const hasUnread = useHasUnreadTickets(customerEmail)

  const items = (menuItems && menuItems.length > 0) ? menuItems : FALLBACK_ITEMS

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base"
                >
                  Menu
                  {hasUnread && !open && (
                    <span className="absolute top-3 -right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                  )}
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/0 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="fixed inset-y-0 left-0 z-[51] flex w-[min(88vw,360px)] max-w-full p-2 text-sm text-ui-fg-on-color backdrop-blur-2xl sm:w-1/3 sm:max-w-[420px] sm:p-4 2xl:w-1/4">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-rounded bg-[rgba(3,7,18,0.72)] px-4 py-4 shadow-2xl sm:px-5 sm:py-5"
                  >
                    <div className="mb-3 flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close} className="rounded-full p-1 transition-colors hover:bg-white/10">
                        <XMark />
                      </button>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-y-4">
                      <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 no-scrollbar">
                        {items
                          .filter((item) => item.is_visible)
                          .map((item) => (
                            <MenuItemRow key={item.id} item={item} close={close} hasUnread={hasUnread} />
                          ))}
                      </ul>
                      <div className="border-t border-white/10" />
                      <div className="flex flex-col gap-y-4 pb-1 text-ui-fg-subtle">
                      {!!locales?.length && (
                        <div
                          className="flex items-start justify-between gap-3"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex items-start justify-between gap-3"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "mt-1 flex-shrink-0 transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="txt-compact-small text-ui-fg-subtle/90">
                        © {new Date().getFullYear()} wolzq. All rights
                        reserved.
                      </Text>
                      </div>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
