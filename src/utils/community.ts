import { useEffect, useState } from 'react';
import { serverUrl } from './supabase/client';
import { publicAnonKey } from './supabase/info';
import { CHINA_LIFE_POSTS, Post, BoardCategory } from '../data/chinaLifePosts';

/*
 * 커뮤니티 글 저장소
 * - 회원 글: 서버(Supabase KV)에 저장
 * - 예시 글: src/data/chinaLifePosts.ts
 * 게시판·인기글·회원 이야기가 모두 이 목록을 함께 사용한다.
 */
let userPosts: Post[] = [];
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(fn => fn());

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${serverUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, ...init.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `서버 오류 (${res.status})`);
  return data;
}

function loadUserPosts() {
  if (!loading) {
    loading = request('/community/posts')
      .then(data => { userPosts = data.posts || []; notify(); })
      .catch(err => console.warn('커뮤니티 글 불러오기 실패 (예시 글만 표시):', err.message));
  }
  return loading;
}

/** 회원 글 + 예시 글 (회원 글이 먼저) */
export function useCommunityPosts(): Post[] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    loadUserPosts();
    return () => { listeners.delete(fn); };
  }, []);
  return [...userPosts, ...CHINA_LIFE_POSTS];
}

type CurrentUser = { id?: string; name?: string; username?: string } | null | undefined;

/** 로그인 정보에서 작성자 이름·구분값 */
export function getAuthor(user: CurrentUser) {
  const author = user?.name || user?.username || '';
  const authorKey = String(user?.id || user?.username || '');
  return author && authorKey ? { author, authorKey } : null;
}

export async function createPost(input: {
  title: string; content: string; category: BoardCategory; city?: string; author: string; authorKey: string;
}): Promise<Post> {
  const { post } = await request('/community/posts', { method: 'POST', body: JSON.stringify(input) });
  userPosts = [post, ...userPosts];
  notify();
  return post;
}

export async function deletePost(id: number, authorKey: string) {
  await request(`/community/posts/${id}`, { method: 'DELETE', body: JSON.stringify({ authorKey }) });
  userPosts = userPosts.filter(p => p.id !== id);
  notify();
}
