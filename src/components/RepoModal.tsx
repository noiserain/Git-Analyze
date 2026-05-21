import { useState, useEffect, useMemo, useRef } from 'react';
import { GitHubRepo } from '../types';
import { RepoList } from './RepoList';
import { X, Search, ChevronDown, Check } from 'lucide-react';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repos: GitHubRepo[];
}

type SortType = 'popular' | 'latest' | 'forks';

export function RepoModal({ isOpen, onClose, repos }: RepoModalProps) {
  const [sortType, setSortType] = useState<SortType>('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(repo => {
      if (repo.language) {
        langs.add(repo.language);
      }
    });
    return Array.from(langs).sort();
  }, [repos]);

  // close on escape and click outside
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setSearchTerm('');
        setSelectedLanguages([]);
        setIsLanguageDropdownOpen(false);
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const filteredAndSortedRepos = useMemo(() => {
    return [...repos]
      .filter((repo) => {
        const matchesSearch = (repo.name && repo.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                              (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLanguage = selectedLanguages.length === 0 || (repo.language && selectedLanguages.includes(repo.language));
        return matchesSearch && matchesLanguage;
      })
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
  }, [repos, sortType, searchTerm, selectedLanguages]);

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
          
          <div className="flex-1 w-full sm:w-auto sm:max-w-lg flex items-center gap-2 order-1 sm:order-2">
            <div className="relative group flex-1">
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
            
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center justify-between w-32 pl-3 pr-2 py-1.5 border border-gray-200 dark:border-[#30363d] rounded-md text-sm leading-5 bg-white dark:bg-[#010409] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono cursor-pointer"
              >
                <span className="truncate">
                  {selectedLanguages.length === 0 
                    ? '전체' 
                    : `${selectedLanguages.length}개 선택됨`}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500 shrink-0 ml-1" />
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-md shadow-lg z-10 py-1 max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <label 
                      key={lang} 
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors"
                    >
                      <div className="relative flex items-center justify-center w-4 h-4 mr-3 border border-gray-300 dark:border-[#484f58] rounded transition-colors bg-white dark:bg-[#0d1117]">
                        <input
                          type="checkbox"
                          className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                          checked={selectedLanguages.includes(lang)}
                          onChange={() => toggleLanguage(lang)}
                        />
                        {selectedLanguages.includes(lang) && (
                          <Check className="w-3 h-3 text-blue-500 pointer-events-none" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white font-mono truncate">{lang}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => {
              onClose();
              setSearchTerm('');
              setSelectedLanguages([]);
              setIsLanguageDropdownOpen(false);
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
