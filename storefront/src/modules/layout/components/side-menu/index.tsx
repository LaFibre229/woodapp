"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SideMenuItems: [string, string][] = [
  ["Home", "/"],
  ["Legna da ardere", "/categories/legna-da-ardere"],
  ["Pellet", "/categories/pellet"],
  ["Stufe", "/categories/stufe"],
  ["Tutti i prodotti", "/store"],
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
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-[51] inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(3,7,18,0.6)] rounded-rounded justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button
                        data-testid="close-menu-button"
                        aria-label="Chiudi menu"
                        onClick={close}
                      >
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-4 items-start justify-start">
                      {SideMenuItems.map(([name, href]) => (
                        <li key={href}>
                          <LocalizedClientLink
                            href={href}
                            className="text-2xl leading-9 hover:text-ui-fg-disabled"
                            onClick={close}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                    <Text className="flex justify-between txt-compact-small">
                      © {new Date().getFullYear()} {companyName}
                    </Text>
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
