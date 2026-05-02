/**
 * NEXUS Model Orchestrator
 * 
 * Sistema inteligente de enrutamiento automático de modelos.
 * Analiza la orden del usuario y decide internamente qué modelo usar.
 * El usuario siempre siente que habla con 'NEXUS', sin saber qué modelo corre por detrás.
 * 
 * Arquitectura escalable para agregar nuevos modelos (NVIDIA NIM, etc) sin tocar la interfaz.
 */

export type ModelProvider = "huggingface" | "nvidia" | "custom";
export type ModelCategory = "reasoning" | "fast" | "specialized";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  category: ModelCategory;
  endpoint: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  costPerMTok?: number;
  capabilities: string[];
  enabled: boolean;
}

export interface RoutingDecision {
  modelId: string;
  modelName: string;
  category: ModelCategory;
  reason: string;
  estimatedCost?: number;
}

export interface CommandAnalysis {
  complexity: "simple" | "moderate" | "complex";
  requiresReasoning: boolean;
  requiresSpeed: boolean;
  requiresSpecialization: boolean;
  keywords: string[];
  estimatedTokens: number;
}

/**
 * Catálogo de modelos disponibles
 * Fácil de extender con nuevos modelos
 */
const MODEL_CATALOG: Record<string, ModelConfig> = {
  "meta/llama-3.1-70b-instruct": {
    id: "meta/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "nvidia",
    category: "reasoning",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: process.env.NVIDIA_API_KEY || "",
    maxTokens: 8000,
    temperature: 0.7,
    capabilities: ["reasoning", "code", "analysis", "complex-tasks"],
    enabled: true,
  },
  "mistralai/mistral-7b-instruct-v0.3": {
    id: "mistralai/mistral-7b-instruct-v0.3",
    name: "Mistral 7B",
    provider: "nvidia",
    category: "fast",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: process.env.NVIDIA_API_KEY || "",
    maxTokens: 4096,
    temperature: 0.7,
    capabilities: ["chat", "fast-response", "lightweight"],
    enabled: true,
  },
  "qwen/qwen2.5-72b-instruct": {
    id: "qwen/qwen2.5-72b-instruct",
    name: "Qwen 2.5 72B",
    provider: "nvidia",
    category: "reasoning",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: process.env.NVIDIA_API_KEY || "",
    maxTokens: 8000,
    temperature: 0.7,
    capabilities: ["reasoning", "multilingual", "code", "analysis"],
    enabled: true,
  },
  "deepseek-ai/deepseek-r1": {
    id: "deepseek-ai/deepseek-r1",
    name: "DeepSeek R1",
    provider: "nvidia",
    category: "reasoning",
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: process.env.NVIDIA_API_KEY || "",
    maxTokens: 8000,
    temperature: 0.7,
    capabilities: ["reasoning", "code", "analysis", "math"],
    enabled: true,
  },
};

/**
 * Analiza la orden del usuario para determinar su complejidad y requisitos
 */
export function analyzeCommand(command: string): CommandAnalysis {
  const lowerCommand = command.toLowerCase();
  
  // Palabras clave que indican complejidad
  const complexityKeywords = {
    simple: ["hola", "qué", "cuál", "cómo", "dónde", "cuándo", "quién"],
    moderate: ["analiza", "explica", "resume", "compara", "traduce", "convierte"],
    complex: ["diseña", "optimiza", "implementa", "crea", "resuelve", "arquitectura", "algoritmo"],
  };

  const reasoningKeywords = ["analiza", "explica", "por qué", "cómo", "diseña", "arquitectura", "algoritmo", "optimiza"];
  const speedKeywords = ["rápido", "breve", "resumen", "corto", "quick", "fast"];
  const specializationKeywords = ["código", "python", "javascript", "sql", "math", "matemática", "gráfica"];

  // Determinar complejidad
  let complexity: "simple" | "moderate" | "complex" = "simple";
  if (complexityKeywords.complex.some(k => lowerCommand.includes(k))) {
    complexity = "complex";
  } else if (complexityKeywords.moderate.some(k => lowerCommand.includes(k))) {
    complexity = "moderate";
  }

  // Determinar requisitos
  const requiresReasoning = reasoningKeywords.some(k => lowerCommand.includes(k));
  const requiresSpeed = speedKeywords.some(k => lowerCommand.includes(k));
  const requiresSpecialization = specializationKeywords.some(k => lowerCommand.includes(k));

  // Extraer palabras clave
  const keywords = lowerCommand
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 5);

  // Estimar tokens (aproximación: 1 token ≈ 4 caracteres)
  const estimatedTokens = Math.ceil(command.length / 4) + 100;

  return {
    complexity,
    requiresReasoning,
    requiresSpeed,
    requiresSpecialization,
    keywords,
    estimatedTokens,
  };
}

