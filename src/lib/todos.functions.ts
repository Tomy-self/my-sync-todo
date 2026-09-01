import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createTodoSchema = z.object({
  title: z.string().min(1).max(500),
});

const updateTodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});

const deleteTodoSchema = z.object({
  id: z.string().uuid(),
});

export const getTodos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("todos")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createTodoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: todo, error } = await context.supabase
      .from("todos")
      .insert({
        title: data.title,
        user_id: context.userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return todo;
  });

export const updateTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateTodoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.title !== undefined) update.title = data.title;
    if (data.completed !== undefined) update.completed = data.completed;

    const { data: todo, error } = await context.supabase
      .from("todos")
      .update(update)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return todo;
  });

export const deleteTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => deleteTodoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("todos")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });
