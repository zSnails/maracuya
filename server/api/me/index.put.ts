import { H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/supabase";

interface BodyUpdateParams {
  name?: string;
  email?: string;
};

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody<BodyUpdateParams>(event);
  const supabase = await serverSupabaseClient<Database>(event);
  const { error, data } = await supabase.auth.updateUser({
    email: body.email,
    data: {
      display_name: body.name
    }
  });
  if (error) {
    throw createError({
      statusCode: error.status,
      status: error.status,
      name: error.name,
      message: error.message,
      statusText: error.name,
    });
  }

  return { status: 200, data };
});
