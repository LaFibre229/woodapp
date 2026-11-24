"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { BarsThree, XMark } from "@medusajs/icons"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/common/components/logo"

const MainItems: [string, string][] = [
  ["Legna da ardere", "/categories/legna-da-ardere"],
  ["Pellet", "/categories/pellet"],
  ["Stufe", "/categories/stufe"],
  ["Tutti i prodotti", "/store"],
]

const OtherItems: [string, string][] = [
  ["Preventivo camion", "/preventivo"],
  ["Zone di consegna", "/consegne"],
  ["Contatti", "/contatti"],
  ["Il mio account", "/account"],
  ["Carrello", "/cart"],
]

const SideMenu = ({ companyName }: { companyName: string }) => {
  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  aria-label="Apri menu"
                  className="relative h-full flex items-center -ml-2 px-2 text-bark-800 focus:outline-none"
                >
                  <BarsThree />
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-bark-900/40 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-x-4"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-4"
              >
                <PopoverPanel className="fixed left-0 top-0 h-[100dvh] w-[86%] max-w-sm z-[51] text-cream-50">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-bark-900 justify-between p-6 shadow-2xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-10" id="xmark">
                        <Logo tone="light" />
                        <button
                          data-testid="close-menu-button"
                          aria-label="Chiudi menu"
                          onClick={close}
                          className="p-2 -mr-2"
                        >
                          <XMark />
                        </button>
                      </div>
                      <ul className="flex flex-col gap-1">
                        {MainItems.map(([name, href]) => (
                          <li key={href}>
                            <LocalizedClientLink
                              href={href}
                              className="block font-display text-[28px] leading-[44px] hover:text-ember-300"
                              onClick={close}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                      <div className="h-px bg-cream-50/15 my-6" />
                      <ul className="flex flex-col gap-3 text-[15px] text-cream-200">
                        {OtherItems.map(([name, href]) => (
                          <li key={href}>
                            <LocalizedClientLink
                              href={href}
                              className="hover:text-ember-300"
                              onClick={close}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-[12px] text-cream-300/70">
                      © {new Date().getFullYear()} {companyName}
                    </p>
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
