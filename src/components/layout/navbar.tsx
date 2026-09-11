"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const isOnHome = pathname === "/";

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            DB Agent
          </Link>
          {!isOnHome && (
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Connections
              </Link>
            </Button>
          )}
        </div>
        <LoginButton />
      </div>
    </header>
  );
}