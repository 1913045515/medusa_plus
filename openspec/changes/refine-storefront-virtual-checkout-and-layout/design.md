## Context

The storefront already supports virtual products at the catalog and order-detail level, but checkout still assumes a shipping-first flow. That creates friction for virtual-only purchases because customers are asked for address and shipping data that is irrelevant to fulfillment, and successful payment can still leave the order presented with shipping-oriented intermediate states. Separately, the storefront shell relies on a visually weak header/footer composition that does not match the trust signals or clarity expected from modern US/EU ecommerce sites.

This change affects shared storefront layout, checkout step rendering, payment readiness, and potentially order-state presentation after payment. The implementation must preserve existing physical-product behavior and avoid introducing regressions in the mixed-cart path.

## Goals / Non-Goals

**Goals:**
- Detect virtual-only carts in the storefront and remove shipping-address and shipping-method requirements from checkout.
- Keep payment authorization and order placement working for virtual-only carts without requiring fake shipping data.
- Ensure successful virtual-only payments lead customers to an order experience that reads as complete rather than awaiting shipment.
- Redesign the shared storefront header, footer, and mobile navigation for a cleaner responsive ecommerce presentation.

**Non-Goals:**
- Do not change checkout requirements for carts containing any physical product.
- Do not redesign every page template or introduce a CMS-backed shell configuration.
- Do not add new payment providers or alter PayPal business rules beyond what is required for the virtual-only path to complete successfully.

## Decisions

### 1. Virtual-only checkout is derived from the cart line items, not from a separate checkout flag

The storefront will compute a single `isVirtualOnlyCart` boolean from cart items using the existing virtual-product metadata already attached to products or line items. Checkout sections, completion gating, and payment CTA behavior will branch from this derived state.

Rationale:
- Keeps the source of truth close to the cart contents.
- Avoids adding new backend fields just to model a transient checkout condition.

Alternatives considered:
- Persisting a cart-level `is_virtual_only` flag in backend metadata. Rejected because it creates synchronization work whenever the cart changes.

### 2. Virtual-only carts skip shipping UI in the storefront and use billing data as the only required address context

For virtual-only carts, the checkout page will not render shipping address or shipping method sections. Payment readiness will depend on cart email and billing address requirements only, plus any provider-specific prerequisites.

Rationale:
- Matches expected digital-goods checkout behavior.
- Minimizes surface area by changing storefront step logic rather than inventing a parallel checkout flow.

Alternatives considered:
- Auto-filling a hidden shipping address and leaving the UI unchanged. Rejected because it preserves the wrong mental model and can still expose shipping states elsewhere.

### 3. Virtual-only order completion is presented through fulfillment-aware status mapping

If Medusa still exposes non-complete fulfillment state values for virtual-only purchases, the storefront order confirmation and order detail views will map virtual-only orders to a completed digital-delivery presentation instead of shipment-oriented labels. If a small backend adjustment is needed to avoid invalid fulfillment creation for virtual-only orders, it will be limited to the order-placement path.

Rationale:
- The customer-facing outcome matters more than internal shipping semantics.
- Allows a minimal fallback if backend defaults cannot be changed safely in one pass.

Alternatives considered:
- Rebuilding Medusa order-state handling globally. Rejected as too invasive for this iteration.

### 4. Header and footer redesign stays within shared layout components with a new visual system layer

The redesign will be implemented in the shared layout components used by the main storefront shell. The new shell will introduce a more deliberate structure, spacing system, typography hierarchy, and mobile drawer treatment while preserving existing route structure and data-fetch boundaries.

Rationale:
- Shared layout components let the redesign propagate consistently with limited code churn.
- Keeps page-level modules untouched unless they depend on shell spacing or breakpoints.

Alternatives considered:
- Page-by-page redesign. Rejected because it is slower and unnecessary for the stated requirement.

## Risks / Trade-offs

- [Virtual-product metadata is inconsistent across cart item shapes] -> Centralize the virtual-only detection helper and default to physical behavior when metadata is missing.
- [Payment providers may implicitly expect shipping data] -> Validate Stripe/PayPal payment flows in a virtual-only cart before finalizing, and only add the smallest compatibility patch if required.
- [A stronger shell redesign can break compact mobile layouts] -> Keep responsive validation in scope and tune spacing/navigation behavior for sub-768px widths.
- [Storefront-only status mapping can drift from backend truth] -> Limit mapping to virtual-only orders and document it in the change artifacts so it remains intentional.

## Migration Plan

1. Add virtual-only cart detection and update checkout section gating.
2. Adjust payment completion logic and order-status presentation for virtual-only purchases.
3. Redesign shared header, footer, and mobile navigation components.
4. Run storefront validation for virtual-only checkout, physical checkout regression, and responsive shell rendering.
5. If rollback is needed, revert the storefront gating/status mapping first, then revert shell styling changes.

## Verification Notes

- Storefront production build was re-run successfully with `npm run build` in `my-store-storefront` after the checkout and shell changes.
- Runtime checkout validation was executed against the local Medusa backend using a real virtual product variant and store APIs.
- Validation confirmed that a virtual-product cart can be normalized to `requires_shipping=false`, initialize a payment session with `pp_system_default`, and complete to an order with zero shipping methods selected.
- The manual validation path for regressions is: add a physical product and confirm checkout still shows address plus delivery; add a virtual product and confirm checkout jumps from contact/billing to payment/review with no shipping step.

## Open Questions

- None. Validation confirmed the need for, and success of, a focused Medusa-side normalization route for virtual cart line items.