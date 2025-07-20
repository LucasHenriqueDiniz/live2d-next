"use client";
import { useEffect, useRef, useState } from "react";
import { useResponsiveScale } from "@/lib/use-responsive-scale";
import Link from "next/link";
import Live2DPageLayout from "@/components/Live2DPageLayout";
import Live2DPanel from "@/components/Live2DPanel";
import Live2DSection from "@/components/Live2DSection";
import Live2DLabel from "@/components/Live2DLabel";
import Live2DButton from "@/components/Live2DButton";
import Live2DLog from "@/components/Live2DLog";

// Interface para motões
interface MotionGroup {
  name: string;
  motions: string[];
  description: string;
}

// Tipos de animação do Wanko
const WANKO_ANIMATIONS = {
  idle: {
    description: "Animações de repouso do Wanko",
    priority: 1,
    autoPlay: true,
  },
  shake: {
    description: "Animações de balançar/agitar",
    priority: 2,
    autoPlay: false,
  },
  touch: {
    description: "Animações de toque/carinho",
    priority: 3,
    autoPlay: false,
  },
};

export default function WankoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Carregando runtimes...");
  const [live2dModel, setLive2dModel] = useState<unknown>(null);
  const [pixiApp, setPixiApp] = useState<unknown>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string>("");
  const [animationLog, setAnimationLog] = useState<string[]>([]);
  const [motionGroups, setMotionGroups] = useState<MotionGroup[]>([]);
  const [selectedMotionGroup, setSelectedMotionGroup] = useState<string>("");
  const [selectedMotionIndex, setSelectedMotionIndex] = useState<number>(0);

  // Configurações do canvas
  const CANVAS_WIDTH = 1024;
  const CANVAS_HEIGHT = 768;

  // Hook para escala responsiva
  const {
    scale: responsiveScale,
    minScale,
    maxScale,
    baseScale,
  } = useResponsiveScale({
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    modelType: "wanko",
  });

  // Controles
  const [controls, setControls] = useState({
    modelScale: responsiveScale,
    modelX: 0,
    modelY: 0,
    modelRotation: 0,
    backgroundColor: "#222222",
    showHitAreas: false,
    showBackground: false,
  });

  // Atualiza escala quando o hook muda
  useEffect(() => {
    setControls((prev) => ({
      ...prev,
      modelScale: responsiveScale,
    }));
  }, [responsiveScale]);

  // Adiciona log de animação
  const addAnimationLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setAnimationLog((prev) => [logEntry, ...prev.slice(0, 9)]);
    console.log(logEntry);
  };

  // Função para executar animação específica
  const playSpecificAnimation = (model: any, groupName: string, motionIndex: number) => {
    if (!model || !model.internalModel || !model.internalModel.motionManager) {
      addAnimationLog("❌ Modelo não está pronto para animação");
      return;
    }

    try {
      const motionGroups = Object.keys(model.internalModel.motionManager.definitions);

      if (motionGroups.includes(groupName)) {
        const motionCount = model.internalModel.motionManager.definitions[groupName]?.length || 0;

        if (motionIndex < motionCount) {
          const animationInfo = WANKO_ANIMATIONS[groupName as keyof typeof WANKO_ANIMATIONS];
          const description = animationInfo ? animationInfo.description : "Animação desconhecida";

          addAnimationLog(`🎬 Executando: ${groupName}[${motionIndex}] - ${description}`);
          setCurrentAnimation(`${groupName}[${motionIndex}]`);

          model.motion(groupName, motionIndex);
        } else {
          addAnimationLog(`❌ Índice inválido: ${motionIndex} (máximo: ${motionCount - 1})`);
        }
      } else {
        addAnimationLog(`❌ Grupo não encontrado: ${groupName}`);
      }
    } catch (error) {
      addAnimationLog(`❌ Erro ao executar animação: ${error}`);
    }
  };

  // Função para executar animação aleatória
  const playRandomAnimation = (model: any) => {
    if (!model || !model.internalModel || !model.internalModel.motionManager) {
      addAnimationLog("❌ Modelo não está pronto para animação");
      return;
    }

    try {
      const motionGroups = Object.keys(model.internalModel.motionManager.definitions);
      addAnimationLog(`🔍 Grupos disponíveis: ${motionGroups.join(", ")}`);

      if (motionGroups.length > 0) {
        const selectedGroup = motionGroups[Math.floor(Math.random() * motionGroups.length)];
        const groupCount = model.internalModel.motionManager.definitions[selectedGroup]?.length || 0;
        const selectedIndex = Math.floor(Math.random() * groupCount);

        addAnimationLog(`🎬 Executando: ${selectedGroup}[${selectedIndex}]`);
        setCurrentAnimation(`${selectedGroup}[${selectedIndex}]`);

        model.motion(selectedGroup, selectedIndex);
      }
    } catch (error) {
      addAnimationLog(`❌ Erro ao executar animação: ${error}`);
    }
  };

  // Extrai grupos de motão do modelo com descrições
  const extractMotionGroups = (model: any) => {
    if (!model || !model.internalModel || !model.internalModel.motionManager) {
      return [];
    }

    const groups: MotionGroup[] = [];
    const motionManager = model.internalModel.motionManager;
    const definitions = motionManager.definitions;

    Object.keys(definitions).forEach((groupName) => {
      const motions = definitions[groupName] || [];
      const motionNames = motions.map((motion: any, index: number) => {
        // Tenta extrair nome do arquivo ou usar índice
        if (motion && motion.File) {
          return motion.File.split("/").pop()?.replace(".motion3.json", "") || `Motion ${index}`;
        }
        return `Motion ${index}`;
      });

      const animationInfo = WANKO_ANIMATIONS[groupName as keyof typeof WANKO_ANIMATIONS];
      const description = animationInfo ? animationInfo.description : "Animação personalizada";

      groups.push({
        name: groupName,
        motions: motionNames,
        description: description,
      });
    });

    return groups;
  };

  // Atualiza controles
  const updateControl = (key: string, value: unknown) => {
    setControls((prev) => {
      const newControls = { ...prev, [key]: value };

      // Aplica mudanças em tempo real
      if (live2dModel && typeof live2dModel === "object" && live2dModel !== null) {
        const model = live2dModel as Record<string, unknown>;

        switch (key) {
          case "modelScale":
            if (model.scale && typeof model.scale === "object" && "set" in model.scale) {
              (model.scale as { set: (x: number, y: number) => void }).set(value as number, value as number);
            }
            break;
          case "modelX":
            if (model.position && typeof model.position === "object" && "x" in model.position) {
              (model.position as { x: number }).x = value as number;
            }
            break;
          case "modelY":
            if (model.position && typeof model.position === "object" && "y" in model.position) {
              (model.position as { y: number }).y = value as number;
            }
            break;
          case "modelRotation":
            model.rotation = ((value as number) * Math.PI) / 180;
            break;
          case "showHitAreas":
            // Tenta diferentes propriedades para hit areas
            if (model.hitAreaFrames && typeof model.hitAreaFrames === "object" && "visible" in model.hitAreaFrames) {
              (model.hitAreaFrames as { visible: boolean }).visible = value as boolean;
            }
            // Tenta propriedade alternativa
            if (model.hitAreas && typeof model.hitAreas === "object" && "visible" in model.hitAreas) {
              (model.hitAreas as { visible: boolean }).visible = value as boolean;
            }
            // Tenta propriedade direta
            if ("hitAreaFramesVisible" in model) {
              (model as { hitAreaFramesVisible: boolean }).hitAreaFramesVisible = value as boolean;
            }
            // Tenta propriedade adicional
            if ("hitAreaFrames" in model && typeof model.hitAreaFrames === "object") {
              const hitFrames = model.hitAreaFrames as any;
              if (hitFrames && typeof hitFrames === "object") {
                Object.keys(hitFrames).forEach((key) => {
                  if (hitFrames[key] && typeof hitFrames[key] === "object" && "visible" in hitFrames[key]) {
                    hitFrames[key].visible = value as boolean;
                  }
                });
              }
            }
            break;
          case "showBackground":
            if ("backgroundVisible" in model) {
              (model as { backgroundVisible: boolean }).backgroundVisible = value as boolean;
            }
            break;
        }
      }

      return newControls;
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        setStatus("Carregando runtimes do Cubism...");

        // Importa dinamicamente após os runtimes estarem carregados
        const { Application, Ticker } = await import("pixi.js");
        const { Live2DModel } = await import("pixi-live2d-display");
        const { initializePixiLive2DConfig } = await import("@/lib/pixi-live2d-config");

        setStatus("Configurando PIXI Live2D Display...");

        // Configura o pixi-live2d-display
        initializePixiLive2DConfig();

        setStatus("Inicializando PIXI Application...");

        // Inicializa o PIXI Application com tamanho fixo
        if (!canvasRef.current) return;

        const app = new Application({
          view: canvasRef.current,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: parseInt(controls.backgroundColor.replace("#", ""), 16),
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });

        setPixiApp(app);

        // Configura o ticker CORRETAMENTE
        Ticker.shared.autoStart = true;

        // REGISTRA O TICKER - ESSENCIAL PARA ANIMAÇÕES
        Live2DModel.registerTicker(Ticker);

        setStatus("Carregando modelo Wanko...");

        // Cria o modelo Live2D
        const model = await Live2DModel.from("/models/Wanko/Wanko.model3.json");

        // Configura o modelo
        model.anchor.set(0.5, 0.5);
        model.position.set(CANVAS_WIDTH / 2 + controls.modelX, CANVAS_HEIGHT / 2 + controls.modelY);
        model.scale.set(controls.modelScale, controls.modelScale);
        model.rotation = (controls.modelRotation * Math.PI) / 180;

        // Configura hit areas e background - tenta múltiplas abordagens
        if ((model as any).hitAreaFrames) {
          (model as any).hitAreaFrames.visible = controls.showHitAreas;
        }
        if ((model as any).hitAreas) {
          (model as any).hitAreas.visible = controls.showHitAreas;
        }
        if ((model as any).hitAreaFramesVisible !== undefined) {
          (model as any).hitAreaFramesVisible = controls.showHitAreas;
        }
        if ((model as any).backgroundVisible !== undefined) {
          (model as any).backgroundVisible = controls.showBackground;
        }

        // Adiciona o modelo ao stage
        app.stage.addChild(model);

        // Configura interações
        model.on("pointertap", (_event: any) => {
          addAnimationLog("👆 Modelo clicado! Executando animação de movimento...");
          playRandomAnimation(model);
        });

        // Habilita interação
        model.interactive = true;
        model.buttonMode = true;

        setLive2dModel(model);

        // Extrai grupos de motão
        const groups = extractMotionGroups(model);
        setMotionGroups(groups);

        if (groups.length > 0) {
          setSelectedMotionGroup(groups[0].name);
        }

        addAnimationLog("✅ Modelo Wanko carregado com sucesso!");
        setStatus("Modelo carregado! Clique para animar!");

        // Log para debug
        console.log("Modelo carregado com sucesso:", {
          model,
          motionGroups: groups,
          hitAreaFrames: (model as any).hitAreaFrames,
          hitAreas: (model as any).hitAreas,
          backgroundVisible: (model as any).backgroundVisible,
        });
      } catch (error) {
        console.error("Erro na inicialização:", error);
        setStatus("Erro na inicialização");
        addAnimationLog(`❌ Erro na inicialização: ${error}`);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Live2DPageLayout title="🐕 Wanko Live2D">
      {/* Painel de controles, canvas, logs, etc. */}
      {/* Seta de Voltar */}

      {/* Painel de Controles */}
      <Live2DPanel title="🐕 Wanko Live2D">
        <Live2DSection title="🎬 Animação Atual">
          <Live2DLabel>Atual:</Live2DLabel>
          <div className="live2d-animation-current-status">{currentAnimation || "Nenhuma animação ativa"}</div>
        </Live2DSection>
        <Live2DSection title="🎮 Controles">
          <Live2DButton onClick={() => live2dModel && playRandomAnimation(live2dModel as any)}>🎭 Executar Animação Aleatória</Live2DButton>
        </Live2DSection>
        <Live2DSection title="📋 Logs de Animação">
          <Live2DLog logs={animationLog} />
        </Live2DSection>
        <Live2DSection title="🎭 Seletor Específico">
          {motionGroups.length > 0 && (
            <>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "12px" }}>Grupo de Animação:</label>
                <select
                  value={selectedMotionGroup}
                  onChange={(e) => {
                    setSelectedMotionGroup(e.target.value);
                    setSelectedMotionIndex(0);
                  }}
                  style={{ width: "100%", padding: "5px", fontSize: "12px" }}
                >
                  {motionGroups.map((group) => (
                    <option
                      key={group.name}
                      value={group.name}
                    >
                      {group.name} ({group.motions.length} motões)
                    </option>
                  ))}
                </select>
              </div>

              {selectedMotionGroup && motionGroups.find((g) => g.name === selectedMotionGroup) && (
                <>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px" }}>Motão Específico:</label>
                    <select
                      value={selectedMotionIndex}
                      onChange={(e) => setSelectedMotionIndex(parseInt(e.target.value))}
                      style={{ width: "100%", padding: "5px", fontSize: "12px" }}
                    >
                      {motionGroups
                        .find((g) => g.name === selectedMotionGroup)
                        ?.motions.map((motion, index) => (
                          <option
                            key={index}
                            value={index}
                          >
                            {motion}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#aaa",
                        marginBottom: "5px",
                        padding: "5px",
                        backgroundColor: "#2a2a2a",
                        borderRadius: "3px",
                      }}
                    >
                      {motionGroups.find((g) => g.name === selectedMotionGroup)?.description}
                    </div>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <Live2DButton
                      onClick={() => {
                        if (live2dModel) {
                          playSpecificAnimation(live2dModel as any, selectedMotionGroup, selectedMotionIndex);
                        }
                      }}
                    >
                      🎬 Executar Motão Forçado
                    </Live2DButton>
                  </div>
                </>
              )}
            </>
          )}
        </Live2DSection>
        <Live2DSection title="⚙️ Configurações">
          <Live2DLabel>
            Escala: {controls.modelScale.toFixed(2)} (Auto: {responsiveScale.toFixed(2)})
          </Live2DLabel>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step="0.01"
            value={controls.modelScale}
            onChange={(e) => updateControl("modelScale", parseFloat(e.target.value))}
            className="live2d-range-control"
          />
          <div className="live2d-range-control-info">
            Base: {baseScale.toFixed(2)} | Min: {minScale.toFixed(2)} | Max: {maxScale.toFixed(2)}
          </div>
          <Live2DLabel>
            <input
              type="checkbox"
              checked={controls.showHitAreas}
              onChange={(e) => updateControl("showHitAreas", e.target.checked)}
              className="live2d-checkbox-control"
            />{" "}
            Mostrar Áreas de Hit
          </Live2DLabel>
          <Live2DLabel>
            <input
              type="checkbox"
              checked={controls.showBackground}
              onChange={(e) => updateControl("showBackground", e.target.checked)}
              className="live2d-checkbox-control"
            />{" "}
            Mostrar Background
          </Live2DLabel>
        </Live2DSection>
        <Live2DSection title="📊 Status">
          <div className="live2d-status-text">{status}</div>
        </Live2DSection>
      </Live2DPanel>

      {/* Canvas */}
      <div className="live2d-canvas-container">
        <canvas
          ref={canvasRef}
          className="live2d-canvas"
        />
      </div>
    </Live2DPageLayout>
  );
}
