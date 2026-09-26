import { useEffect, useState } from 'react';
import { serverUrl } from './supabase/client';
import { getAccessToken } from './auth';
import { CHINA_LIFE_POSTS, Post, BoardCategory } from '../data/chinaLifePosts';

/*
 * 커뮤니티 글 저장소
 * - 회원 글·댓글·좋아요·조회수: 서버(Supabase KV)
 * - 예시 글: src/data/chinaLifePosts.ts (조회수·좋아요는 예시 값 + 실제 값)
 * 게시판·인기글·회원 이야기가 모두 이 목록을 함께 사용한다.
 */
type Stats = { views: number; likes: number; comments: number };
export interface PostComment { id: number; author: string; authorKey: string; content: string; date: string }

let userPosts: Post[] = [];
let stats: Record<number, Stats> = {};
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(fn => fn());

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${serverUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getAccessToken()}`, ...init.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `서버 오류 (${res.status})`);
  return data;
}

function setStats(postId: number, s?: Stats) {
  if (!s) return;
  stats = { ...stats, [postId]: s };
  notify();
}

function loadUserPosts() {
  if (!loading) {
    loading = request('/community/posts')
      .then(data => { userPosts = data.posts || []; stats = data.stats || {}; notify(); })
      .catch(err => console.warn('커뮤니티 글 불러오기 실패 (예시 글만 표시):', err.message));
  }
  return loading;
}

/** 회원 글 + 예시 글 (회원 글이 먼저), 조회수·좋아요·댓글 수 반영 */
export function useCommunityPosts(): Post[] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    loadUserPosts();
    return () => { listeners.delete(fn); };
  }, []);
  return [...userPosts, ...CHINA_LIFE_POSTS].map(p => {
    const s = stats[p.id];
    return {
      ...p,
      views: p.views + (s?.views || 0),
      likes: p.likes + (s?.likes || 0),
      comments: s?.comments || 0,
    };
  });
}

export async function createPost(input: { title: string; content: string; category: BoardCategory; city?: string }): Promise<Post> {
  const { post } = await request('/community/posts', { method: 'POST', body: JSON.stringify(input) });
  userPosts = [post, ...userPosts];
  notify();
  return post;
}

export async function deletePost(id: number) {
  await request(`/community/posts/${id}`, { method: 'DELETE' });
  userPosts = userPosts.filter(p => p.id !== id);
  notify();
}

/** 조회수 +1 (같은 브라우저 세션에서는 글마다 한 번만) */
export function recordView(postId: number) {
  const key = `viewed:${postId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch { /* 저장소를 못 쓰면 그냥 센다 */ }
  request(`/community/posts/${postId}/view`, { method: 'POST' })
    .then(data => setStats(postId, data.stats))
    .catch(() => {});
}

export async function fetchPostDetail(postId: number): Promise<{ comments: PostComment[]; liked: boolean }> {
  const data = await request(`/community/posts/${postId}/detail`);
  return { comments: data.comments || [], liked: !!data.liked };
}

export async function toggleLike(postId: number): Promise<boolean> {
  const data = await request(`/community/posts/${postId}/like`, { method: 'POST' });
  setStats(postId, data.stats);
  return data.liked;
}

export async function addComment(postId: number, content: string): Promise<PostComment> {
  const data = await request(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
  setStats(postId, data.stats);
  return data.comment;
}

export async function deleteComment(postId: number, commentId: number) {
  const data = await request(`/community/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  setStats(postId, data.stats);
}
