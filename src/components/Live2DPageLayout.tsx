"use client";
import Link from "next/link";
import React, { ReactNode, useEffect, useRef } from "react";
import "../app/globals.css";
interface Live2DPageLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  preloadCubism?: boolean;
}

export default function Live2DPageLayout({ children, title, showBackButton = true, preloadCubism = true }: Live2DPageLayoutProps) {
  // Preload dos runtimes Cubism 2 e 4
  React.useEffect(() => {
    if (!preloadCubism) return;
    // Cubism 2
    if (!document.getElementById("cubism2-preload")) {
      const script2 = document.createElement("script");
      script2.id = "cubism2-preload";
      script2.src = "/live2d/live2d.min.js";
      script2.async = true;
      document.head.appendChild(script2);
    }
    // Cubism 4
    if (!document.getElementById("cubism4-preload")) {
      const script4 = document.createElement("script");
      script4.id = "cubism4-preload";
      script4.src = "/live2d/live2dcubismcore.min.js";
      script4.async = true;
      document.head.appendChild(script4);
    }
  }, [preloadCubism]);

  // FPS Counter
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let stats: any;
    let id: any;
    // @ts-expect-error: stats.js não possui tipos
    import("stats.js").then(({ default: Stats }) => {
      stats = new Stats();
      stats.showPanel(0); // 0: fps
      stats.dom.style.position = "fixed";
      stats.dom.style.bottom = "10px";
      stats.dom.style.right = "10px";
      stats.dom.style.left = "auto";
      stats.dom.style.top = "auto";
      stats.dom.style.zIndex = "10000";
      stats.dom.style.width = "80px";

      if (statsRef.current) {
        statsRef.current.appendChild(stats.dom);
      }
      function animate() {
        stats.begin();
        stats.end();
        id = requestAnimationFrame(animate);
      }
      animate();
    });
    return () => {
      if (id) cancelAnimationFrame(id);
      if (statsRef.current && statsRef.current.firstChild) {
        statsRef.current.removeChild(statsRef.current.firstChild);
      }
    };
  }, []);

  return (
    <div className="live2d-layout">
      {/* FPS Counter */}
      <div ref={statsRef} />
      {/* Sidebar com botão de voltar */}
      <aside className="live2d-sidebar">
        {showBackButton && (
          <Link
            href="/"
            className="live2d-back-link"
          >
            <div
              title="Voltar"
              className="live2d-back-btn"
              onMouseEnter={(e) => {
                e.currentTarget.classList.add("hover");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove("hover");
              }}
            >
              <span className="live2d-back-arrow">&larr;</span>
            </div>
          </Link>
        )}
      </aside>

      {/* Painel principal */}
      <div className="live2d-main-panel">
        {/* Header absoluto centralizado */}
        <header className="live2d-header">
          <h2 className="live2d-title">{title}</h2>
        </header>
        <main className="live2d-main-content">{children}</main>
      </div>
    </div>
  );
}
