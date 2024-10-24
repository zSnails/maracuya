import { defineNuxtRouteMiddleware } from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (to.path.startsWith("/api") && !user.value) return abortNavigation("not authorized");

  if (to.path === "/login" || to.path === '/register') {
    if (user.value) {
      return abortNavigation();
    }
    return;
  }

  if (user.value === null) {
    return navigateTo("/login");
  }
});
