"use client";

import * as React from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  showPasswordToggle?: boolean;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      id,
      name,
      type = "text",
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      className,
      required,
      disabled,
      showPasswordToggle = true,
      ...props
    },
    ref
  ) => {
    // Generate fallback id if not provided
    const generatedId = React.useId();
    const inputId = id || (name ? `field-${name}` : generatedId);
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordField = type === "password";
    const actualType = isPasswordField && showPassword ? "text" : type;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full text-left", containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] select-none flex items-center justify-between",
              disabled && "opacity-60 cursor-not-allowed",
              labelClassName
            )}
          >
            <span>
              {label}
              {required && (
                <span className="text-[var(--color-primary)] ml-1 font-bold" aria-hidden="true">
                  *
                </span>
              )}
            </span>
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative flex items-center w-full">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)] z-10">
              {leftIcon}
            </div>
          )}

          {/* Native / Styled Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={actualType}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hintId}
            className={cn(
              "w-full h-11 rounded-xl text-sm transition-all duration-150 outline-none",
              "bg-[var(--color-bg-base)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]",
              "focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)]",
              // Icon padding
              leftIcon ? "pl-10" : "pl-3.5",
              (isPasswordField && showPasswordToggle) || rightIcon ? "pr-10" : "pr-3.5",
              // Error state
              error &&
                "border-[var(--color-error)] text-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-3 focus:ring-[var(--color-error-muted)]",
              // Disabled state
              disabled && "opacity-60 bg-[var(--color-bg-subtle)] cursor-not-allowed",
              className
            )}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {isPasswordField && showPasswordToggle ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1 rounded-md focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1.5 text-xs text-[var(--color-error)] font-medium mt-0.5 animate-scale-in"
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Hint text */}
        {!error && hint && (
          <p id={hintId} className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
