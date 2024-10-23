import { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import { type Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, "id");
  const supabase = await serverSupabaseClient<Database>(event);

  return await supabase.from("messages").select("*").eq("conversation", id as string).order("created_at");
});
