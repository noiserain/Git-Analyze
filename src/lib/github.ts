import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_API_URL = '/api/github';

export async function fetchCurrentUser(token: string): Promise<GitHubUser> {
  const headers = { 'Authorization': `Bearer ${token}` };
  const response = await fetch(`https://api.github.com/user`, { headers });
  if (!response.ok) {
    throw new Error('인증 오류');
  }
  return response.json();
}

export async function fetchBookmarks(token: string, username: string) {
  const res = await fetch(`/api/bookmarks/${username}`, { headers: { 'Authorization': `Bearer ${token}` }});
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }
  return res.json();
}

export async function updateBookmarks(token: string, username: string, bookmarks: any[]) {
  const res = await fetch(`/api/bookmarks/${username}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookmarks })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }
  return res.json();
}

export async function fetchGitHubUser(username: string, token?: string | null): Promise<GitHubUser> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${GITHUB_API_URL}/users/${username}`, { headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '데이터를 불러오는데 실패했습니다.');
  }
  return response.json();
}

export async function fetchGitHubRepos(username: string, token?: string | null): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`, { headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '저장소 데이터를 불러오는데 실패했습니다.');
    }
    const repos = await response.json();
    allRepos.push(...repos);
    
    if (repos.length < perPage) {
      hasMore = false;
    } else {
      page++;
    }
    
    // Safety break to prevent too many requests for users with massive repo counts during demo
    if (page > 3) {
      break; 
    }
  }

  return allRepos;
}
