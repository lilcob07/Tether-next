'use client';

import { useState } from 'react';
import { colors } from '../utils/colors';

interface TagSystemProps {
  postTags: string;
  setPostTags: (tags: string) => void;
  tagCloud: { name: string; count: number }[];
  freshTags: string[];
  addTagToInput: (tag: string) => void;
}

interface TagCategory {
  name: string;
  icon: string;
  tags: string[];
  color: string;
}

export default function TagSystem({
  postTags,
  setPostTags,
  tagCloud,
  freshTags,
  addTagToInput
}: TagSystemProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const tagCategories: TagCategory[] = [
    {
      name: 'Medium',
      icon: '🎨',
      color: '#FFB385',
      tags: ['drawing', 'painting', 'sketch', 'digital', 'photography', 'collage', 'sculpture', 'print', 'textile', 'ceramics']
    },
    {
      name: 'Writing',
      icon: '✍️',
      color: '#7EC4A7',
      tags: ['poem', 'story', 'essay', 'journal', 'haiku', 'prose', 'lyrics', 'script', 'freewrite', 'letter']
    },
    {
      name: 'Audio',
      icon: '🎵',
      color: '#FF8C9B',
      tags: ['music', 'field recording', 'podcast', 'ambient', 'voice', 'instrumental', 'soundscape', 'acoustic', 'electronic', 'lo-fi']
    },
    {
      name: 'Mood',
      icon: '💫',
      color: '#B8A9D9',
      tags: ['playful', 'quiet', 'tender', 'chaotic', 'melancholy', 'joyful', 'contemplative', 'energetic', 'peaceful', 'intense']
    },
    {
      name: 'State',
      icon: '🌱',
      color: '#A8D5BA',
      tags: ['unfinished', 'experiment', 'draft', 'complete', 'work-in-progress', 'exploration', 'reflection', 'discovery', 'practice', 'study']
    },
    {
      name: 'Color',
      icon: '🌈',
      color: '#FFD6A5',
      tags: ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gold']
    }
  ];

  const handleTagClick = (tag: string) => {
    addTagToInput(tag);
  };

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(cat => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const getActiveTags = () => {
    if (activeCategories.length === 0) return [];
    
    const allTags: { tag: string; category: string; color: string }[] = [];
    activeCategories.forEach(categoryName => {
      const category = tagCategories.find(c => c.name === categoryName);
      if (category) {
        category.tags.forEach(tag => {
          allTags.push({
            tag,
            category: categoryName,
            color: category.color
          });
        });
      }
    });
    return allTags;
  };

  const activeTags = getActiveTags();

  return (
    <div style={{ width: '100%', marginBottom: 16 }}>
      {/* Category Navigation */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 12,
        padding: '8px 0'
      }}>
        {tagCategories.map(category => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            style={{
              background: activeCategories.includes(category.name) ? category.color : colors.card,
              color: activeCategories.includes(category.name) ? '#FFF' : colors.text,
              border: `2px solid ${activeCategories.includes(category.name) ? category.color : colors.border}`,
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'inherit'
            }}
          >
            <span>{category.icon}</span>
            {category.name}
            {activeCategories.includes(category.name) && (
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '50%', 
                width: 16, 
                height: 16, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 'bold'
              }}>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tag Suggestions */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 6,
        minHeight: activeCategories.length > 0 ? 'auto' : '40px',
        transition: 'all 0.3s ease'
      }}>
        {/* Active Categories Tags */}
        {activeCategories.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 6,
            width: '100%',
            padding: '8px 0',
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
            marginBottom: 8
          }}>
            {activeTags.map(({ tag, category, color }) => (
              <span
                key={`${category}-${tag}`}
                onClick={() => handleTagClick(tag)}
                style={{
                  background: colors.tag,
                  color: colors.tagText,
                  borderRadius: 16,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: `1px solid ${color}`,
                  userSelect: 'none',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                title={`Add "${tag}" from ${category}`}
              >
                + {tag}
                <span style={{ 
                  fontSize: 10, 
                  color: color, 
                  marginLeft: 4,
                  fontWeight: 600 
                }}>
                  {category}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Fresh Tags (New) */}
        {freshTags.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 6,
            width: '100%',
            marginTop: activeCategories.length > 0 ? 8 : 0
          }}>
            {freshTags.map(tag => (
              <span
                key={tag}
                onClick={() => handleTagClick(tag)}
                style={{
                  background: '#FFD6E0',
                  color: colors.accent,
                  borderRadius: 16,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1.5px solid ${colors.accent}`,
                  userSelect: 'none',
                  transition: 'all 0.2s'
                }}
                title={`Add new tag "${tag}" to your tags`}
              >
                + {tag} <span style={{ fontSize: 10, fontWeight: 600, color: colors.accent2, marginLeft: 2 }}>new!</span>
              </span>
            ))}
          </div>
        )}

        {/* Popular Tags */}
        {activeCategories.length === 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 6,
            width: '100%'
          }}>
            {tagCloud.slice(0, 6).map(tag => (
              <span
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                style={{
                  background: colors.tag,
                  color: colors.tagText,
                  borderRadius: 16,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: `1px solid ${colors.border}`,
                  userSelect: 'none',
                  transition: 'all 0.2s'
                }}
                title={`Add "${tag.name}" to your tags (${tag.count} posts)`}
              >
                + {tag.name} <span style={{ fontSize: 10, color: colors.accent2, marginLeft: 2 }}>({tag.count})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Free-form Tag Input */}
      <div style={{ marginTop: 12 }}>
        <input
          type="text"
          value={postTags}
          onChange={e => setPostTags(e.target.value)}
          placeholder="Or type your own tags (comma separated): mood, medium, color, etc."
          style={{ 
            width: '100%', 
            border: `1px solid ${colors.border}`, 
            borderRadius: 8, 
            padding: 12, 
            background: '#FFF', 
            color: colors.text, 
            fontSize: 14, 
            fontFamily: 'inherit',
            transition: 'border-color 0.2s'
          }}
        />
        <div style={{ 
          fontSize: 12, 
          color: colors.accent2, 
          marginTop: 4, 
          fontStyle: 'italic' 
        }}>
          💡 Mix tags from different categories (Medium + Writing + Mood, etc.)
        </div>
      </div>
    </div>
  );
} 