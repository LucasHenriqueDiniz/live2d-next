"use client";
import Live2DPageLayout from "@/components/Live2DPageLayout";
import { useResponsiveScale } from "@/lib/use-responsive-scale";
import { useEffect, useRef, useState } from "react";
import Live2DPanel from "@/components/Live2DPanel";
import Live2DSection from "@/components/Live2DSection";
import Live2DLabel from "@/components/Live2DLabel";
import Live2DButton from "@/components/Live2DButton";
import Live2DLog from "@/components/Live2DLog";

// Configurações de controle
interface ControlSettings {
  modelScale: number;
  modelX: number;
  modelY: number;
  modelRotation: number;
  backgroundColor: string;
  showHitAreas: boolean;
  showBackground: boolean;
}

// Interface para motões
interface MotionGroup {
  name: string;
  motions: string[];
  description: string;
}

// Tipos de animação do Shizuku
const SHIZUKU_ANIMATIONS = {
  Idle: {
    description: "Estado de repouso/espera (padrão)",
    priority: 1,
    autoPlay: false, // Não auto-play para idle
  },
  FlickUp: {
    description: "Movimento para cima (bocejo)",
    priority: 2,
    autoPlay: false,
  },
  Tap: {
    description: "Animação de toque/clique",
    priority: 3,
    autoPlay: false,
  },
  Flick3: {
    description: "Movimento rápido",
    priority: 2,
    autoPlay: false,
  },
};

