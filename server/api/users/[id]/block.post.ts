import { H3Event } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const toBlock = getRouterParam(event, "id") as string;
  const me = (await serverSupabaseUser(event))!!;
  const supabase = await serverSupabaseClient<Database>(event);

  const { count } = await supabase.from("blocked_users").select("*", { head: true, count: 'exact' }).eq("user_id", me.id).eq("blocked_user_id", toBlock);
  if (count && count > 0) {
    throw createError({
      statusCode: 400,
      message: "this user has already been blocked by you"
    });
  }

  const { error, data } = await supabase.from("blocked_users").insert({
    user_id: me.id,
    blocked_user_id: toBlock,
  });

  if (error) throw error;

  return data;
});
