import { supabase, serverUrl } from './supabase/client';
import { publicAnonKey } from './supabase/info';

/*
 * 회원 로그인 (Supabase Auth)
 * - 가입·로그인은 서버(/auth/signup, /auth/login)를 거치고, 세션은 supabase-js 가 보관·자동 갱신한다.
 * - 기존 화면과의 호환을 위해 로그인한 회원 정보를 localStorage 'currentUser' 에도 저장한다.
 *   (이 값은 표시용일 뿐, 서버는 항상 로그인 토큰으로 회원을 확인한다)
 */
export interface CurrentUser {
  id: string;
  username: string;
  name: string;
  region?: string;
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${serverUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `서버 오류 (${res.status})`);
  return data;
}

function saveCurrentUser(user: { id: string; user_metadata?: Record<string, any> }): CurrentUser {
  const meta = user.user_metadata || {};
  const current: CurrentUser = { id: user.id, username: meta.username || '회원', name: meta.username || '회원', region: meta.region || undefined };
  localStorage.setItem('currentUser', JSON.stringify(current));
  return current;
}

export async function signIn(username: string, password: string): Promise<CurrentUser> {
  const { session } = await post('/auth/login', { username: username.trim(), password });
  const { data, error } = await supabase.auth.setSession(session);
  if (error || !data.user) throw new Error(error?.message || '로그인에 실패했습니다.');
  return saveCurrentUser(data.user);
}

export async function signUp(username: string, password: string, region: string): Promise<CurrentUser> {
  await post('/auth/signup', { username: username.trim(), password, region });
  return signIn(username, password);
}

export async function signOut() {
  await supabase.auth.signOut().catch(() => {});
  localStorage.removeItem('currentUser');
}

/** 앱 시작 시: 로그인 세션이 있으면 회원 정보를 맞추고, 없으면 (예전 방식의) 로그인 표시를 지운다 */
export async function syncCurrentUser(): Promise<CurrentUser | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) return saveCurrentUser(data.session.user);
  localStorage.removeItem('currentUser');
  return null;
}

/** 서버 요청용 토큰 (로그인 전이면 공개 키) */
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || publicAnonKey;
}
