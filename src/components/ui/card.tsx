import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-6 shadow-md
        transition-shadow duration-200 ease-out
        ${hover ? "hover:shadow-lg cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
