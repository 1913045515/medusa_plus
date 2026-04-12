"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Courses: "/courses",
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  cartEnabled?: boolean
}

const SideMenu = ({ regions, locales, currentLocale, cartEnabled = true }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

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
                        {Object.entries(SideMenuItems)
                          .filter(([name]) => cartEnabled || name !== "Cart")
                          .map(([name, href]) => {
                          return (
                            <li key={name}>
                              <LocalizedClientLink
                                href={href}
                                className="block rounded-lg px-2 py-2 text-2xl font-medium leading-8 transition-colors hover:bg-white/10 hover:text-ui-fg-disabled sm:text-[1.75rem] sm:leading-9"
                                onClick={close}
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
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
