import { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient<Database>(event);
  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    throw createError({
      status: error.status,
      message: error.message,
      statusText: error.name
    })
  }

  return sendRedirect(event, "/login", 303);
});
