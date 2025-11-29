import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="text-xl font-bold">Careers Page Builder</div>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build Beautiful Careers Pages in Minutes
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Create stunning, customizable careers pages for your company. Manage
            jobs, track applications, and attract top talent, all in one place.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo-company">View Demo</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="text-2xl font-bold">🎨</div>
            <h3 className="font-semibold">Customizable Design</h3>
            <p className="text-sm text-muted-foreground">
              Build your careers page with drag-and-drop sections
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">💼</div>
            <h3 className="font-semibold">Job Management</h3>
            <p className="text-sm text-muted-foreground">
              Post jobs and manage applications in one dashboard
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">🚀</div>
            <h3 className="font-semibold">SEO Optimized</h3>
            <p className="text-sm text-muted-foreground">
              Server-rendered pages with structured data for search engines
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Careers Page Builder. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
