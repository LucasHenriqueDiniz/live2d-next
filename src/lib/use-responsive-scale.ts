import { useMemo } from "react";

interface UseResponsiveScaleProps {
  canvasWidth: number;
  canvasHeight: number;
  // Novo: tamanho do modelo (bounding box)
  modelWidth?: number;
  modelHeight?: number;
  fillRatio?: number; // quanto do canvas deve ocupar (0.8 = 80%)
  // Fallback legacy:
  modelType?: string;
}

interface ModelScaleConfig {
  baseScale: number;
  minScale: number;
  maxScale: number;
  responsiveMultiplier: number;
}

// Configurações de escala para fallback legacy
const MODEL_SCALE_CONFIGS: Record<string, ModelScaleConfig> = {
  hiyori: { baseScale: 0.2, minScale: 0.05, maxScale: 0.8, responsiveMultiplier: 0.8 },
  rice: { baseScale: 0.27, minScale: 0.05, maxScale: 1.2, responsiveMultiplier: 1.0 },
  shizuku: { baseScale: 0.35, minScale: 0.05, maxScale: 1.0, responsiveMultiplier: 0.9 },
  haru: { baseScale: 0.18, minScale: 0.05, maxScale: 0.9, responsiveMultiplier: 0.85 },
  mao: { baseScale: 0.25, minScale: 0.05, maxScale: 1.0, responsiveMultiplier: 0.8 },
  mark: { baseScale: 0.35, minScale: 0.05, maxScale: 1.1, responsiveMultiplier: 0.95 },
  natori: { baseScale: 0.12, minScale: 0.05, maxScale: 0.95, responsiveMultiplier: 0.88 },
  wanko: { baseScale: 0.5, minScale: 0.05, maxScale: 1.2, responsiveMultiplier: 1.0 },
  hiyori_free_en: { baseScale: 0.2, minScale: 0.05, maxScale: 0.8, responsiveMultiplier: 0.8 },
};

const UNIVERSAL_MIN_SCALE = 0.01;

export const useResponsiveScale = ({ canvasWidth, canvasHeight, modelWidth, modelHeight, fillRatio = 0.8, modelType }: UseResponsiveScaleProps) => {
  const scale = useMemo(() => {
    // Se modelWidth/modelHeight informados, calcula dinamicamente
    if (modelWidth && modelHeight) {
      // Calcula escala para preencher fillRatio do menor lado do canvas
      const scaleX = (canvasWidth * fillRatio) / modelWidth;
      const scaleY = (canvasHeight * fillRatio) / modelHeight;
      const calculatedScale = Math.min(scaleX, scaleY);
      // min/max podem ser ajustados conforme desejado
      return {
        scale: calculatedScale,
        minScale: Math.max(calculatedScale * 0.1, UNIVERSAL_MIN_SCALE),
        maxScale: calculatedScale * 2,
        baseScale: calculatedScale,
      };
    }
    // Fallback legacy: hardcoded por modelo
    const config = MODEL_SCALE_CONFIGS[modelType || "hiyori"] || MODEL_SCALE_CONFIGS.hiyori;
    const canvasArea = canvasWidth * canvasHeight;
    const baseCanvasArea = 1024 * 768;
    const areaRatio = canvasArea / baseCanvasArea;
    let calculatedScale = config.baseScale * Math.sqrt(areaRatio) * config.responsiveMultiplier;
    calculatedScale = Math.max(config.minScale, Math.min(config.maxScale, calculatedScale));
    return {
      scale: calculatedScale,
      minScale: Math.max(config.minScale, UNIVERSAL_MIN_SCALE),
      maxScale: config.maxScale,
      baseScale: config.baseScale,
    };
  }, [canvasWidth, canvasHeight, modelWidth, modelHeight, fillRatio, modelType]);

  return scale;
};
