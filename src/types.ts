export interface League {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  member_count: number;
}

export type Event = {
  id: string;
  league_id: string;
  // Add other event properties based on your database schema
}; 