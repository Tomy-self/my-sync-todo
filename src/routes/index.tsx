import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "할 일 앱" },
      { name: "description", content: "로그인하고 할 일을 관리하세요." },
      { property: "og:title", content: "할 일 앱" },
      { property: "og:description", content: "로그인하고 할 일을 관리하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">할 일 앱</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        로그인하고 간편하게 할 일을 관리하세요.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link to="/auth">시작하기</Link>
        </Button>
      </div>
    </div>
  );
}
