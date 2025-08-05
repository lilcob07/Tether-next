'use client';

import { colors } from '../utils/colors';

interface TagFilterProps {
  tagFilter: string | null;
  setTagFilter: (tag: string | null) => void;
  tagCloud: { name: string; count: number }[];
  relatedTags: string[];
  addTagToInput: (tag: string) => void;
}

export default function TagFilter({
  tagFilter,
  setTagFilter,
  tagCloud,
  relatedTags,
  addTagToInput
}: TagFilterProps) {
  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', marginBottom: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ color: colors.text, fontWeight: 500, fontSize: 16 }}>Filter by tag: </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center', minHeight: 36 }}>
        <span
          onClick={() => setTagFilter(null)}
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: !tagFilter ? colors.buttonText : colors.accent2,
            background: !tagFilter ? colors.button : 'transparent',
            borderRadius: 6,
            padding: '4px 12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: !tagFilter ? colors.shadow : undefined,
            border: !tagFilter ? `1.5px solid ${colors.accent}` : undefined,
            userSelect: 'none',
          }}
          title="Show all posts"
        >
          All
        </span>
        {tagCloud.map(tag => {
          const minFont = 15, maxFont = 28;
          const minCount = tagCloud.length > 0 ? Math.min(...tagCloud.map(t => t.count)) : 1;
          const maxCount = tagCloud.length > 0 ? Math.max(...tagCloud.map(t => t.count)) : 1;
          const size = minCount === maxCount ? 18 : minFont + ((tag.count - minCount) / (maxCount - minCount)) * (maxFont - minFont);
          return (
            <span
              key={tag.name}
              onClick={e => {
                if (e.shiftKey) {
                  addTagToInput(tag.name);
                } else {
                  setTagFilter(tag.name);
                }
              }}
              style={{
                fontSize: size,
                fontWeight: 600,
                color: tagFilter === tag.name ? colors.buttonText : colors.accent2,
                background: tagFilter === tag.name ? colors.button : 'transparent',
                borderRadius: 6,
                padding: '2px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: tagFilter === tag.name ? colors.shadow : undefined,
                border: tagFilter === tag.name ? `1.5px solid ${colors.accent}` : undefined,
                marginBottom: 2,
                userSelect: 'none',
              }}
              title={`Click to filter, Shift+Click to add "${tag.name}" to your tags`}
            >
              {tag.name}
            </span>
          );
        })}
      </div>
      {tagFilter && relatedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
          <span style={{ color: colors.accent2, fontWeight: 500, fontSize: 15, marginRight: 6 }}>Related:</span>
          {relatedTags.map(tag => (
            <span
              key={tag}
              onClick={() => setTagFilter(tag)}
              style={{
                background: colors.highlight,
                color: colors.accent2,
                borderRadius: 4,
                padding: '2px 10px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1.5px solid ${colors.accent2}`,
                userSelect: 'none',
                transition: 'background 0.2s',
              }}
              title={`Show posts tagged "${tag}"`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 