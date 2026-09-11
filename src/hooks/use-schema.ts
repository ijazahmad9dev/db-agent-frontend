import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useSchema(connectionId: string) {
  return useQuery({ queryKey: ["schema", connectionId], queryFn: () => api.getSchema(connectionId) });
}