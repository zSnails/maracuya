import { H3Event } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const supabase = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);
  if (user) {
    return await supabase.from("messages").insert({ conversation: parseInt(id as string), sent_by: user.id as string, content: body.content as string });
  }
});
