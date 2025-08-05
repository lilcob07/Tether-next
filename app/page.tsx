'use client';

import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ActionButtons from './components/ActionButtons';
import SearchBar from './components/SearchBar';
import PostCard from './components/PostCard';
import PostForm from './components/PostForm';
import TagFilter from './components/TagFilter';
import { Post } from './types';
import { fetchPresence, fetchTags, fetchPosts, updatePresence } from './utils/api';
import { colors } from './utils/colors';

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
    const updatePresenceInterval = () => {
      updatePresence(name);
    };
    updatePresenceInterval();
    const interval = setInterval(() => {
      updatePresenceInterval();
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
    fetchPosts(tagFilter).then(setPosts);
    fetchTags().then(setTags);
  };

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', background: colors.gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <main style={{ width: '100%', maxWidth: 700, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '40px 0 40px 0' }}>
        <Header presence={presence} />
        <ActionButtons isSurprising={isSurprising} onSurpriseMe={handleSurpriseMe} />
        
        <SearchBar
          mainSearchQuery={mainSearchQuery}
          setMainSearchQuery={setMainSearchQuery}
          mainSearchMode={mainSearchMode}
          setMainSearchMode={setMainSearchMode}
          mainIsSearching={mainIsSearching}
          mainRecentSearches={mainRecentSearches}
          onSearch={handleMainSearch}
          onSurprise={handleMainSurprise}
        />

        {/* Main Search Results */}
        {mainSearchResults.length > 0 && (
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', marginBottom: 32, background: colors.highlight, borderRadius: 16, boxShadow: colors.shadow, padding: 18, border: `1.5px solid ${colors.accent2}` }}>
            <div style={{ textAlign: 'center', color: colors.accent2, fontWeight: 600, fontSize: 18, marginBottom: 10 }}>
              🔍 Search Results
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {mainSearchResults.map(post => (
                <PostCard key={post.id} post={post} compact={true} />
              ))}
            </div>
          </div>
        )}

        {/* Serendipity Results */}
        {serendipityPosts.length > 0 && (
          <div style={{ width: '100%', maxWidth: 520, margin: '0 auto', marginBottom: 32, background: colors.highlight, borderRadius: 16, boxShadow: colors.shadow, padding: 18, border: `1.5px solid ${colors.accent2}` }}>
            <div style={{ textAlign: 'center', color: colors.accent2, fontWeight: 600, fontSize: 18, marginBottom: 10 }}>
              ✨ Serendipity
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {serendipityPosts.map(post => (
                <PostCard key={post.id} post={post} compact={true} />
              ))}
            </div>
          </div>
        )}

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
        />

        <TagFilter
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          tagCloud={tagCloud}
          relatedTags={relatedTags}
          addTagToInput={addTagToInput}
        />

        <div style={{ width: '100%', maxWidth: 520 }}>
          {posts.length === 0 && <div style={{ color: colors.accent2, textAlign: 'center', fontWeight: 500, fontSize: 18, marginTop: 32 }}>No posts yet. Be the first to share!</div>}
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}
