import React from "react";

interface Live2DSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Live2DSection({ title, children, className = "" }: Live2DSectionProps) {
  return (
    <div className={`live2d-section ${className}`}>
      <h3 className="live2d-section-title">{title}</h3>
      {children}
    </div>
  );
}
