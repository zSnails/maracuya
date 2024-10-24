import { defineNuxtPlugin } from "nuxt/app";
import mitt from "mitt";
import { type User } from "@supabase/supabase-js";

type ApplicationEvents = {
  "user:enter": User,
  "user:exit": User,
};

export default defineNuxtPlugin(() => {
  const emitter = mitt<ApplicationEvents>();

  return {
    provide: {
      listen: emitter.on,
      emit: emitter.emit,
    }
  }
});