/**
 * Selecciona automáticamente el mejor modelo basado en el análisis de la orden
 */
export function routeToModel(analysis: CommandAnalysis): RoutingDecision {
  const enabledModels = Object.values(MODEL_CATALOG).filter(m => m.enabled);

  // Estrategia de enrutamiento inteligente
  if (analysis.requiresSpeed && !analysis.requiresReasoning) {
    // Para respuestas rápidas: usar Mistral
    const fastModel = enabledModels.find(m => m.category === "fast");
    if (fastModel) {
      return {
        modelId: fastModel.id,
        modelName: fastModel.name,
        category: fastModel.category,
        reason: "Modelo rápido seleccionado para respuesta inmediata",
      };
    }
  }

  if (analysis.complexity === "complex" || analysis.requiresReasoning) {
    // Para tareas complejas: usar Llama 3 o Qwen
    const reasoningModels = enabledModels.filter(m => m.category === "reasoning");
    // Preferir Llama 3 por su capacidad de razonamiento superior
    const selectedModel = reasoningModels.find(m => m.id === "llama-3-70b") || reasoningModels[0];
    if (selectedModel) {
      return {
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        category: selectedModel.category,
        reason: "Modelo de razonamiento seleccionado para tarea compleja",
      };
    }
  }

  if (analysis.requiresSpecialization) {
    // Para tareas especializadas: usar DeepSeek o Qwen
    const specializedModels = enabledModels.filter(m => 
      m.capabilities.includes("code") || m.capabilities.includes("math")
    );
    const selectedModel = specializedModels[0] || enabledModels[0];
    if (selectedModel) {
      return {
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        category: selectedModel.category,
        reason: "Modelo especializado seleccionado para tarea técnica",
      };
    }
  }

  // Por defecto: usar el primer modelo disponible
  const defaultModel = enabledModels[0] || Object.values(MODEL_CATALOG)[0];
  return {
    modelId: defaultModel.id,
    modelName: defaultModel.name,
    category: defaultModel.category,
    reason: "Modelo por defecto seleccionado",
  };
}

/**
 * Obtiene la configuración del modelo seleccionado
 */
export function getModelConfig(modelId: string): ModelConfig | null {
  return MODEL_CATALOG[modelId] || null;
}

/**
 * Registra un nuevo modelo en el catálogo (para extensibilidad futura)
 * Permite agregar modelos de NVIDIA NIM, custom endpoints, etc.
 */
export function registerModel(config: ModelConfig): void {
  MODEL_CATALOG[config.id] = config;
  console.log(`[Orchestrator] Modelo registrado: ${config.name} (${config.provider})`);
}

/**
 * Obtiene todos los modelos disponibles
 */
export function getAvailableModels(): ModelConfig[] {
  return Object.values(MODEL_CATALOG).filter(m => m.enabled);
}

/**
 * Deshabilita un modelo
 */
export function disableModel(modelId: string): void {
  if (MODEL_CATALOG[modelId]) {
    MODEL_CATALOG[modelId].enabled = false;
    console.log(`[Orchestrator] Modelo deshabilitado: ${modelId}`);
  }
}

/**
 * Habilita un modelo
 */
export function enableModel(modelId: string): void {
  if (MODEL_CATALOG[modelId]) {
    MODEL_CATALOG[modelId].enabled = true;
    console.log(`[Orchestrator] Modelo habilitado: ${modelId}`);
  }
}

/**
 * Obtiene estadísticas del orquestador
 */
export function getOrchestratorStats() {
  const allModels = Object.values(MODEL_CATALOG);
  const enabledModels = allModels.filter(m => m.enabled);
  
  const providerSet = new Set<ModelProvider>();
  const categorySet = new Set<ModelCategory>();
  
  allModels.forEach(m => {
    providerSet.add(m.provider);
    categorySet.add(m.category);
  });
  
  return {
    totalModels: allModels.length,
    enabledModels: enabledModels.length,
    providers: Array.from(providerSet),
    categories: Array.from(categorySet),
    models: enabledModels.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      provider: m.provider,
    })),
  };
}
