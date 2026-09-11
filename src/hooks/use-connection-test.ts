import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useTestConnection() {
  return useMutation({ mutationFn: (id: string) => api.testConnection(id) });
}