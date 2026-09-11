import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useConnections() {
  return useQuery({ queryKey: ["connections"], queryFn: api.listConnections });
}

export function useCreateCSVConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, files }: { name: string; files: File[] }) => api.createCSVConnection(name, files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, source_type, config }: { name: string; source_type: string; config: Record<string, unknown> }) =>
      api.createConnection(name, source_type, config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteConnection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connections"] }),
  });
}