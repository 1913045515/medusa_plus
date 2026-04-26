import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-8 sm:py-10 xl:py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
            <div className="flex min-w-0 flex-col gap-y-6 rounded-[28px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.07)] sm:px-7 sm:py-8">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 xl:sticky xl:top-6">
                {cart && cart.region && (
                  <>
                    <div className="rounded-[28px] border border-[#e3d5c1] bg-white/92 px-5 py-6 shadow-[0_18px_50px_rgba(74,53,24,0.07)] sm:px-6 sm:py-7">
                      <Summary cart={cart as any} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
