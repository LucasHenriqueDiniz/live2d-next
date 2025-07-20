import React from "react";

interface Live2DButtonProps {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  text?: string;
}

export default function Live2DButton({ children, onClick, className = "", type = "button", disabled, text }: Live2DButtonProps) {
  return (
    <button
      className={`live2d-btn ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
      {text && <span>{text}</span>}
    </button>
  );
}
