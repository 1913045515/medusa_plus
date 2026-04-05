import { listCollections } from "@lib/data/collections"
import { Text } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex w-full mb-16 mt-8 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} wolzq. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
