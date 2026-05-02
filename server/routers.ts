import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createTask, updateTaskStatus, createLog, getUserTasks } from "./db";
import { executeCommand } from "./llm-service";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  agent: router({
    executeCommand: protectedProcedure
      .input(
        z.object({
          taskId: z.string(),
          command: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        try {
          // Crear tarea en la base de datos
          await createTask(userId, input.command, input.taskId);
          
          // Registrar log inicial
          await createLog(input.taskId, userId, "info", `Iniciando ejecución: ${input.command}`);

          // Actualizar estado a "running"
          await updateTaskStatus(input.taskId, "running");

          // Ejecutar comando con LLM
          const result = await executeCommand(input.command);
          
          // Registrar log de éxito
          await createLog(input.taskId, userId, "success", "Comando ejecutado exitosamente", result);

          // Actualizar estado a "completed"
          await updateTaskStatus(input.taskId, "completed", result);

          return {
            taskId: input.taskId,
            result,
            success: true,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error desconocido";
          
          // Registrar log de error
          await createLog(input.taskId, userId, "error", `Error durante ejecución: ${errorMessage}`);

          // Actualizar estado a "error"
          await updateTaskStatus(input.taskId, "error", undefined, errorMessage);

          throw error;
        }
      }),

    getTasks: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        const userTasks = await getUserTasks(userId);
        return userTasks || [];
      } catch (error) {
        console.error("[Router] Error getting tasks:", error);
        return [];
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
