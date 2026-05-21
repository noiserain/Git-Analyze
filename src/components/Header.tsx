import { Moon, Sun, Search, Github } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onSearch: (username: string) => void;
  onReset: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLoading: boolean;
}

export function Header({ onSearch, onReset, isDarkMode, toggleDarkMode, isLoading }: HeaderProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleLogoClick = () => {
    setSearchInput('');
    onReset();
  };

  return (
    <header className="sticky top-0 z-10 bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] transition-colors">
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
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search GitHub Username..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-[#30363d] rounded-md leading-5 bg-white dark:bg-[#010409] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all"
              disabled={isLoading}
            />
          </div>
        </form>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md bg-white dark:bg-[#010409] border border-gray-300 dark:border-[#30363d] text-gray-600 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-[#161b22] hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
