import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    authUser: data?.user || null,
    isLoading,
    error,
    refetch,
  };
};

export default useAuthUser;