'use client';

import { useRef } from 'react';
import { colors } from '../utils/colors';
import TagSystem from './TagSystem';

interface PostFormProps {
  content: string;
  setContent: (content: string) => void;
  media: File | null;
  setMedia: (media: File | null) => void;
  postTags: string;
  setPostTags: (tags: string) => void;
  tagCloud: { name: string; count: number }[];
  freshTags: string[];
  onPost: (e: React.FormEvent) => void;
  addTagToInput: (tag: string) => void;
}

export default function PostForm({
  content,
  setContent,
  media,
  setMedia,
  postTags,
  setPostTags,
  tagCloud,
  freshTags,
  onPost,
  addTagToInput
}: PostFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onPost} style={{ background: colors.card, padding: 24, borderRadius: 18, marginBottom: 32, border: `1px solid ${colors.border}`, boxShadow: colors.shadow, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share a fragment..."
        rows={3}
        style={{ width: '100%', marginBottom: 12, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 14, background: '#FFF', color: colors.text, fontSize: 18, resize: 'vertical', fontFamily: 'inherit' }}
      />
      <input
        type="file"
        accept="image/*,audio/*,video/*"
        ref={fileInput}
        onChange={e => setMedia(e.target.files?.[0] || null)}
        style={{ marginBottom: 12 }}
      />
      
      {/* Enhanced Tag System */}
      <TagSystem
        postTags={postTags}
        setPostTags={setPostTags}
        tagCloud={tagCloud}
        freshTags={freshTags}
        addTagToInput={addTagToInput}
      />
      
      <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: colors.button, color: colors.buttonText, border: 'none', fontWeight: 700, fontSize: 18, letterSpacing: 1, marginTop: 6, boxShadow: colors.shadow, fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.2s' }}>
        Share
      </button>
    </form>
  );
} 