import { H3Event } from "h3";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { Database } from "~/types/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, "id");
  const formData = await readFormData(event);
  const supabase = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);
  if (user) {
    let mediaUrl: string | null = null;
    const fileBody = formData.get("media");
    if (fileBody && (fileBody as File).size > 0) {
      const { error, data } = await supabase.storage.from("media").upload(crypto.randomUUID(), fileBody);
      if (error) {
        return sendError(event, error);
      }

      const { data: dt } = supabase.storage.from("media").getPublicUrl(data.path);
      mediaUrl = dt.publicUrl;
    }
    const content = formData.get("content");
    if (mediaUrl === null && content === null) {
      throw createError({ statusText: "Bad Request", statusCode: 400, message: "attempting to send an empty message" });
    }

    return await supabase.from("messages").insert(
      {
        conversation: parseInt(id as string),
        sent_by: user.id as string,
        media: mediaUrl,
        content: content as string,
      });
  }
});
