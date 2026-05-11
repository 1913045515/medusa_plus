"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  categories?: HttpTypes.StoreProductCategory[]
  selectedCategoryId?: string
  'data-testid'?: string
}

const RefinementList = ({ sortBy, categories, selectedCategoryId, 'data-testid': dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([name, value]) => {
        if (value === null) {
          params.delete(name)
        } else {
          params.set(name, value)
        }
      })
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString({ [name]: value })
    router.push(`${pathname}?${query}`)
  }

  const handleCategoryChange = (categoryId: string | null) => {
    const query = createQueryString({ categoryId })
    router.push(`${pathname}?${query}`)
  }

  const topLevel = (categories ?? []).filter((c) => !c.parent_category_id)

  return (
    <div className="flex small:flex-col gap-8 py-4 mb-8 small:px-0 pl-6 small:min-w-[200px] small:ml-[1.675rem] small:border-r small:border-ui-border-base small:pr-6">
      <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />

      {/* Categories */}
      {topLevel.length > 0 && (
        <div className="flex flex-col gap-y-3">
          <div className="border-t border-ui-border-base pt-6 hidden small:block" />
          <span className="txt-compact-small-plus text-ui-fg-muted uppercase tracking-wider">Categories</span>
          <div className="flex flex-col gap-y-1">
            <button
              onClick={() => handleCategoryChange(null)}
              className={clx(
                "text-left text-sm py-1 px-2 rounded-md transition-colors",
                !selectedCategoryId
                  ? "bg-ui-bg-base-hover text-ui-fg-base font-medium"
                  : "text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle"
              )}
            >
              All
            </button>
            {topLevel.map((cat) => (
              <CategoryItem
                key={cat.id}
                category={cat}
                selectedCategoryId={selectedCategoryId}
                onSelect={handleCategoryChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const CategoryItem = ({
  category,
  selectedCategoryId,
  onSelect,
  depth = 0,
}: {
  category: HttpTypes.StoreProductCategory
  selectedCategoryId?: string
  onSelect: (id: string | null) => void
  depth?: number
}) => {
  const children = category.category_children ?? []
  const isActive = selectedCategoryId === category.id

  return (
    <div>
      <button
        onClick={() => onSelect(isActive ? null : category.id)}
        className={clx(
          "text-left text-sm py-1 px-2 rounded-md transition-colors w-full",
          isActive
            ? "bg-ui-bg-base-hover text-ui-fg-base font-medium"
            : "text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle",
          depth > 0 && "pl-4"
        )}
      >
        {category.name}
      </button>
      {children.length > 0 && (
        <div className="flex flex-col gap-y-0.5 mt-0.5">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RefinementList
