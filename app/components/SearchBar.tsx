'use client';

import { SearchMode } from '../types';
import { colors } from '../utils/colors';

interface SearchBarProps {
  mainSearchQuery: string;
  setMainSearchQuery: (query: string) => void;
  mainSearchMode: 'fts' | 'tag' | 'serendipity';
  setMainSearchMode: (mode: 'fts' | 'tag' | 'serendipity') => void;
  mainIsSearching: boolean;
  mainRecentSearches: string[];
  onSearch: (query: string, mode: 'fts' | 'tag' | 'serendipity') => void;
  onSurprise: () => void;
}

export default function SearchBar({
  mainSearchQuery,
  setMainSearchQuery,
  mainSearchMode,
  setMainSearchMode,
  mainIsSearching,
  mainRecentSearches,
  onSearch,
  onSurprise
}: SearchBarProps) {
  const mainSearchModes: SearchMode[] = [
    { id: 'fts', name: 'Fuzzy', icon: '🔍', desc: 'Fuzzy content search' },
    { id: 'tag', name: 'Tag', icon: '🏷️', desc: 'Tag search' },
    { id: 'serendipity', name: 'Surprise', icon: '🎲', desc: 'Serendipity' },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: 520,
      margin: '0 auto',
      marginBottom: 32,
      background: colors.card,
      borderRadius: 16,
      boxShadow: colors.shadow,
      padding: 18,
      border: `1.5px solid ${colors.accent2}`
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input
          type="text"
          value={mainSearchQuery}
          onChange={e => setMainSearchQuery(e.target.value)}
          placeholder="Search by mood, tag, or content..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${colors.border}`, fontSize: 16, background: '#FFF', color: colors.text }}
          onKeyPress={e => e.key === 'Enter' && onSearch(mainSearchQuery, mainSearchMode)}
        />
        <button
          onClick={() => onSearch(mainSearchQuery, mainSearchMode)}
          disabled={mainIsSearching}
          style={{ padding: '10px 16px', borderRadius: 8, background: colors.button, color: colors.buttonText, border: 'none', fontWeight: 600, fontSize: 16, cursor: mainIsSearching ? 'not-allowed' : 'pointer', opacity: mainIsSearching ? 0.7 : 1 }}
        >
          {mainIsSearching ? '...' : mainSearchModes.find(m => m.id === mainSearchMode)?.icon || '🔍'}
        </button>
        <button
          onClick={onSurprise}
          style={{ padding: '10px 16px', borderRadius: 8, background: colors.accent, color: '#FFF', border: 'none', fontWeight: 600, fontSize: 16, marginLeft: 4, cursor: 'pointer' }}
        >
          🎲
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {mainSearchModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setMainSearchMode(mode.id)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              background: mainSearchMode === mode.id ? colors.button : colors.buttonInactive,
              color: mainSearchMode === mode.id ? colors.buttonText : colors.text,
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
            title={mode.desc}
          >
            {mode.icon} {mode.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        {mainRecentSearches.map(search => (
          <button
            key={search}
            onClick={() => {
              setMainSearchQuery(search);
              onSearch(search, mainSearchMode);
            }}
            style={{ padding: '2px 10px', borderRadius: 6, background: colors.highlight, color: colors.text, border: 'none', fontSize: 13, cursor: 'pointer' }}
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
} 