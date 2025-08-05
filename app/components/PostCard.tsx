'use client';

import { Post } from '../types';
import { colors } from '../utils/colors';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const cardStyle = compact ? {
    background: colors.card,
    borderRadius: 10,
    padding: 12,
    border: `1px solid ${colors.border}`
  } : {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    marginBottom: 24,
    padding: 22,
    boxShadow: colors.shadow
  };

  const contentStyle = compact ? {
    marginBottom: 8,
    color: colors.text,
    fontSize: 15
  } : {
    marginBottom: 14,
    color: colors.text,
    fontSize: 18,
    fontFamily: 'inherit'
  };

  const tagStyle = compact ? {
    marginRight: 6,
    background: colors.tag,
    borderRadius: 4,
    padding: '2px 8px',
    color: colors.tagText,
    fontWeight: 500
  } : {
    marginRight: 10,
    background: colors.tag,
    borderRadius: 4,
    padding: '3px 12px',
    color: colors.tagText,
    fontWeight: 600,
    fontSize: 15
  };

  const mediaStyle = compact ? {
    maxWidth: '100%',
    borderRadius: 6,
    marginBottom: 8,
    boxShadow: colors.shadow
  } : {
    maxWidth: '100%',
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: colors.shadow
  };

  return (
    <div style={cardStyle}>
      <div style={contentStyle}>{post.content}</div>
      {post.media_path && (
        post.media_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img src={post.media_path} alt="media" style={mediaStyle} />
        ) : post.media_path.match(/\.(mp3|wav|ogg)$/i) ? (
          <audio controls src={post.media_path} style={{ width: '100%', marginBottom: compact ? 8 : 12 }} />
        ) : post.media_path.match(/\.(mp4|webm|mov)$/i) ? (
          <video controls src={post.media_path} style={mediaStyle} />
        ) : null
      )}
      <div style={{ color: colors.tagText, fontSize: compact ? 13 : 15, marginTop: compact ? 0 : 6 }}>
        {post.tags.map(tag => (
          <span key={tag} style={tagStyle}>{tag}</span>
        ))}
      </div>
    </div>
  );
} 