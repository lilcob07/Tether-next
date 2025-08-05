'use client';

import { useRef } from 'react';
import { colors } from '../utils/colors';

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
  const curatedPrompts = ['playful', 'quiet', 'sketch', 'audio', 'tender', 'chaotic', 'unfinished', 'blue', 'poem', 'field recording'];

  return (
    <form onSubmit={onPost} style={{ background: colors.card, padding: 24, borderRadius: 18, marginBottom: 32, border: `1px solid ${colors.border}`, boxShadow: colors.shadow, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Tag suggestions */}
      <div style={{ width: '100%', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[...curatedPrompts, ...tagCloud.map(t => t.name).filter(t => !curatedPrompts.includes(t))].slice(0, 8).map(tag => (
          <span
            key={tag}
            onClick={() => addTagToInput(tag)}
            style={{
              background: colors.tag,
              color: colors.tagText,
              borderRadius: 4,
              padding: '3px 10px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              border: `1px solid ${colors.border}`,
              userSelect: 'none',
              transition: 'background 0.2s',
            }}
            title={`Add "${tag}" to your tags`}
          >
            + {tag}
          </span>
        ))}
        {freshTags.map(tag => (
          <span
            key={tag}
            onClick={() => addTagToInput(tag)}
            style={{
              background: '#FFD6E0',
              color: colors.accent,
              borderRadius: 4,
              padding: '3px 10px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              border: `1.5px solid ${colors.accent}`,
              userSelect: 'none',
              transition: 'background 0.2s',
              marginLeft: 2
            }}
            title={`Add new tag "${tag}" to your tags`}
          >
            + {tag} <span style={{ fontSize: 11, fontWeight: 600, color: colors.accent2, marginLeft: 2 }}>new!</span>
          </span>
        ))}
      </div>
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
      <input
        type="text"
        value={postTags}
        onChange={e => setPostTags(e.target.value)}
        placeholder="Tags (comma separated: mood, medium, etc.)"
        style={{ width: '100%', marginBottom: 12, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 14, background: '#FFF', color: colors.text, fontSize: 16, fontFamily: 'inherit' }}
      />
      <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 8, background: colors.button, color: colors.buttonText, border: 'none', fontWeight: 700, fontSize: 18, letterSpacing: 1, marginTop: 6, boxShadow: colors.shadow, fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.2s' }}>
        Share
      </button>
    </form>
  );
} 