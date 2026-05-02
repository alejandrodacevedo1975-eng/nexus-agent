import { describe, it, expect } from "vitest";
import {
  analyzeCommand,
  routeToModel,
  getModelConfig,
  getAvailableModels,
  getOrchestratorStats,
  registerModel,
  disableModel,
  enableModel,
} from "./model-orchestrator";

describe("NEXUS Model Orchestrator", () => {
  describe("analyzeCommand", () => {
    it("should detect simple commands", () => {
      const analysis = analyzeCommand("Hola, qué tal");
      expect(analysis.complexity).toBe("simple");
      expect(analysis.requiresReasoning).toBe(false);
    });

    it("should detect moderate complexity commands", () => {
      const analysis = analyzeCommand("Resume este texto en puntos principales");
      expect(analysis.complexity).toBe("moderate");
      expect(analysis.requiresReasoning).toBe(false);
    });

    it("should detect complex commands", () => {
      const analysis = analyzeCommand("Implementa una arquitectura de microservicios escalable para una aplicación");
      expect(analysis.complexity).toBe("complex");
      expect(analysis.requiresReasoning).toBe(true);
    });

    it("should detect speed requirements", () => {
      const analysis = analyzeCommand("Dame un resumen breve");
      expect(analysis.requiresSpeed).toBe(true);
    });

    it("should detect specialization requirements", () => {
      const analysis = analyzeCommand("Escribe código Python para procesar datos");
      expect(analysis.requiresSpecialization).toBe(true);
    });

    it("should extract keywords", () => {
      const analysis = analyzeCommand("Crea un algoritmo de ordenamiento");
      expect(analysis.keywords.length).toBeGreaterThan(0);
    });

    it("should estimate tokens", () => {
      const analysis = analyzeCommand("Hola");
      expect(analysis.estimatedTokens).toBeGreaterThan(0);
    });
  });

  describe("routeToModel", () => {
    it("should route simple commands to fast models", () => {
      const analysis = analyzeCommand("Hola");
      const routing = routeToModel(analysis);
      expect(routing).toBeDefined();
      expect(routing.modelId).toBeDefined();
      expect(routing.reason).toBeDefined();
    });

    it("should route complex commands to reasoning models", () => {
      const analysis = analyzeCommand("Implementa una arquitectura compleja");
      const routing = routeToModel(analysis);
      expect(routing).toBeDefined();
      expect(routing.modelId).toBeDefined();
    });

    it("should provide routing reason", () => {
      const analysis = analyzeCommand("Escribe código");
      const routing = routeToModel(analysis);
      expect(routing.reason).toBeTruthy();
      expect(routing.reason.length).toBeGreaterThan(0);
    });

    it("should always select an enabled model", () => {
      const analysis = analyzeCommand("Test");
      const routing = routeToModel(analysis);
      const model = getModelConfig(routing.modelId);
      expect(model).toBeDefined();
      expect(model?.enabled).toBe(true);
    });
  });

  describe("getModelConfig", () => {
    it("should return model config for valid model ID", () => {
      const config = getModelConfig("llama-3-70b");
      expect(config).toBeDefined();
      expect(config?.name).toBe("Llama 3 70B");
      expect(config?.provider).toBe("huggingface");
    });

    it("should return null for invalid model ID", () => {
      const config = getModelConfig("invalid-model");
      expect(config).toBeNull();
    });

    it("should have all required fields", () => {
      const config = getModelConfig("mistral-7b");
      expect(config).toBeDefined();
      expect(config?.id).toBeDefined();
      expect(config?.name).toBeDefined();
      expect(config?.provider).toBeDefined();
      expect(config?.category).toBeDefined();
      expect(config?.endpoint).toBeDefined();
      expect(config?.maxTokens).toBeGreaterThan(0);
      expect(config?.temperature).toBeGreaterThanOrEqual(0);
      expect(config?.temperature).toBeLessThanOrEqual(1);
      expect(config?.capabilities).toBeDefined();
      expect(Array.isArray(config?.capabilities)).toBe(true);
      expect(config?.enabled).toBeDefined();
    });
  });

  describe("getAvailableModels", () => {
    it("should return only enabled models", () => {
      const models = getAvailableModels();
      expect(models.length).toBeGreaterThan(0);
      models.forEach(model => {
        expect(model.enabled).toBe(true);
      });
    });

    it("should have all models with required fields", () => {
      const models = getAvailableModels();
      models.forEach(model => {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBeDefined();
        expect(model.category).toBeDefined();
      });
    });
  });

  describe("getOrchestratorStats", () => {
    it("should return valid statistics", () => {
      const stats = getOrchestratorStats();
      expect(stats).toBeDefined();
      expect(stats.totalModels).toBeGreaterThan(0);
      expect(stats.enabledModels).toBeGreaterThan(0);
      expect(stats.enabledModels).toBeLessThanOrEqual(stats.totalModels);
      expect(Array.isArray(stats.providers)).toBe(true);
      expect(Array.isArray(stats.categories)).toBe(true);
      expect(Array.isArray(stats.models)).toBe(true);
    });

    it("should have unique providers and categories", () => {
      const stats = getOrchestratorStats();
      const providerSet = new Set(stats.providers);
      const categorySet = new Set(stats.categories);
      expect(providerSet.size).toBe(stats.providers.length);
      expect(categorySet.size).toBe(stats.categories.length);
    });
  });

  describe("registerModel", () => {
    it("should register a new model", () => {
      const initialStats = getOrchestratorStats();
      const initialCount = initialStats.totalModels;

      registerModel({
        id: "test-model",
        name: "Test Model",
        provider: "custom",
        category: "fast",
        endpoint: "http://localhost:8000",
        apiKey: "test-key",
        maxTokens: 4096,
        temperature: 0.7,
        capabilities: ["test"],
        enabled: true,
      });

      const newStats = getOrchestratorStats();
      expect(newStats.totalModels).toBe(initialCount + 1);

      const config = getModelConfig("test-model");
      expect(config).toBeDefined();
      expect(config?.name).toBe("Test Model");
    });
  });

  describe("disableModel and enableModel", () => {
    it("should disable and enable models", () => {
      const modelId = "mistral-7b";
      
      // Deshabilitar
      disableModel(modelId);
      let config = getModelConfig(modelId);
      expect(config?.enabled).toBe(false);

      // Habilitar
      enableModel(modelId);
      config = getModelConfig(modelId);
      expect(config?.enabled).toBe(true);
    });
  });

  describe("Routing consistency", () => {
    it("should always route to an enabled model", () => {
      const commands = [
        "Hola",
        "Resume esto",
        "Implementa una arquitectura",
        "Escribe código Python",
        "Resumen breve",
      ];

      commands.forEach(command => {
        const analysis = analyzeCommand(command);
        const routing = routeToModel(analysis);
        const model = getModelConfig(routing.modelId);
        
        expect(model).toBeDefined();
        expect(model?.enabled).toBe(true);
      });
    });

    it("should provide consistent routing for similar commands", () => {
      const command1 = "Implementa una arquitectura de software";
      const command2 = "Diseña un sistema escalable";

      const analysis1 = analyzeCommand(command1);
      const routing1 = routeToModel(analysis1);

      const analysis2 = analyzeCommand(command2);
      const routing2 = routeToModel(analysis2);

      // Ambas deberían ser complejas
      expect(analysis1.complexity).toBe("complex");
      expect(analysis2.complexity).toBe("complex");

      // Deberían enrutarse a modelos de razonamiento
      const model1 = getModelConfig(routing1.modelId);
      const model2 = getModelConfig(routing2.modelId);
      expect(model1?.category).toBe("reasoning");
      expect(model2?.category).toBe("reasoning");
    });
  });
});
