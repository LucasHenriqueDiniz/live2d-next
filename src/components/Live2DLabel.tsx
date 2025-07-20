import React from "react";

interface Live2DLabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  style?: React.CSSProperties;
}

export default function Live2DLabel({ children, className = "", htmlFor, style }: Live2DLabelProps) {
  return (
    <label
      className={`live2d-label ${className}`}
      htmlFor={htmlFor}
      style={style}
    >
      {children}
    </label>
  );
}
