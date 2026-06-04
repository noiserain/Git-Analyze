import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

export async function searchGitHubUsers(query: string): Promise<Partial<GitHubUser>[]> {
  if (!query) return [];
  const response = await fetch(`${GITHUB_API_URL}/search/users?q=${encodeURIComponent(query)}&per_page=5`);
  if (!response.ok) {
    throw new Error('유저 검색에 실패했습니다.');
  }
  const data = await response.json();
  return data.items;
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_URL}/users/${username}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("해당 유저를 찾을 수 없습니다!"); // User not found
    }
    throw new Error('데이터를 불러오는데 실패했습니다.'); // Failed to fetch data
  }
  return response.json();
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`);
    if (!response.ok) {
      throw new Error('저장소 데이터를 불러오는데 실패했습니다.');
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
