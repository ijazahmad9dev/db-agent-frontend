import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { SemanticLayer } from "@/lib/types";

export function useSemanticLayer(connectionId: string) {
  return useQuery({ queryKey: ["semantic", connectionId], queryFn: () => api.getSemanticLayer(connectionId) });
}

export function useUpdateSemanticLayer(connectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (layer: SemanticLayer) => api.updateSemanticLayer(connectionId, layer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semantic", connectionId] });
      queryClient.invalidateQueries({ queryKey: ["erd", connectionId] }); // ERD edges are semantic-layer-derived for CSV/Sheets — must refresh too
    },
  });
}