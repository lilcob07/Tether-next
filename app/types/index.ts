export interface Post {
  id: number;
  user_id: number;
  content: string;
  media_path: string | null;
  created_at: string;
  tags: string[];
}

export interface TagCloudItem {
  name: string;
  count: number;
}

export interface SearchMode {
  id: 'fts' | 'tag' | 'serendipity';
  name: string;
  icon: string;
  desc: string;
}

export interface Colors {
  gradient: string;
  card: string;
  accent: string;
  accent2: string;
  text: string;
  border: string;
  highlight: string;
  tag: string;
  button: string;
  buttonText: string;
  buttonInactive: string;
  tagText: string;
  shadow: string;
} 