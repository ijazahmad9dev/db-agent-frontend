import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: api.getCurrentUser,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    await api.logout();
    queryClient.clear();
    router.push("/");
    router.refresh();
  };
}