export default function ShizukuPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Carregando runtimes...");
  const [live2dModel, setLive2dModel] = useState<unknown>(null);
  const [pixiApp, setPixiApp] = useState<unknown>(null);
  // Trocar tipo do ref para aceitar Timeout (Node/Browser)
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [motionGroups, setMotionGroups] = useState<MotionGroup[]>([]);
  const [selectedMotionGroup, setSelectedMotionGroup] = useState<string>("");
  const [selectedMotionIndex, setSelectedMotionIndex] = useState<number>(0);
  const [currentAnimation, setCurrentAnimation] = useState<string>("");
  const [animationLog, setAnimationLog] = useState<string[]>([]);

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
    modelType: "shizuku",
  });

  // Controles com escala responsiva
  const [controls, setControls] = useState<ControlSettings>({
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
    setAnimationLog((prev) => [logEntry, ...prev.slice(0, 9)]); // Mantém apenas os últimos 10 logs
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
          const animationInfo = SHIZUKU_ANIMATIONS[groupName as keyof typeof SHIZUKU_ANIMATIONS];
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

  // Função para executar animação inteligente baseada no contexto
  const playSmartAnimation = (model: any, context: "idle" | "motion" = "idle") => {
    if (!model || !model.internalModel || !model.internalModel.motionManager) {
      addAnimationLog("❌ Modelo não está pronto para animação");
      return;
    }

    try {
      const motionGroups = Object.keys(model.internalModel.motionManager.definitions);
      addAnimationLog(`🔍 Grupos disponíveis: ${motionGroups.join(", ")}`);

      let selectedGroup = "Idle";
      let selectedIndex = 0;

      switch (context) {
        case "idle":
          // Prioriza Idle para repouso
          if (motionGroups.includes("Idle")) {
            selectedGroup = "Idle";
            selectedIndex = 0;
          } else {
            selectedGroup = motionGroups[0];
            selectedIndex = 0;
          }
          break;

        case "motion":
          // Escolhe aleatoriamente entre os grupos disponíveis (exceto Idle)
          const availableGroups = motionGroups.filter((g) => g !== "Idle");
          if (availableGroups.length > 0) {
            selectedGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
          } else {
            selectedGroup = motionGroups[0];
          }
          const groupCount = model.internalModel.motionManager.definitions[selectedGroup]?.length || 0;
          selectedIndex = Math.floor(Math.random() * groupCount);
          break;
      }

      const animationInfo = SHIZUKU_ANIMATIONS[selectedGroup as keyof typeof SHIZUKU_ANIMATIONS];
      const description = animationInfo ? animationInfo.description : "Animação desconhecida";

      addAnimationLog(`🎯 Contexto: ${context} → ${selectedGroup}[${selectedIndex}] - ${description}`);
      setCurrentAnimation(`${selectedGroup}[${selectedIndex}]`);

      model.motion(selectedGroup, selectedIndex);
    } catch (error) {
      addAnimationLog(`❌ Erro na animação inteligente: ${error}`);
    }
  };

  // Inicia animação automática inteligente
  const startAutoAnimation = (model: any) => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }

    addAnimationLog("🔄 Iniciando animação automática (muda a cada 8s)");

    // Primeira animação
    playSmartAnimation(model, "idle");

    animationIntervalRef.current = setInterval(() => {
      // 60% chance de idle, 40% chance de motion
      const random = Math.random();
      let context: "idle" | "motion" = "idle";

      if (random < 0.6) {
        context = "idle";
      } else {
        context = "motion";
      }

      playSmartAnimation(model, context);
    }, 8000); // Muda animação a cada 8 segundos
  };

  // Para animação automática
  const stopAutoAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
      addAnimationLog("⏹️ Animação automática parada");
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

      const animationInfo = SHIZUKU_ANIMATIONS[groupName as keyof typeof SHIZUKU_ANIMATIONS];
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
  const updateControl = (key: keyof ControlSettings, value: unknown) => {
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

      if (pixiApp && typeof pixiApp === "object" && pixiApp !== null && key === "backgroundColor") {
        const app = pixiApp as Record<string, unknown>;
        if (app.renderer && typeof app.renderer === "object" && app.renderer !== null && "backgroundColor" in app.renderer) {
          // Converte hex para número
          const color = parseInt((value as string).replace("#", ""), 16);
          (app.renderer as { backgroundColor: number }).backgroundColor = color;
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

        setStatus("Carregando modelo Shizuku...");

        // Cria o modelo Live2D
        const model = await Live2DModel.from("/models/shizuku/runtime/shizuku.model3.json");

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
          playSmartAnimation(model, "motion");
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

        addAnimationLog("✅ Modelo Shizuku carregado com sucesso!");
        setStatus("Modelo carregado! Animações inteligentes ativas!");

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

    // Cleanup
    return () => {
      stopAutoAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Live2DPageLayout title="🌸 Shizuku Live2D">
      {/* Painel de Controles */}
      <Live2DPanel title="🌸 Shizuku Live2D">
        <Live2DSection title="🌸 Shizuku Live2D">
          <Live2DLabel>🎬 Animação Atual</Live2DLabel>
          <div className="animation-current-status">{currentAnimation || "Nenhuma animação ativa"}</div>
        </Live2DSection>

        <Live2DSection title="🎮 Controles Rápidos">
          <div className="control-buttons-container">
            <Live2DButton
              onClick={() => {
                if (live2dModel) {
                  playSmartAnimation(live2dModel as any, "idle");
                }
              }}
              text="🛌 Idle"
            />

            <Live2DButton
              onClick={() => {
                if (live2dModel) {
                  playSmartAnimation(live2dModel as any, "motion");
                }
              }}
              text="🎭 Motion"
            />
          </div>

          <div className="control-buttons-container">
            <Live2DButton
              onClick={() => {
                if (animationIntervalRef.current) {
                  stopAutoAnimation();
                } else if (live2dModel) {
                  startAutoAnimation(live2dModel as any);
                }
              }}
              text={animationIntervalRef.current ? "⏹️ Parar Auto" : "▶️ Iniciar Auto"}
            />
          </div>
        </Live2DSection>

        <Live2DSection title="📋 Logs de Animação">
          <Live2DLog logs={animationLog} />
        </Live2DSection>

        <Live2DSection title="🎭 Seletor Específico">
          {motionGroups.length > 0 && (
            <>
              <Live2DLabel>Grupo de Animação:</Live2DLabel>
              <select
                value={selectedMotionGroup}
                onChange={(e) => {
                  setSelectedMotionGroup(e.target.value);
                  setSelectedMotionIndex(0);
                }}
                className="control-select"
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

              {selectedMotionGroup && motionGroups.find((g) => g.name === selectedMotionGroup) && (
                <>
                  <Live2DLabel>Motão Específico:</Live2DLabel>
                  <select
                    value={selectedMotionIndex}
                    onChange={(e) => setSelectedMotionIndex(parseInt(e.target.value))}
                    className="control-select"
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

                  <Live2DLabel>Descrição:</Live2DLabel>
                  <div className="motion-description">{motionGroups.find((g) => g.name === selectedMotionGroup)?.description}</div>

                  <Live2DButton
                    onClick={() => {
                      if (live2dModel) {
                        playSpecificAnimation(live2dModel as any, selectedMotionGroup, selectedMotionIndex);
                      }
                    }}
                    text="🎬 Executar Motão Forçado"
                  />
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
            className="control-range"
          />
          <div className="control-range-info">
            Base: {baseScale.toFixed(2)} | Min: {minScale.toFixed(2)} | Max: {maxScale.toFixed(2)}
          </div>

          <Live2DLabel>
            <input
              type="checkbox"
              checked={controls.showHitAreas}
              onChange={(e) => updateControl("showHitAreas", e.target.checked)}
              className="control-checkbox"
            />
            Mostrar Áreas de Hit
          </Live2DLabel>

          <Live2DLabel>
            <input
              type="checkbox"
              checked={controls.showBackground}
              onChange={(e) => updateControl("showBackground", e.target.checked)}
              className="control-checkbox"
            />
            Mostrar Background
          </Live2DLabel>
        </Live2DSection>

        <Live2DSection title="📊 Status">
          <div className="status-text">{status}</div>
        </Live2DSection>

        <Live2DSection title="📚 Ajuda">
          <div className="help-text">
            <p>
              🌸 <strong>Shizuku Animations:</strong>
            </p>
            <p>
              🛌 <strong>Idle:</strong> Estado de repouso/espera (padrão)
            </p>
            <p>
              🎭 <strong>FlickUp:</strong> Movimento para cima (bocejo)
            </p>
            <p>
              🎭 <strong>Tap:</strong> Animação de toque/clique
            </p>
            <p>
              🎭 <strong>Flick3:</strong> Movimento rápido
            </p>
            <p>
              🎬 <strong>Auto:</strong> Muda a cada 8s
            </p>
            <p>
              👆 <strong>Clique:</strong> No modelo para animar!
            </p>
          </div>
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
