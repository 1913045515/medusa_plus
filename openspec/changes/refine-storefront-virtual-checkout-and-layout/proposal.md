## Why

The storefront checkout still treats virtual products like shippable goods, which forces customers through address and shipping steps that should not exist and leaves paid virtual orders in shipping-related intermediate states. The storefront shell also looks visually weak in the header and footer, which lowers trust and hurts conversion on both desktop and mobile.

## What Changes

- Update storefront checkout so carts containing only virtual products skip address and shipping selection, keep the payment flow working, and land in a completed order state after successful payment.
- Hide shipping-related UI and delivery address requirements throughout the virtual-only checkout path while preserving mixed-cart and physical-product behavior.
- Redesign the storefront header and footer with a cleaner US/EU-style ecommerce visual language, better information hierarchy, and responsive behavior for desktop and mobile.
- Refresh the mobile navigation presentation so the new shell feels intentional and consistent with the desktop experience.

## Capabilities

### New Capabilities
- `virtual-only-checkout`: Virtual-only carts can complete checkout without shipping steps or shipping statuses in the storefront experience.
- `storefront-shell-redesign`: The storefront header, footer, and mobile navigation present a modern, conversion-oriented ecommerce shell across desktop and mobile.

### Modified Capabilities

None.

## Non-goals

- Do not change fulfillment behavior for carts that contain any physical products.
- Do not introduce a new CMS or menu management backend in this change.
- Do not redesign the entire storefront page system beyond shared header, footer, and checkout shell behavior.

## Impact

- Storefront: checkout steps, payment gating, header/footer layout, and mobile navigation in `my-store-storefront`.
- Backend/commerce flow: order completion and fulfillment-state handling for virtual-only purchases if current Medusa defaults do not already satisfy the requirement.
- Verification: checkout regression testing for virtual-only and physical-product paths, plus responsive UI validation.