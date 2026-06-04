import { GitHubUser, GitHubRepo } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_URL}/users/${username}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("해당 유저를 찾을 수 없습니다!"); // User not found
    }
    if (response.status === 403) {
      throw new Error('GitHub API 일일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
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
      if (response.status === 403) {
        throw new Error('GitHub API 일일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
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
