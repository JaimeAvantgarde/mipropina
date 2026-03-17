"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-dark-mid"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-white border-2 border-[#E5E7EB] rounded-[14px]
            py-3.5 px-4 text-[15px] text-[#374151]
            placeholder:text-[#9CA3AF]
            transition-colors duration-200 ease-out
            focus:border-primary focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${error ? "border-error focus:border-error" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-[13px] text-error font-medium mt-0.5"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
