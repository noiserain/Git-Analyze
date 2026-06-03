import { useState, useEffect } from 'react';
import { GitHubUser } from '../types';
import { Bookmark, UserX } from 'lucide-react';

interface BookmarkedUsersProps {
  onSelectUser: (username: string) => void;
}

export function BookmarkedUsers({ onSelectUser }: BookmarkedUsersProps) {
  const [bookmarks, setBookmarks] = useState<Partial<GitHubUser>[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const saved = localStorage.getItem('github-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        setBookmarks([]);
      }
    }
  };

  const removeBookmark = (e: React.MouseEvent, login: string) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.login !== login);
    localStorage.setItem('github-bookmarks', JSON.stringify(updated));
    setBookmarks(updated);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 fade-in slide-in-from-bottom-4 duration-500 animate-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">북마크한 유저</h2>
      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-[#30363d]">
          <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>아직 북마크한 유저가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarks.map((user) => (
            <div 
              key={user.login}
              onClick={() => onSelectUser(user.login!)}
              className="flex items-center justify-between p-4 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.login} 
                  className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#161b22] object-cover"
                />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-900 dark:text-white">{user.name || user.login}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-400 font-mono">@{user.login}</span>
                </div>
              </div>
              
              <button
                onClick={(e) => removeBookmark(e, user.login!)}
                className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                aria-label="Remove bookmark"
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
