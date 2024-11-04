import { H3Event } from "h3";
import { Database } from "~/types/supabase";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient<Database>(event);
  const loginInfo = await readBody(event);
  const { error, data } = await supabase.auth.signInWithPassword(loginInfo);
  if (error) {
    throw createError({
      status: error.status,
      message: error.message
    });
  }

  return {
    status: 200,
    user: data.user,
  };
});
