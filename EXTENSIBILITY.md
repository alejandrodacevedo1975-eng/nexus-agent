# NEXUS Model Extensibility Guide

## Overview

NEXUS es un Orquestador Inteligente Invisible que selecciona automáticamente el mejor modelo para cada tarea. La arquitectura está diseñada para ser fácilmente extensible con nuevos modelos y proveedores.

## Agregar Nuevos Modelos

### 1. Registrar un Modelo en el Catálogo

Edita `server/model-orchestrator.ts` y agrega tu modelo al objeto `MODEL_CATALOG`:

```typescript
const MODEL_CATALOG: Record<string, ModelConfig> = {
  // ... modelos existentes ...
  
  "tu-modelo-nuevo": {
    id: "tu-modelo-nuevo",
    name: "Tu Modelo Nuevo",
    provider: "nvidia", // o "huggingface", "custom", etc.
    category: "reasoning", // "reasoning", "fast", "specialized"
    endpoint: "https://api.ejemplo.com/v1/chat/completions",
    apiKey: process.env.TU_MODELO_API_KEY || "",
    maxTokens: 8000,
    temperature: 0.7,
    costPerMTok: 0.001, // opcional
    capabilities: ["reasoning", "code", "analysis"], // qué puede hacer
    enabled: true,
  },
};
```

### 2. Configurar Variables de Entorno

Agrega la clave API en tu archivo `.env`:

```
TU_MODELO_API_KEY=sk-xxxxxxxxxxxxx
```

### 3. Registrar Dinámicamente (Opcional)

Si prefieres registrar modelos en tiempo de ejecución:

```typescript
import { registerModel } from "./server/model-orchestrator";

registerModel({
  id: "nvidia-nim-model",
  name: "NVIDIA NIM Model",
  provider: "nvidia",
  category: "reasoning",
  endpoint: "https://nim-api.nvidia.com/v1/chat/completions",
  apiKey: process.env.NVIDIA_NIM_API_KEY || "",
  maxTokens: 16000,
  temperature: 0.7,
  capabilities: ["reasoning", "code", "analysis", "vision"],
  enabled: true,
});
```

## Ejemplos de Integración

### NVIDIA NIM (Next Generation Inference Microservices)

```typescript
registerModel({
  id: "nvidia-llama-70b",
  name: "NVIDIA Llama 70B",
  provider: "nvidia",
  category: "reasoning",
  endpoint: "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/xxxxx",
  apiKey: process.env.NVIDIA_API_KEY || "",
  maxTokens: 16000,
  temperature: 0.7,
  capabilities: ["reasoning", "code", "analysis", "multilingual"],
  enabled: true,
});
```

### Anthropic Claude

```typescript
registerModel({
  id: "claude-3-opus",
  name: "Claude 3 Opus",
  provider: "custom",
  category: "reasoning",
  endpoint: "https://api.anthropic.com/v1/messages",
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  maxTokens: 200000,
  temperature: 0.7,
  capabilities: ["reasoning", "code", "analysis", "vision"],
  enabled: true,
});
```

### Servidor Local (Ollama, vLLM, etc.)

```typescript
registerModel({
  id: "local-mistral",
  name: "Mistral Local",
  provider: "custom",
  category: "fast",
  endpoint: "http://localhost:8000/v1/chat/completions",
  apiKey: "local", // No requiere clave
  maxTokens: 4096,
  temperature: 0.7,
  capabilities: ["chat", "fast-response"],
  enabled: true,
});
```

## Personalizar Lógica de Enrutamiento

La función `routeToModel()` en `server/model-orchestrator.ts` decide qué modelo usar. Puedes personalizarla:

```typescript
export function routeToModel(analysis: CommandAnalysis): RoutingDecision {
  const enabledModels = Object.values(MODEL_CATALOG).filter(m => m.enabled);

  // Tu lógica personalizada
  if (analysis.requiresSpeed && !analysis.requiresReasoning) {
    // Usar modelo rápido
    const fastModel = enabledModels.find(m => m.category === "fast");
    if (fastModel) return { modelId: fastModel.id, /* ... */ };
  }

  // ... más lógica ...
}
```

## Gestionar Modelos en Tiempo de Ejecución

### Deshabilitar un Modelo

```typescript
import { disableModel } from "./server/model-orchestrator";

disableModel("mistral-7b");
```

### Habilitar un Modelo

```typescript
import { enableModel } from "./server/model-orchestrator";

enableModel("mistral-7b");
```

### Obtener Estadísticas

```typescript
import { getOrchestratorStats } from "./server/model-orchestrator";

const stats = getOrchestratorStats();
console.log(stats);
// {
//   totalModels: 5,
//   enabledModels: 4,
//   providers: ["huggingface", "nvidia", "custom"],
//   categories: ["reasoning", "fast", "specialized"],
//   models: [...]
// }
```

## Flujo de Decisión

1. **Análisis**: El usuario envía una orden
2. **Clasificación**: `analyzeCommand()` determina:
   - Complejidad (simple, moderate, complex)
   - Requisitos (reasoning, speed, specialization)
   - Palabras clave
3. **Enrutamiento**: `routeToModel()` selecciona el mejor modelo basado en el análisis
4. **Ejecución**: `callLLM()` usa el modelo seleccionado
5. **Abstracción**: El usuario siempre ve "NEXUS" como respuesta

## Monitoreo y Debugging

Los logs del orquestador muestran qué modelo se seleccionó:

```
[NEXUS Orchestrator] Orden analizada: {
  complexity: "complex",
  requiresReasoning: true,
  requiresSpeed: false,
  selectedModel: "llama-3-70b",
  reason: "Modelo de razonamiento seleccionado para tarea compleja"
}
```

## Mejores Prácticas

1. **Categorizar correctamente**: Asegúrate de que `category` refleje las capacidades reales del modelo
2. **Capabilities**: Lista todas las capacidades para que el enrutador pueda tomar mejores decisiones
3. **Costo**: Si proporcionas `costPerMTok`, el orquestador puede optimizar por costo
4. **Fallback**: Siempre ten al menos un modelo habilitado como fallback
5. **Testing**: Prueba el enrutamiento con diferentes tipos de órdenes

## Arquitectura Futura

NEXUS está diseñado para soportar:

- **Multi-modelo**: Usar múltiples modelos en paralelo y combinar resultados
- **Caché**: Almacenar respuestas para órdenes similares
- **Balanceo de carga**: Distribuir carga entre múltiples instancias del mismo modelo
- **Feedback**: Aprender qué modelo funciona mejor para cada tipo de tarea
- **Costos**: Optimizar automáticamente por costo vs. calidad

---

**Recuerda**: El usuario siempre siente que habla con NEXUS, sin importar qué modelo corra por detrás.
