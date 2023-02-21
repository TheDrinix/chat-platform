import { useUserStore } from "@/stores/user";

export const checkTokenExpirationError = async (error: any) => {
  if (error.response.status === 401) {
    if (error.response.data.message === 'EXPIRED') {
      const userStore = useUserStore();

      return await userStore.refreshToken();
    }
  }
  return false;
}