
export interface Reward {
  id: string;
  title: string;
  description: string | null;
  points: number;
  image_url?: string | null;
  user_id: string;
  created_at?: string;
}
