import { H3Event } from "h3";
import { Database } from "~/types/supabase";
import { serverSupabaseClient } from "#supabase/server";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export default defineEventHandler(async (event: H3Event) => {
  const form = await readBody<RegisterUserData>(event);
  const supabase = await serverSupabaseClient<Database>(event);
  const { error, data } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        display_name: form.name
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
});
