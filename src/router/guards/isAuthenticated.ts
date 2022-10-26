import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useUserStore } from "@/stores/user";


export function isAuthenticated(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = useUserStore();

  if (userStore.isAuthenticated)
    return next();

  if (userStore.refresh_token) {
    return userStore.refreshToken().then(() => {
      next();
    }).catch(() => {
      next({ name: 'login' })
    })
  }

  next({ name: 'login' })
}