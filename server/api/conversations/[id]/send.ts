import { H3Event } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/supabase";

function getOtherUser(myId: string, data: { peer_a: string; peer_b: string }): string {
  if (myId === data.peer_a) return data.peer_b;
  return data.peer_a;
}

export default defineEventHandler(async (event: H3Event) => {
  const channelId = getRouterParam(event, "id") as string;
  const formData = await readFormData(event);
  const supabase = await serverSupabaseClient<Database>(event);
  const user = (await serverSupabaseUser(event))!!;
  const { data, error } = await supabase.from("conversations").select("peer_a, peer_b").eq("id", channelId).single();
  if (error) throw error;
  const otherUser = getOtherUser(user?.id as string, data!!);
  console.log("sender.id (", user.user_metadata.display_name, ")", user.id);
  console.log("receiver", otherUser);
  const { count, error: err } = await supabase.from("blocked_users").select("*", { head: true, count: "exact" }).eq("user_id", otherUser).eq('blocked_user_id', user.id);
  if (err) throw err;
  console.log(count);

  if (count && count > 0) {
    throw createError({
      statusCode: 403,
      message: "cannot send message"
    });
  }

  if (user) {
    let mediaUrl: string | null = null;
    const fileBody = formData.get("media");
    if (fileBody && (fileBody as File).size > 0) {
      const { error, data } = await supabase.storage.from("media").upload(crypto.randomUUID(), fileBody);
      if (error) {
        throw createError(error);
      }

      const { data: dt } = supabase.storage.from("media").getPublicUrl(data.path);
      mediaUrl = dt.publicUrl;
    }
    const content = formData.get("content");
    if (mediaUrl === null && content === "") {
      throw createError({ statusText: "Bad Request", statusCode: 400, message: "attempting to send an empty message" });
    }

    return await supabase.from("messages").insert(
      {
        conversation: parseInt(channelId as string),
        sent_by: user.id as string,
        media: mediaUrl,
        content: content as string,
      });
  }
});
