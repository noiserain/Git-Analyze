import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_API_URL = '/api/github';

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_URL}/users/${username}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || '데이터를 불러오는데 실패했습니다.');
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
