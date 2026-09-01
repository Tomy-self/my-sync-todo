import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, Trash2 } from "lucide-react";

import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib/todos.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/todos")({
  component: TodosPage,
  head: () => ({
    meta: [
      { title: "내 할 일" },
      { name: "description", content: "로그인한 사용자의 할 일 목록" },
      { property: "og:title", content: "내 할 일" },
      { property: "og:description", content: "로그인한 사용자의 할 일 목록" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function TodosPage() {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodos(),
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTodo.trim();
    if (!title) return;

    try {
      await createTodo({ data: { title } });
      setNewTodo("");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("할 일이 추가되었습니다.");
    } catch (error) {
      toast.error("할 일 추가에 실패했습니다.");
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    try {
      await updateTodo({ data: { id, completed: !completed } });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch (error) {
      toast.error("상태 변경에 실패했습니다.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTodo({ data: { id } });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("할 일이 삭제되었습니다.");
    } catch (error) {
      toast.error("삭제에 실패했습니다.");
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">할 일 앱</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>내 할 일</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="mb-6 flex gap-2">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="새 할 일을 입력하세요..."
              />
              <Button type="submit">추가</Button>
            </form>

            {isLoading ? (
              <p className="text-center text-muted-foreground">불러오는 중...</p>
            ) : todos.length === 0 ? (
              <p className="text-center text-muted-foreground">할 일이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                      aria-label={`${todo.title} 완료로 표시`}
                    />
                    <span
                      className={`flex-1 ${todo.completed ? "text-muted-foreground line-through" : ""}`}
                    >
                      {todo.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(todo.id)}
                      aria-label="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
