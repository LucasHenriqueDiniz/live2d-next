import React from "react";

interface Live2DLogProps {
  logs: string[];
  emptyText?: string;
  className?: string;
}

export default function Live2DLog({ logs, emptyText = "Aguardando animações...", className = "" }: Live2DLogProps) {
  return (
    <div className={`live2d-log ${className}`}>
      {logs.length === 0 ? (
        <div className="live2d-log-empty">{emptyText}</div>
      ) : (
        logs.map((log, idx) => (
          <div
            key={idx}
            className="live2d-log-entry"
          >
            {log}
          </div>
        ))
      )}
    </div>
  );
}
