"use client";
import Link from "next/link";

export default function Live2DIndexPage() {
  const models = [
    {
      name: "Hiyori",
      description: "Modelo oficial da Live2D com animações complexas",
      path: "/hiyori",
      icon: "🎭",
      color: "pink",
      features: ["Idle", "Flick", "Tap", "Tap@Body", "Flick@Body"],
    },
    {
      name: "Rice",
      description: "Modelo simples com animações básicas",
      path: "/rice",
      icon: "🍚",
      color: "orange",
      features: ["Idle", "Motion"],
    },
    {
      name: "Shizuku",
      description: "Modelo com animações numeradas",
      path: "/shizuku",
      icon: "🌸",
      color: "purple",
      features: ["01", "02", "03", "04"],
    },
    {
      name: "Haru",
      description: "Modelo com animações de movimento e toque",
      path: "/haru",
      icon: "🌸",
      color: "red",
      features: ["Idle", "Motion", "Tap"],
    },
    {
      name: "Mao",
      description: "Modelo felino com animações de movimento",
      path: "/mao",
      icon: "🐱",
      color: "amber",
      features: ["mtn_01", "mtn_02", "mtn_03"],
    },
    {
      name: "Mark",
      description: "Modelo masculino com animações simples",
      path: "/mark",
      icon: "👨",
      color: "slate",
      features: ["Aleatória"],
    },
    {
      name: "Natori",
      description: "Modelo com expressões e movimentos",
      path: "/natori",
      icon: "🎭",
      color: "pink",
      features: ["Idle", "Motion"],
    },
    {
      name: "Wanko",
      description: "Modelo canino com animações de repouso",
      path: "/wanko",
      icon: "🐕",
      color: "yellow",
      features: ["Idle", "Motion"],
    },
    {
      name: "Hiyori Free EN",
      description: "Versão em inglês do modelo Hiyori",
      path: "/hiyori_free_en",
      icon: "🇺🇸",
      color: "blue",
      features: ["Idle", "Motion"],
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      pink: "border-pink-500 text-pink-500 bg-pink-500/10 hover:bg-pink-500/20",
      orange: "border-orange-500 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20",
      purple: "border-purple-500 text-purple-500 bg-purple-500/10 hover:bg-purple-500/20",
      red: "border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500/20",
      amber: "border-amber-500 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20",
      slate: "border-slate-500 text-slate-500 bg-slate-500/10 hover:bg-slate-500/20",
      yellow: "border-yellow-500 text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20",
      blue: "border-blue-500 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
    };
    return colorMap[color] || "border-gray-500 text-gray-500 bg-gray-500/10 hover:bg-gray-500/20";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Live2D Viewer</h1>
          <p className="text-gray-400 text-lg mb-6">Escolha um modelo para visualizar e interagir</p>
          <div className="inline-flex items-center px-4 py-2 bg-gray-800 rounded-full">
            <span className="text-sm text-gray-300">{models.length} modelos disponíveis</span>
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {models.map((model) => (
            <Link
              key={model.path}
              href={model.path}
              className="group block"
            >
              <div
                className={`bg-gray-900 border-2 ${
                  getColorClasses(model.color).split(" ")[0]
                } rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{model.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Live2D Model</span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed flex-1">{model.description}</p>

                <div className="mb-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Animações</h4>
                  <div className="flex flex-wrap gap-2">
                    {model.features.map((feature, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full border ${getColorClasses(model.color)}`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Abrir →</span>
                  <div className={`w-8 h-8 rounded-full ${getColorClasses(model.color).split(" ")[2]} flex items-center justify-center transition-colors`}>
                    <span className="text-sm">▶</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-center text-white mb-8">🚀 Funcionalidades</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="font-semibold text-white mb-2">Animações Inteligentes</h3>
              <p className="text-sm text-gray-400">Sistema que escolhe automaticamente a melhor animação</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-white mb-2">Escala Responsiva</h3>
              <p className="text-sm text-gray-400">Escala ideal calculada automaticamente</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="font-semibold text-white mb-2">Controles Interativos</h3>
              <p className="text-sm text-gray-400">Painel completo com logs detalhados</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-white mb-2">Performance Otimizada</h3>
              <p className="text-sm text-gray-400">Carregamento otimizado para produção</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
