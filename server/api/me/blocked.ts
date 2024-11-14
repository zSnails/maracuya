import { H3Event } from "h3";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient<Database>(event);
  const authUser = (await serverSupabaseUser(event))!!;
  const { data } = await client.from("blocked_users").select("*").eq("user_id", authUser.id);
  return data;
});
