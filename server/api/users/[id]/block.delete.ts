import { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient<Database>(event);
  const { id } = await readBody<{ id: number }>(event);

  const { data, error } = await client.from("blocked_users").delete().eq("id", id);
  if (error) throw error;
  return data;
});
