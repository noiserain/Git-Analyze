import { GitHubRepo } from '../types';
import { Star, GitFork, BookMarked, Circle } from 'lucide-react';

interface RepoListProps {
  repos: GitHubRepo[];
  disableSort?: boolean;
  isGridFill?: boolean;
}

export function RepoList({ repos, disableSort = false, isGridFill = false }: RepoListProps) {
  // Sort repos by star count descending, then by created_at descending if not disabled
  const sortedRepos = disableSort 
    ? repos 
    : [...repos].sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

  if (repos.length === 0) {
    return (
      <div className={`bg-gray-50 dark:bg-[#0d1117] transition-colors rounded-md border border-gray-200 dark:border-[#30363d] p-8 text-center text-gray-500 dark:text-slate-500 font-mono text-sm ${isGridFill ? 'h-full flex items-center justify-center' : ''}`}>
        공개된 저장소가 없습니다.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isGridFill ? 'h-full auto-rows-fr' : ''}`}>
      {sortedRepos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-md p-4 hover:bg-white dark:hover:bg-[#161b22] transition-colors shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline truncate max-w-[240px] sm:max-w-[300px]">
                {repo.name}
              </h4>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 border border-gray-200 dark:border-[#30363d] text-gray-500 dark:text-slate-400 rounded-full uppercase shrink-0 tracking-wider transition-colors">
              {repo.visibility || 'Public'}
            </span>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 flex-1 line-clamp-2 leading-relaxed">
            {repo.description || '설명이 없습니다.'}
          </p>

          <div className="flex items-center space-x-4 mt-4 text-[10px] font-mono text-gray-500 dark:text-slate-500">
            {repo.language && (
              <div className="flex items-center">
                <Circle className={`w-2 h-2 fill-current mr-1.5 ${getLanguageColor(repo.language)}`} />
                <span>{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>{repo.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              <span>{repo.forks_count}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <BookMarked className="w-3 h-3" />
              <span>{Math.round(repo.size / 1024)} MB</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

// Helper for basic language colors
function getLanguageColor(language: string) {
  const colors: Record<string, string> = {
    JavaScript: 'text-yellow-400',
    TypeScript: 'text-blue-500',
    Python: 'text-blue-400',
    Java: 'text-orange-500',
    'C++': 'text-pink-500',
    C: 'text-gray-600 text-gray-400',
    Ruby: 'text-red-500',
    Go: 'text-cyan-500',
    Rust: 'text-orange-600 text-orange-400',
    HTML: 'text-orange-500',
    CSS: 'text-purple-500',
    Vue: 'text-emerald-500',
    PHP: 'text-indigo-500',
  };
  return colors[language] || 'text-gray-400';
}
