import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 py-8 sm:py-12" data-testid="account-page">
      <div className="content-container flex h-full w-full flex-col gap-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
        <div className="flex flex-col gap-6 rounded-[24px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.06)] sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-8">
          <div>
            <h3 className="text-xl-semi mb-4">Got questions?</h3>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
