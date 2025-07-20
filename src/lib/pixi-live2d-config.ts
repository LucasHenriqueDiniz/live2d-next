"use client";

// Configurações globais do pixi-live2d-display
export const PIXI_LIVE2D_CONFIG = {
  // Nível de log
  LOG_LEVEL: 1, // LOG_LEVEL_VERBOSE

  // Configurações do canvas
  CANVAS_SIZE: {
    width: 800,
    height: 600,
  },

  // Configurações de modelo
  MODEL_CONFIG: {
    // Caminho do modelo Hiyori
    HIYORI_PATH: "/models/hiyori_free_en/runtime/hiyori_free_t08.model3.json",

    // Caminho do modelo Shizuku (alternativo)
    SHIZUKU_PATH: "/models/shizuku/runtime/shizuku.model3.json",
  },

  // Configurações de interação
  INTERACTION: {
    // Habilita interação por clique
    ENABLE_CLICK: true,

    // Habilita interação por toque
    ENABLE_TOUCH: true,

    // Habilita interação por mouse
    ENABLE_MOUSE: true,
  },

  // Configurações de renderização
  RENDERING: {
    // Cor de fundo
    BACKGROUND_COLOR: 0x222222,

    // Anti-aliasing
    ANTIALIAS: true,

    // Resolução
    RESOLUTION: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  },
};

// Inicializa as configurações
export const initializePixiLive2DConfig = () => {
  // Só executa no cliente
  if (typeof window === "undefined") return;

  // Importa dinamicamente para evitar SSR
  import("pixi-live2d-display").then(({ config }) => {
    config.logLevel = PIXI_LIVE2D_CONFIG.LOG_LEVEL;

    console.log("PIXI Live2D Display configurado:", {
      logLevel: config.logLevel,
      canvasSize: PIXI_LIVE2D_CONFIG.CANVAS_SIZE,
    });
  });
};
