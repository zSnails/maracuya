import type { Json } from "./types/supabase";

export interface User {
  id?: number | null;
  email?: string | null;
  img?: string | null;
  raw_user_meta_data: Json
}
