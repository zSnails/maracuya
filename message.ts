export interface Message {
  content: string | null;
  conversation: number;
  created_at: string;
  id: number;
  media: string | null;
  sent_by: string;
}
