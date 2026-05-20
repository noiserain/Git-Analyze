import { useState, useEffect, useMemo } from 'react';
import { GitHubRepo } from '../types';
import { RepoList } from './RepoList';
import { X, Search } from 'lucide-react';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repos: GitHubRepo[];
}

type SortType = 'popular' | 'latest' | 'forks';

export function RepoModal({ isOpen, onClose, repos }: RepoModalProps) {
  const [sortType, setSortType] = useState<SortType>('popular');
  const [searchTerm, setSearchTerm] = useState('');

  // close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filteredAndSortedRepos = useMemo(() => {
    return [...repos]
      .filter((repo) => 
        (repo.name && repo.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortType === 'popular') {
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortType === 'latest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortType === 'forks') {
          return b.forks_count - a.forks_count;
        }
        return 0;
      });
  }, [repos, sortType, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-md w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-4 border-b border-gray-200 dark:border-[#30363d] gap-4 transition-colors">
          <div className="flex bg-gray-100 dark:bg-[#010409] rounded-md p-1 border border-gray-200 dark:border-[#30363d] shrink-0 transition-colors order-2 sm:order-1 flex-1 sm:flex-none justify-center">
            <button 
              onClick={() => setSortType('latest')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${sortType === 'latest' ? 'bg-white dark:bg-[#238636] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#161b22]'}`}
            >
              최신순
            </button>
            <button 
              onClick={() => setSortType('popular')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${sortType === 'popular' ? 'bg-white dark:bg-[#238636] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#161b22]'}`}
            >
              인기순
            </button>
            <button 
              onClick={() => setSortType('forks')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${sortType === 'forks' ? 'bg-white dark:bg-[#238636] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#161b22]'}`}
            >
              포크순
            </button>
          </div>
          
          <div className="flex-1 w-full sm:w-auto sm:max-w-md relative group order-1 sm:order-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find a repository..."
              className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#010409] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
            />
          </div>

          <button 
            onClick={() => {
              onClose();
              setSearchTerm('');
            }}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#010409] hover:bg-gray-100 dark:hover:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-md transition-colors shrink-0 order-1 sm:order-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <RepoList repos={filteredAndSortedRepos} disableSort />
        </div>
      </div>
    </div>
  );
}
