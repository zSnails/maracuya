import { H3Event } from "h3";
import { serverSupabaseClient } from '#supabase/server';
import { Database } from "~/types/supabase";
export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient<Database>(event);
  const conversationId = getRouterParam(event, "id") as string;

  const { data, error } = await client.from("conversations").delete().eq("id", conversationId);
  if (error) throw error;

  return data;
});
