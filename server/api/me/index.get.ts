import { H3Event } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { type User } from "@supabase/supabase-js";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event) as User;

  const tmpChats = await supabase
    .from("conversations")
    .select("id, created_at, peer_a:users!conversations_peer_a_fkey(id, email, raw_user_meta_data), peer_b:users!conversations_peer_b_fkey(id, email, raw_user_meta_data)")
    .or(`peer_a.eq.${user.id},peer_b.eq.${user.id}`);

  const chats = tmpChats.data?.map((elem) => {
    if (elem.peer_a?.id === user.id)
      return { id: elem.id, peer: elem.peer_b };
    return { id: elem.id, peer: elem.peer_a };
  });

  return { status: tmpChats.status, data: chats }
});
