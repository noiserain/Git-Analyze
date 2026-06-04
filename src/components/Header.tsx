import { Moon, Sun, Search, Github, Menu, X, Bookmark, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { searchGitHubUsers } from '../lib/github';
import { GitHubUser } from '../types';
import { useDebounce } from 'use-debounce';

interface HeaderProps {
  onSearch: (username: string) => void;
  onReset: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onViewChange: (view: 'home' | 'bookmarks') => void;
}

export function Header({ onSearch, onReset, isDarkMode, toggleDarkMode, isLoading, searchTerm, setSearchTerm, onViewChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Partial<GitHubUser>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearch.trim()) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchGitHubUsers(debouncedSearch.trim());
        setSuggestions(results);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleLogoClick = () => {
    setSearchTerm('');
    onReset();
    onViewChange('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleLogoClick();
          }}
        >
          <Github className="w-8 h-8 text-gray-900 dark:text-white" />
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
            Git-Analyze
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-lg mx-4">
          <div className="relative group" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search GitHub Username..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#010409] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
              disabled={isLoading}
            />
            {showSuggestions && searchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-md shadow-lg overflow-hidden z-50">
                {isSearching ? (
                  <div className="flex items-center justify-center p-4 text-gray-500 dark:text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestions.map((user) => (
                      <li key={user.login}>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm(user.login || '');
                            onSearch(user.login || '');
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#161b22] text-left transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-[#161b22]"
                        >
                          {user.avatar_url && (
                            <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.login}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-gray-500 dark:text-slate-400 text-center">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 rounded-md bg-white dark:bg-[#010409] border border-gray-300 dark:border-[#30363d] text-gray-600 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-[#161b22] hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-[#0d1117] border-l border-gray-200 dark:border-[#30363d] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-[#30363d]">
          <span className="font-bold text-gray-900 dark:text-white">더보기</span>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161b22] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full p-3 rounded-md text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#161b22] transition-colors text-sm font-medium"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-gray-500 dark:text-slate-400" /> : <Moon className="w-4 h-4 text-gray-500 dark:text-slate-400" />}
            {isDarkMode ? '라이트 모드' : '다크 모드'}
          </button>
          
          <button
            className="flex items-center gap-3 w-full p-3 rounded-md text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#161b22] transition-colors text-sm font-medium"
            onClick={() => {
              onViewChange('bookmarks');
              setIsMenuOpen(false);
            }}
          >
            <Bookmark className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            보관함
          </button>
        </div>
      </div>
    </header>
  );
}
