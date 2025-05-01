import React from "react";

const VARIANT_CLASSES = {
  primary: "bg-green-600 hover:bg-green-500 text-white",
  dark: "bg-gray-700 hover:bg-gray-600 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  text: "bg-transparent hover:bg-transparent text-green-600 hover:text-green-800",
  secondary: "bg-blue-500 hover:bg-blue-600 text-white",
  iconDelete:
    "inline-flex items-center justify-center !p-1.5 !rounded-full hover:bg-red-100 text-red-500 hover:text-red-500",
  iconClose:
    "inline-flex items-center justify-center !p-1.5 !rounded-full hover:bg-green-100 text-gray-500 hover:text-gray-700 transition-all duration-200 cursor-pointer hover:text-green-500",
};

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  ...props
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const cursorClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses}
        ${cursorClass}
         ${
           variant === "text" || variant === "icon" ? "" : "px-4 py-2 rounded"
         } transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
