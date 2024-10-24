import { defineNuxtRouteMiddleware } from "nuxt/app";

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (to.path === "/login" || to.path === '/register') {
    if (user.value) {
      return navigateTo("/");
    }
    return;
  }

  if (user.value === null) {
    return navigateTo("/login");
  }
});
