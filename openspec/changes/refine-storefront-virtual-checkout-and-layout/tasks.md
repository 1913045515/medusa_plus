## 1. Virtual-only checkout flow

- [x] 1.1 Add a shared virtual-only cart detection helper and wire it into checkout templates/components under `my-store-storefront/src/modules/checkout/` and related cart/order utilities.
- [x] 1.2 Update checkout UI in `my-store-storefront/src/modules/checkout/components/` so virtual-only carts hide shipping address and shipping method sections while keeping billing and payment steps usable.
- [x] 1.3 Adjust order confirmation and order detail rendering in `my-store-storefront/src/modules/order/` and relevant app routes so virtual-only paid orders present completed digital-delivery messaging instead of shipment-oriented states.
- [x] 1.4 If storefront validation shows payment placement still requires shipping configuration, apply the smallest compatible Medusa-side fix in `my-store/src/` to allow virtual-only checkout completion.

## 2. Storefront shell redesign

- [x] 2.1 Redesign the shared header and navigation shell in `my-store-storefront/src/modules/layout/` to provide a cleaner desktop and mobile ecommerce presentation.
- [x] 2.2 Redesign the shared footer in `my-store-storefront/src/modules/layout/` with clearer grouping, stronger trust cues, and responsive spacing.
- [x] 2.3 Tune shared shell styling tokens and responsive behavior in storefront styles so the redesigned header/footer render cleanly across mobile and desktop.

## 3. Verification

- [x] 3.1 Add or update focused storefront coverage for virtual-only checkout gating or order-state presentation where test infrastructure already exists; otherwise document the manual validation path in the change artifacts.
- [x] 3.2 Run storefront validation for virtual-only checkout, physical-product checkout regression, and responsive header/footer rendering, then record the verified outcome.