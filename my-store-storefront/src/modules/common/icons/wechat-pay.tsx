import React from "react"
import { IconProps } from "types/icon"

const WeChatPay: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      {...attributes}
    >
      <circle cx="16" cy="16" r="16" fill="#09BB07" />
      <path
        fill="#fff"
        d="M11.2 9.6c-3.1 0-5.6 2.1-5.6 4.7 0 1.5.8 2.8 2.1 3.7l-.5 1.6 1.9-1c.7.2 1.4.3 2.1.3.2 0 .4 0 .6 0-.1-.4-.2-.8-.2-1.2 0-2.6 2.5-4.7 5.6-4.7.2 0 .4 0 .6 0-.4-2-2.5-3.4-4.6-3.4Zm-2 2.2a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Zm4 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z"
      />
      <path
        fill="#fff"
        d="M22.4 14.4c-2.8 0-5 1.9-5 4.3 0 1.3.7 2.4 1.8 3.2l-.4 1.4 1.7-.9c.6.2 1.3.3 1.9.3 2.8 0 5-1.9 5-4.3s-2.2-4-5-4Zm-1.6 1.9a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Zm3.3 0a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4Z"
      />
    </svg>
  )
}

export default WeChatPay
