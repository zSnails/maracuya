import { defineNuxtRouteMiddleware } from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (to.path.startsWith("/api") && !user.value) return abortNavigation("not authorized");

  if (to.path === "/login" || to.path === '/register') {
    if (user.value) {
      return abortNavigation("user already logged in");
    }
    return;
  }

  if (user.value === null) {
    return navigateTo("/login");
  }
});
