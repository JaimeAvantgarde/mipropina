import type { HTMLAttributes } from "react";

type BadgeVariant = "active" | "pending" | "error" | "info" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-[#E8F5E9] text-[#1B5E20]",
  pending: "bg-[#FFF3E0] text-[#E65100]",
  error: "bg-red-50 text-red-600",
  info: "bg-blue-50 text-blue-600",
  neutral: "bg-gray-100 text-gray-600",
};

function Badge({
  variant = "info",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        py-1 px-3 rounded-full
        text-[11px] font-bold uppercase tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
