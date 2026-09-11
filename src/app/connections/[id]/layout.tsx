"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSelectedTables } from "@/hooks/use-tables";

const TABS = [
  { label: "Tables", path: "tables", requiresSelection: false },
  { label: "ERD", path: "erd", requiresSelection: true },
  { label: "Chat", path: "chat", requiresSelection: true },
];

export default function ConnectionLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { data: selected } = useSelectedTables(id);
  const hasSelection = (selected?.table_names?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b">
        {TABS.map((tab) => {
          const href = `/connections/${id}/${tab.path}`;
          const isActive = pathname === href;
          const disabled = tab.requiresSelection && !hasSelection;

          if (disabled) {
            return (
              <span
                key={tab.path}
                title="Select tables first"
                className="cursor-not-allowed border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground/50"
              >
                {tab.label}
              </span>
            );
          }

          return (
            <Link
              key={tab.path}
              href={href}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}