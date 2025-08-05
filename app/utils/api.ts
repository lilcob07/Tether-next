import { Post } from '../types';

export const fetchPresence = async () => {
  const res = await fetch('/api/presence');
  const data = await res.json();
  return data.users as string[];
};

export const fetchTags = async () => {
  const res = await fetch('/api/tags');
  return res.json();
};

export const fetchPosts = async (tagFilter: string | null) => {
  const res = await fetch('/api/posts');
  const posts = await res.json();
  if (!tagFilter) return posts;
  return posts.filter((p: Post) => p.tags.includes(tagFilter));
};

export const updatePresence = async (user: string) => {
  await fetch('/api/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user }),
  });
}; 