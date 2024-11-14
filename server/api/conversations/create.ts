import { H3Event } from "h3";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";
import { type User } from "@supabase/supabase-js";

export default defineEventHandler(async (event: H3Event) => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event) as User;
  const formData = await readFormData(event);
  const email = formData.get("email") as string;
  const { data: otherUser, error } = await client.from("users").select("id, email, raw_user_meta_data").eq("email", email).single();

  if (error) throw createError({
    statusCode: 404,
    statusMessage: `no user with the ${email} email found`
  });

  const exists = await client.from("conversations").select("*", { head: true, count: 'exact' }).or(
    `and(peer_a.eq.${user.id}, peer_b.eq.${otherUser.id}),and(peer_b.eq.${user.id}, peer_a.eq.${otherUser.id})`
  );
  const count = exists.count!!;
  if (count > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "conversation already exists"
    });
  }

  const response = await client.from("conversations").insert({
    peer_a: user?.id as string,
    peer_b: otherUser?.id as string,
  }).select().single();
  if (response.error) throw response.error;

  return {
    id: response.data.id, peer: otherUser
  };

});
