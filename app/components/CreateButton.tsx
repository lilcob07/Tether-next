'use client';

import { useState } from 'react';
import { colors } from '../utils/colors';
import PostForm from './PostForm';

interface CreateButtonProps {
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
  activeCategories: string[];
  setActiveCategories: (categories: string[] | ((prev: string[]) => string[])) => void;
}

export default function CreateButton({
  content,
  setContent,
  media,
  setMedia,
  postTags,
  setPostTags,
  tagCloud,
  freshTags,
  onPost,
  addTagToInput,
  activeCategories,
  setActiveCategories
}: CreateButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePost = (e: React.FormEvent) => {
    onPost(e);
    setIsExpanded(false); // Close modal after posting
  };

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', marginBottom: 32 }}>
      {!isExpanded ? (
        // Collapsed state - horizontal button
        <button
          onClick={handleToggle}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: 18,
            background: colors.button,
            color: colors.buttonText,
            border: 'none',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 1,
            boxShadow: colors.shadow,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >
          <span style={{ fontSize: 20 }}>✨</span>
          Share a fragment...
          <span style={{ fontSize: 14, opacity: 0.8 }}>Click to expand</span>
        </button>
      ) : (
        // Expanded state - full create form
        <div style={{
          background: colors.card,
          padding: 24,
          borderRadius: 18,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow,
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={handleToggle}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: colors.accent2,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            title="Close"
          >
            ×
          </button>
          
          {/* Create form */}
          <PostForm
            content={content}
            setContent={setContent}
            media={media}
            setMedia={setMedia}
            postTags={postTags}
            setPostTags={setPostTags}
            tagCloud={tagCloud}
            freshTags={freshTags}
            onPost={handlePost}
            addTagToInput={addTagToInput}
            activeCategories={activeCategories}
            setActiveCategories={setActiveCategories}
          />
        </div>
      )}
    </div>
  );
} 