'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// Types
interface Post {
  id: number;
  user_id: number;
  content: string;
  media_path: string | null;
  created_at: string;
  tags: string[];
}

const fetchPresence = async () => {
  const res = await fetch('/api/presence');
  const data = await res.json();
  return data.users as string[];
};

const fetchTags = async () => {
  const res = await fetch('/api/tags');
  return res.json();
};

const fetchPosts = async (tagFilter: string | null) => {
  const res = await fetch('/api/posts');
  const posts = await res.json();
  if (!tagFilter) return posts;
  return posts.filter((p: Post) => p.tags.includes(tagFilter));
};

export default function Home() {
  // All hooks must be called in the same order every render
  const [mounted, setMounted] = useState(false);
  const [presence, setPresence] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [postTags, setPostTags] = useState<string>('');
  const [user, setUser] = useState('guest');
  const fileInput = useRef<HTMLInputElement>(null);
  const [tagCloud, setTagCloud] = useState<{ name: string; count: number }[]>([]);
  const [serendipityPosts, setSerendipityPosts] = useState<Post[]>([]);
  const [isSurprising, setIsSurprising] = useState(false);
  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [mainSearchMode, setMainSearchMode] = useState<'fts' | 'tag' | 'serendipity'>('fts');
  const [mainSearchResults, setMainSearchResults] = useState<Post[]>([]);
  const [mainIsSearching, setMainIsSearching] = useState(false);
  const [mainRecentSearches, setMainRecentSearches] = useState<string[]>([]);
  const [freshTags, setFreshTags] = useState<string[]>([]);
  const [relatedTags, setRelatedTags] = useState<string[]>([]);

  // All useEffects must be called in the same order every render
  useEffect(() => { setMounted(true); }, []);
  
  // Poll presence
  useEffect(() => {
    if (!mounted) return;
    const name = window.localStorage.getItem('tether_user') || `guest${Math.floor(Math.random()*10000)}`;
    setUser(name);
    window.localStorage.setItem('tether_user', name);
    const updatePresence = () => {
      fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: name }),
      });
    };
    updatePresence();
    const interval = setInterval(() => {
      updatePresence();
      fetchPresence().then(setPresence);
    }, 5000);
    fetchPresence().then(setPresence);
    return () => clearInterval(interval);
  }, [mounted]);

  // Load tags and posts
  useEffect(() => {
    if (!mounted) return;
    fetchTags().then(setTags);
    fetchPosts(tagFilter).then(setPosts);
  }, [mounted, tagFilter]);

  // Fetch tag cloud
  useEffect(() => {
    if (!mounted) return;
    fetch('/api/tag-cloud')
      .then(res => res.json())
      .then(setTagCloud);
  }, [mounted, posts]);

  useEffect(() => {
    if (!mounted) return;
    fetch('/api/fresh-tags')
      .then(res => res.json())
      .then(setFreshTags);
  }, [mounted, posts]);

  useEffect(() => {
    if (!mounted) return;
    if (tagFilter) {
      fetch(`/api/related-tags?tag=${encodeURIComponent(tagFilter)}`)
        .then(res => res.json())
        .then(setRelatedTags);
    } else {
      setRelatedTags([]);
    }
  }, [mounted, tagFilter]);

  // Early return after all hooks are called
  if (!mounted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2' }}>
      <div style={{ fontSize: 24, color: '#7EC4A7', fontWeight: 600 }}>Loading…</div>
    </div>
  );

  const mainSearchModes = [
    { id: 'fts', name: 'Fuzzy', icon: '🔍', desc: 'Fuzzy content search' },
    { id: 'tag', name: 'Tag', icon: '🏷️', desc: 'Tag search' },
    { id: 'serendipity', name: 'Surprise', icon: '🎲', desc: 'Serendipity' },
  ];

  const handleMainSearch = async (query: string, mode: 'fts' | 'tag' | 'serendipity') => {
    if (!query.trim() && mode !== 'serendipity') return;
    setMainIsSearching(true);
    setMainSearchResults([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode })
      });
      const data = await res.json();
      const posts = data.find((r: any) => r.mode === mode)?.posts || [];
      setMainSearchResults(posts);
      if (query && !mainRecentSearches.includes(query)) {
        setMainRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    } finally {
      setMainIsSearching(false);
    }
  };

  const handleMainSurprise = () => {
    const serendipityQueries = [
      'gentle', 'playful', 'blue', 'audio', 'sketch', 'poem', 'dream', 'quiet', 'chaos', 'love'
    ];
    const randomQuery = serendipityQueries[Math.floor(Math.random() * serendipityQueries.length)];
    setMainSearchQuery(randomQuery);
    setMainSearchMode('serendipity');
    handleMainSearch(randomQuery, 'serendipity');
  };

  const handleSurpriseMe = async () => {
    setIsSurprising(true);
    setSerendipityPosts([]);
    const serendipityQueries = [
      'gentle', 'playful', 'blue', 'audio', 'sketch', 'poem', 'dream', 'quiet', 'chaos', 'love'
    ];
    const randomQuery = serendipityQueries[Math.floor(Math.random() * serendipityQueries.length)];
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: randomQuery, mode: 'serendipity' })
    });
    const data = await res.json();
    const posts = data.find((r: any) => r.mode === 'serendipity')?.posts || [];
    setSerendipityPosts(posts);
    setIsSurprising(false);
  };

  const curatedPrompts = ['playful', 'quiet', 'sketch', 'audio', 'tender', 'chaotic', 'unfinished', 'blue', 'poem', 'field recording'];

  // Helper to add a tag to the tag input
  const addTagToInput = (tag: string) => {
    const tagsArr = postTags.split(',').map(t => t.trim()).filter(Boolean);
    if (!tagsArr.includes(tag)) {
      setPostTags(tagsArr.length ? tagsArr.concat([tag]).join(', ') : tag);
    }
  };

  // Post submit
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    let media_path = null;
    if (media) {
      const formData = new FormData();
      formData.append('file', media);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      media_path = data.path;
    }
    const tagArr = postTags.split(',').map(t => t.trim()).filter(Boolean);
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, content, media_path, tags: tagArr }),
    });
    setContent('');
    setMedia(null);
    setPostTags('');
    if (fileInput.current) fileInput.current.value = '';
    fetchPosts(tagFilter).then(setPosts);
    fetchTags().then(setTags);
  };

  // Color palette & gradient
  const colors = {
    gradient: 'linear-gradient(135deg, #FDE6E3 0%, #FFF6E0 50%, #E3F6F5 100%)', // soft, creative
    card: '#FFF6E0', // light warm
    accent: '#FFB385', // warm coral/peach
    accent2: '#7EC4A7', // muted teal
    text: '#3A2C29', // deep brown/charcoal
    border: '#E8DED2', // light taupe
    highlight: '#FFF3B0', // soft yellow
    tag: '#FFD6E0', // blush
    button: 'linear-gradient(90deg, #FFB385 0%, #FF8C42 100%)', // warm gradient
    buttonText: '#3A2C29',
    buttonInactive: '#E8DED2',
    tagText: '#3A2C29',
    shadow: '0 2px 16px #ffb38533',
  };

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', background: colors.gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <main style={{ width: '100%', maxWidth: 700, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 0 40px 0' }}>
        <h1 style={{ textAlign: 'center', fontWeight: 500, letterSpacing: 1, color: colors.text, fontSize: 44, marginBottom: 8, textShadow: colors.shadow }}>Tether</h1>
        <div style={{ textAlign: 'center', marginBottom: 24, color: colors.accent2, fontWeight: 500, fontSize: 18 }}>
          <span>Here now: {presence.join(', ') || 'just you'}</span>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/discover" style={{ 
            display: 'inline-block',
            padding: '8px 16px',
            background: colors.accent2,
            color: '#FFF',
            textDecoration: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            marginLeft: 12
          }}>
            🔍 Discover
          </Link>
          <button onClick={handleSurpriseMe} style={{
            padding: '8px 16px',
            background: colors.accent,
            color: '#FFF',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: isSurprising ? 'not-allowed' : 'pointer',
            marginLeft: 12,
            opacity: isSurprising ? 0.7 : 1
          }} disabled={isSurprising}>
            🎲 Surprise Me
          </button>
        </div>
        {/* Main Search Bar */}
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
              onKeyPress={e => e.key === 'Enter' && handleMainSearch(mainSearchQuery, mainSearchMode)}
            />
            <button
              onClick={() => handleMainSearch(mainSearchQuery, mainSearchMode)}
              disabled={mainIsSearching}
              style={{ padding: '10px 16px', borderRadius: 8, background: colors.button, color: colors.buttonText, border: 'none', fontWeight: 600, fontSize: 16, cursor: mainIsSearching ? 'not-allowed' : 'pointer', opacity: mainIsSearching ? 0.7 : 1 }}
            >
              {mainIsSearching ? '...' : mainSearchModes.find(m => m.id === mainSearchMode)?.icon || '🔍'}
            </button>
            <button
              onClick={handleMainSurprise}
              style={{ padding: '10px 16px', borderRadius: 8, background: colors.accent, color: '#FFF', border: 'none', fontWeight: 600, fontSize: 16, marginLeft: 4, cursor: 'pointer' }}
            >
              🎲
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {mainSearchModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setMainSearchMode(mode.id as any)}
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
                  handleMainSearch(search, mainSearchMode);
                }}
                style={{ padding: '2px 10px', borderRadius: 6, background: colors.highlight, color: colors.text, border: 'none', fontSize: 13, cursor: 'pointer' }}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
        {/* Main Search Results */}
        {mainSearchResults.length > 0 && (
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', marginBottom: 32, background: colors.highlight, borderRadius: 16, boxShadow: colors.shadow, padding: 18, border: `1.5px solid ${colors.accent2}` }}>
            <div style={{ textAlign: 'center', color: colors.accent2, fontWeight: 600, fontSize: 18, marginBottom: 10 }}>
              {mainSearchModes.find(m => m.id === mainSearchMode)?.icon} {mainSearchModes.find(m => m.id === mainSearchMode)?.name} Results
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {mainSearchResults.map(post => (
                <div key={post.id} style={{ background: colors.card, borderRadius: 10, padding: 12, border: `1px solid ${colors.border}` }}>
                  <div style={{ marginBottom: 8, color: colors.text, fontSize: 15 }}>{post.content}</div>
                  {post.media_path && (
                    post.media_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img src={post.media_path} alt="media" style={{ maxWidth: '100%', borderRadius: 6, marginBottom: 8, boxShadow: colors.shadow }} />
                    ) : post.media_path.match(/\.(mp3|wav|ogg)$/i) ? (
                      <audio controls src={post.media_path} style={{ width: '100%', marginBottom: 8 }} />
                    ) : post.media_path.match(/\.(mp4|webm|mov)$/i) ? (
                      <video controls src={post.media_path} style={{ width: '100%', borderRadius: 6, marginBottom: 8, boxShadow: colors.shadow }} />
                    ) : null
                  )}
                  <div style={{ color: colors.tagText, fontSize: 13 }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ marginRight: 6, background: colors.tag, borderRadius: 4, padding: '2px 8px', color: colors.tagText, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {serendipityPosts.length > 0 && (
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', marginBottom: 32, background: colors.highlight, borderRadius: 16, boxShadow: colors.shadow, padding: 18, border: `1.5px solid ${colors.accent2}` }}>
            <div style={{ textAlign: 'center', color: colors.accent2, fontWeight: 600, fontSize: 18, marginBottom: 10 }}>
              ✨ Serendipity
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {serendipityPosts.map(post => (
                <div key={post.id} style={{ background: colors.card, borderRadius: 10, padding: 12, border: `1px solid ${colors.border}` }}>
                  <div style={{ marginBottom: 8, color: colors.text, fontSize: 15 }}>{post.content}</div>
                  {post.media_path && (
                    post.media_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img src={post.media_path} alt="media" style={{ maxWidth: '100%', borderRadius: 6, marginBottom: 8, boxShadow: colors.shadow }} />
                    ) : post.media_path.match(/\.(mp3|wav|ogg)$/i) ? (
                      <audio controls src={post.media_path} style={{ width: '100%', marginBottom: 8 }} />
                    ) : post.media_path.match(/\.(mp4|webm|mov)$/i) ? (
                      <video controls src={post.media_path} style={{ width: '100%', borderRadius: 6, marginBottom: 8, boxShadow: colors.shadow }} />
                    ) : null
                  )}
                  <div style={{ color: colors.tagText, fontSize: 13 }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ marginRight: 6, background: colors.tag, borderRadius: 4, padding: '2px 8px', color: colors.tagText, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handlePost} style={{ background: colors.card, padding: 24, borderRadius: 18, marginBottom: 32, border: `1px solid ${colors.border}`, boxShadow: colors.shadow, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        <div style={{ width: '100%', maxWidth: 520 }}>
          {posts.length === 0 && <div style={{ color: colors.accent2, textAlign: 'center', fontWeight: 500, fontSize: 18, marginTop: 32 }}>No posts yet. Be the first to share!</div>}
          {posts.map(post => (
            <div key={post.id} style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 16, marginBottom: 24, padding: 22, boxShadow: colors.shadow }}>
              <div style={{ marginBottom: 14, color: colors.text, fontSize: 18, fontFamily: 'inherit' }}>{post.content}</div>
              {post.media_path && (
                post.media_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={post.media_path} alt="media" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12, boxShadow: colors.shadow }} />
                ) : post.media_path.match(/\.(mp3|wav|ogg)$/i) ? (
                  <audio controls src={post.media_path} style={{ width: '100%', marginBottom: 12 }} />
                ) : post.media_path.match(/\.(mp4|webm|mov)$/i) ? (
                  <video controls src={post.media_path} style={{ width: '100%', borderRadius: 8, marginBottom: 12, boxShadow: colors.shadow }} />
                ) : null
              )}
              <div style={{ color: colors.tagText, fontSize: 15, marginTop: 6 }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ marginRight: 10, background: colors.tag, borderRadius: 4, padding: '3px 12px', color: colors.tagText, fontWeight: 600, fontSize: 15 }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
