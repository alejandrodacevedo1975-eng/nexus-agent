import {
  analyzeCommand,
  routeToModel,
  getModelConfig,
  RoutingDecision,
} from "./model-orchestrator";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
  modelId: string;
  provider: string;
  tokens: {
    input: number;
    output: number;
  };
}

/**
 * Llama al modelo seleccionado automáticamente por el orquestador
 */
export async function callLLM(
  messages: LLMMessage[]
): Promise<LLMResponse> {
  // Extraer el último mensaje del usuario para análisis
  const userMessage = messages.find(m => m.role === "user")?.content || "";
  
  // Analizar la orden
  const analysis = analyzeCommand(userMessage);
  
  // Obtener decisión de enrutamiento automático
  const routing = routeToModel(analysis);
  
  // Obtener configuración del modelo
  const modelConfig = getModelConfig(routing.modelId);
  if (!modelConfig) {
    throw new Error(`Modelo no encontrado: ${routing.modelId}`);
  }

  console.log(`[NEXUS Orchestrator] Orden analizada:`, {
    complexity: analysis.complexity,
    requiresReasoning: analysis.requiresReasoning,
    requiresSpeed: analysis.requiresSpeed,
    selectedModel: routing.modelId,
    reason: routing.reason,
  });

  try {
    const response = await fetch(modelConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: routing.modelId,
        messages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
      model: string;
    };

    return {
      content: data.choices[0]?.message.content || "",
      model: modelConfig.name,
      modelId: routing.modelId,
      provider: modelConfig.provider,
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    console.error("[NEXUS LLM Service] Error:", error);
    throw error;
  }
}

/**
 * Ejecuta un comando con el orquestador automático
 * El usuario siempre siente que habla con 'NEXUS', sin saber qué modelo corre por detrás
 */
export async function executeCommand(command: string): Promise<string> {
  const systemPrompt = `Eres NEXUS, un agente autónomo de IA de última generación diseñado para ejecutar órdenes en lenguaje natural.
Tu tarea es:
1. Analizar la orden del usuario
2. Planificar los pasos necesarios
3. Ejecutar cada paso de forma autónoma
4. Reportar los resultados de forma clara y concisa

Responde siempre en JSON con el siguiente formato:
{
  "plan": "descripción del plan",
  "steps": ["paso 1", "paso 2", ...],
  "result": "resultado de la ejecución",
  "status": "success" | "error"
}`;

  try {
    const response = await callLLM([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: command,
      },
    ]);

    // Intentar parsear la respuesta como JSON
    try {
      const parsed = JSON.parse(response.content);
      return JSON.stringify({
        ...parsed,
        _metadata: {
          model: response.model,
          modelId: response.modelId,
          provider: response.provider,
          tokens: response.tokens,
        },
      });
    } catch {
      // Si no es JSON válido, retornar como texto
      return JSON.stringify({
        plan: "Ejecución de orden",
        steps: [command],
        result: response.content,
        status: "success",
        _metadata: {
          model: response.model,
          modelId: response.modelId,
          provider: response.provider,
          tokens: response.tokens,
        },
      });
    }
  } catch (error) {
    console.error("[NEXUS] Error executing command:", error);
    throw error;
  }
}

/**
 * Obtiene información sobre el modelo que se usará para una orden
 * (Útil para debugging, pero no se muestra al usuario)
 */
export async function getModelForCommand(command: string): Promise<RoutingDecision> {
  const analysis = analyzeCommand(command);
  return routeToModel(analysis);
}
