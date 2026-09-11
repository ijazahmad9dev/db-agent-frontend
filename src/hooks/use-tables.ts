import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useTables(connectionId: string) {
  return useQuery({ queryKey: ["tables", connectionId], queryFn: () => api.listTables(connectionId) });
}

export function useSelectedTables(connectionId: string) {
  return useQuery({ queryKey: ["selected-tables", connectionId], queryFn: () => api.getSelectedTables(connectionId) });
}

export function useSelectTables(connectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableNames: string[]) => api.selectTables(connectionId, tableNames),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["selected-tables", connectionId] }),
  });
}

export function useDraftSemanticLayer(connectionId: string) {
  return useMutation({ mutationFn: () => api.draftSemanticLayer(connectionId) });
}