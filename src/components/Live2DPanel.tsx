import React from "react";

interface Live2DPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Live2DPanel({ title, children, className = "" }: Live2DPanelProps) {
  return (
    <div className={`live2d-panel ${className}`}>
      <h2 className="live2d-panel-title">{title}</h2>
      {children}
    </div>
  );
}
