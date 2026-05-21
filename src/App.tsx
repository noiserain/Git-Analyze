import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Profile } from './components/Profile';
import { RepoList } from './components/RepoList';
import { LanguageChart } from './components/LanguageChart';
import { RepoModal } from './components/RepoModal';
import { fetchGitHubUser, fetchGitHubRepos } from './lib/github';
import { GitHubUser, GitHubRepo } from './types';
import { Github, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize theme based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update DOM class when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedUser, fetchedRepos] = await Promise.all([
        fetchGitHubUser(username),
        fetchGitHubRepos(username)
      ]);
      setUser(fetchedUser);
      setRepos(fetchedRepos);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      setUser(null);
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUser(null);
    setRepos([]);
    setError(null);
  };

  const topRepos = useMemo(() => {
    return [...repos].sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }).slice(0, 4);
  }, [repos]);

  return (
    <div className={`min-h-screen font-sans transition-colors bg-white dark:bg-[#010409] text-gray-900 dark:text-[#c9d1d9]`}>
      <Header 
        onSearch={handleSearch} 
        onReset={handleReset}
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        isLoading={isLoading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#2ea043]" />
            <p className="text-sm uppercase tracking-widest font-semibold">데이터를 분석하고 있습니다...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-[#0d1117] border border-red-200 dark:border-red-900 rounded-md p-6 flex flex-col items-center text-center transition-colors">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {!isLoading && !error && !user && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] p-6 rounded-full mb-6 relative overflow-hidden group hover:border-gray-400 dark:hover:border-[#8b949e] transition-colors">
              <Github className="w-12 h-12 text-gray-400 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">GitHub 유저를 검색해보세요!</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
              상단 검색창에 확인하고 싶은 개발자의 깃허브 아이디를 입력하시면, <br/>활동 데이터와 주력 언어를 분석해드립니다.
            </p>
          </div>
        )}

        {!isLoading && !error && user && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
            </div>
            <section>
              <Profile user={user} />
            </section>
            
            <div className="flex flex-col lg:flex-row gap-6 items-stretch">
              <section className="w-full lg:w-2/3 flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="font-bold text-gray-900 dark:text-white">Top Repositories</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 border border-gray-300 dark:border-[#30363d] text-gray-500 dark:text-slate-400 rounded-full uppercase tracking-wider font-mono transition-colors">
                      총 {repos.length}개
                    </span>
                    {repos.length > 4 && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-[10px] px-2 py-0.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-full uppercase tracking-wider font-mono transition-colors"
                      >
                        All Repositories
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <RepoList repos={topRepos} disableSort isGridFill />
                </div>
              </section>

              <section className="w-full lg:w-1/3 flex flex-col">
                <LanguageChart repos={repos} />
              </section>
            </div>
          </div>
        )}
        <RepoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          repos={repos} 
        />
      </main>
    </div>
  );
}
