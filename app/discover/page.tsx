'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  user_id: number;
  content: string;
  media_path: string | null;
  created_at: string;
  tags: string[];
}

interface SearchResult {
  mode: string;
  posts: Post[];
}

export default function Discover() {
  const [query, setQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Color palette
  const colors = {
    gradient: 'linear-gradient(135deg, #FDE6E3 0%, #FFF6E0 50%, #E3F6F5 100%)',
    card: '#FFF6E0',
    accent: '#FFB385',
    accent2: '#7EC4A7',
    text: '#3A2C29',
    border: '#E8DED2',
    highlight: '#FFF3B0',
    tag: '#FFD6E0',
    button: 'linear-gradient(90deg, #FFB385 0%, #FF8C42 100%)',
    buttonText: '#3A2C29',
    buttonInactive: '#E8DED2',
    tagText: '#3A2C29',
    shadow: '0 2px 16px #ffb38533',
  };

  const searchModes = [
    { id: 'all', name: 'All Modes', description: 'See results from every search engine' },
    { id: 'fts', name: 'Fuzzy Search', description: 'Find posts by content and partial matches' },
    { id: 'tag', name: 'Tag Explorer', description: 'Discover by mood, medium, or theme' },
    { id: 'morelike', name: 'More Like This', description: 'Find similar creative fragments' },
    { id: 'serendipity', name: 'Serendipity', description: 'Surprise me with unexpected finds' },
  ];

  const handleSearch = async (searchQuery: string, mode: string = 'all') => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery, 
          mode: mode === 'all' ? undefined : mode,
          postId: selectedPost?.id 
        }),
      });
      const data = await response.json();
      setResults(data);
      
      // Add to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSerendipity = () => {
    const serendipityQueries = [
      'gentle', 'playful', 'blue', 'audio', 'sketch', 'poem', 'dream', 'quiet', 'chaos', 'love'
    ];
    const randomQuery = serendipityQueries[Math.floor(Math.random() * serendipityQueries.length)];
    setQuery(randomQuery);
    handleSearch(randomQuery, 'serendipity');
  };

  const handleMoreLikeThis = (post: Post) => {
    setSelectedPost(post);
    handleSearch('', 'morelike');
  };

  const getModeDisplayName = (mode: string) => {
    const modeInfo = searchModes.find(m => m.id === mode);
    return modeInfo?.name || mode;
  };

  const getModeDescription = (mode: string) => {
    const modeInfo = searchModes.find(m => m.id === mode);
    return modeInfo?.description || '';
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.gradient }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none', color: colors.text }}>
            <h1 style={{ fontSize: 48, fontWeight: 600, marginBottom: 8, color: colors.text }}>
              Tether Discovery
            </h1>
          </Link>
          <p style={{ fontSize: 18, color: colors.accent2, marginBottom: 20 }}>
            Explore creative fragments through multiple search engines
          </p>
        </div>

        {/* Search Interface */}
        <div style={{ 
          background: colors.card, 
          borderRadius: 20, 
          padding: 30, 
          marginBottom: 30,
          boxShadow: colors.shadow,
          border: `1px solid ${colors.border}`
        }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by mood, content, tags... (e.g., 'gentle blue sketches', 'playful audio')"
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 12,
                border: `2px solid ${colors.border}`,
                fontSize: 16,
                background: '#FFF',
                color: colors.text,
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query, selectedMode)}
            />
            <button
              onClick={() => handleSearch(query, selectedMode)}
              disabled={isSearching}
              style={{
                padding: '16px 24px',
                borderRadius: 12,
                background: colors.button,
                color: colors.buttonText,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: isSearching ? 'not-allowed' : 'pointer',
                opacity: isSearching ? 0.7 : 1,
              }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Mode Selection */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12, color: colors.text }}>Search Mode:</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {searchModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: selectedMode === mode.id ? colors.button : colors.buttonInactive,
                    color: selectedMode === mode.id ? colors.buttonText : colors.text,
                    border: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleSerendipity}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                background: colors.accent2,
                color: '#FFF',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🎲 Surprise Me
            </button>
            {recentSearches.map(search => (
              <button
                key={search}
                onClick={() => {
                  setQuery(search);
                  handleSearch(search, selectedMode);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: colors.highlight,
                  color: colors.text,
                  border: 'none',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            {results.map((result, index) => (
              <div key={index} style={{ 
                background: colors.card, 
                borderRadius: 16, 
                padding: 24, 
                marginBottom: 24,
                boxShadow: colors.shadow,
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ 
                    fontSize: 24, 
                    fontWeight: 600, 
                    color: colors.text, 
                    margin: 0,
                    marginRight: 12
                  }}>
                    {getModeDisplayName(result.mode)}
                  </h2>
                  <span style={{ 
                    fontSize: 14, 
                    color: colors.accent2, 
                    background: colors.highlight,
                    padding: '4px 8px',
                    borderRadius: 4
                  }}>
                    {result.posts.length} results
                  </span>
                </div>
                <p style={{ 
                  fontSize: 14, 
                  color: colors.accent2, 
                  marginBottom: 20,
                  fontStyle: 'italic'
                }}>
                  {getModeDescription(result.mode)}
                </p>
                
                {result.posts.length === 0 ? (
                  <div style={{ textAlign: 'center', color: colors.accent2, padding: 20 }}>
                    No results found for this search mode.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {result.posts.map(post => (
                      <div key={post.id} style={{ 
                        background: '#FFF', 
                        borderRadius: 12, 
                        padding: 16,
                        border: `1px solid ${colors.border}`,
                        position: 'relative'
                      }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12,
                          display: 'flex',
                          gap: 8
                        }}>
                          <button
                            onClick={() => handleMoreLikeThis(post)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              background: colors.accent,
                              color: '#FFF',
                              border: 'none',
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            More Like This
                          </button>
                        </div>
                        
                        <div style={{ color: colors.accent2, fontSize: 12, marginBottom: 4 }}>
                          {new Date(post.created_at).toLocaleString()}
                        </div>
                        <div style={{ 
                          marginBottom: 12, 
                          color: colors.text, 
                          fontSize: 16,
                          lineHeight: 1.5
                        }}>
                          {post.content}
                        </div>
                        
                        {post.media_path && (
                          post.media_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={post.media_path} 
                              alt="media" 
                              style={{ 
                                maxWidth: '100%', 
                                borderRadius: 8, 
                                marginBottom: 12,
                                boxShadow: colors.shadow
                              }} 
                            />
                          ) : post.media_path.match(/\.(mp3|wav|ogg)$/i) ? (
                            <audio 
                              controls 
                              src={post.media_path} 
                              style={{ width: '100%', marginBottom: 12 }} 
                            />
                          ) : post.media_path.match(/\.(mp4|webm|mov)$/i) ? (
                            <video 
                              controls 
                              src={post.media_path} 
                              style={{ 
                                width: '100%', 
                                borderRadius: 8, 
                                marginBottom: 12,
                                boxShadow: colors.shadow
                              }} 
                            />
                          ) : null
                        )}
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {post.tags.map(tag => (
                            <span key={tag} style={{ 
                              background: colors.tag, 
                              borderRadius: 4, 
                              padding: '2px 8px', 
                              color: colors.tagText, 
                              fontSize: 12,
                              fontWeight: 500
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !isSearching && (
          <div style={{ 
            textAlign: 'center', 
            padding: 60, 
            color: colors.accent2,
            background: colors.card,
            borderRadius: 16,
            boxShadow: colors.shadow
          }}>
            <h3 style={{ fontSize: 24, marginBottom: 12, color: colors.text }}>
              Ready to Discover?
            </h3>
            <p style={{ fontSize: 16, marginBottom: 20 }}>
              Try searching for a mood, medium, or theme to explore creative fragments.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['gentle', 'playful', 'blue', 'audio', 'sketch', 'poem'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion, selectedMode);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: colors.highlight,
                    color: colors.text,
                    border: 'none',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 