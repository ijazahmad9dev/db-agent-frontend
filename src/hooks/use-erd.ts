import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useERD(connectionId: string, tables?: string[], options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["erd", connectionId, tables],
    queryFn: () => api.getERD(connectionId, tables),
    enabled: options?.enabled ?? true,
  });
}