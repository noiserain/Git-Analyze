import { useState, useEffect } from 'react';
import { GitHubUser, AuthUser } from '../types';
import { MapPin, Link as LinkIcon, Building, Calendar, Bookmark } from 'lucide-react';

interface ProfileProps {
  user: GitHubUser;
  authUser: AuthUser | null;
}

export function Profile({ user, authUser }: ProfileProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    checkBookmarkState();
  }, [user.login, authUser]);

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const checkBookmarkState = async () => {
    if (authUser) {
      try {
        const res = await fetch('/api/bookmarks', { headers: getHeaders() });
        if (res.ok) {
          const bookmarks = await res.json();
          setIsBookmarked(bookmarks.some((b: GitHubUser) => b.login === user.login));
          return;
        }
      } catch (e) {
        // Fallback to localstorage below
      }
    }
    
    const saved = localStorage.getItem('github-bookmarks');
    if (saved) {
      try {
        const bookmarks = JSON.parse(saved);
        setIsBookmarked(bookmarks.some((b: GitHubUser) => b.login === user.login));
      } catch (e) {
        // ignore parse error
      }
    }
  };

  const toggleBookmark = async () => {
    const isNowBookmarked = !isBookmarked;
    setIsBookmarked(isNowBookmarked);
    
    if (authUser) {
      if (isNowBookmarked) {
        try {
          await fetch('/api/bookmarks', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              bookmark: {
                login: user.login,
                name: user.name,
                avatar_url: user.avatar_url
              }
            })
          });
        } catch (e) { console.error(e); }
      } else {
        try {
          await fetch(`/api/bookmarks/${user.login}`, { method: 'DELETE', headers: getHeaders() });
        } catch (e) { console.error(e); }
      }
    }
    
    // Also save to local storage
    const saved = localStorage.getItem('github-bookmarks');
    let localBookmarks = [];
    if (saved) {
      try {
        localBookmarks = JSON.parse(saved);
      } catch (e) {
        localBookmarks = [];
      }
    }
    
    if (!isNowBookmarked) {
      localBookmarks = localBookmarks.filter((b: GitHubUser) => b.login !== user.login);
    } else {
      localBookmarks.push({
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url
      });
    }
    
    localStorage.setItem('github-bookmarks', JSON.stringify(localBookmarks));
  };

  const joinDate = new Date(user.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 dark:bg-[#0d1117] transition-colors rounded-md border border-gray-200 dark:border-[#30363d] p-6 sm:p-8 flex flex-col items-center sm:items-start sm:flex-row gap-6 sm:gap-8 relative">
      <button
        onClick={toggleBookmark}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#1b2129] text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white transition-colors group z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <Bookmark className={`w-5 h-5 transition-colors ${isBookmarked ? 'fill-blue-500 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400' : ''}`} />
      </button>

      <img
        src={user.avatar_url}
        alt={`${user.login} profile`}
        className="w-32 h-32 rounded-full border-2 border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] object-cover transition-colors"
      />
      <div className="flex-1 space-y-4 text-center sm:text-left w-full sm:pr-20">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name || user.login}
          </h2>
          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 text-sm font-mono hover:underline flex items-center justify-center sm:justify-start gap-1 mt-1"
          >
            @{user.login}
          </a>
        </div>

        {user.bio && (
          <p className="text-gray-600 dark:text-slate-400 max-w-2xl text-sm leading-relaxed">
            {user.bio}
          </p>
        )}

        <div className="flex justify-around sm:justify-start sm:gap-8 w-full text-center sm:text-left border-y border-gray-200 dark:border-[#30363d] py-4 mt-4 transition-colors">
          <div className="flex-1 sm:flex-none">
            <p className="text-gray-900 dark:text-white font-bold">{user.followers}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-500 mt-0.5">팔로워</p>
          </div>
          <div className="flex-1 sm:flex-none border-l border-gray-200 dark:border-[#30363d] sm:border-none transition-colors">
            <p className="text-gray-900 dark:text-white font-bold">{user.following}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-500 mt-0.5">팔로잉</p>
          </div>
          <div className="flex-1 sm:flex-none border-l border-gray-200 dark:border-[#30363d] sm:border-none transition-colors">
            <p className="text-gray-900 dark:text-white font-bold">{user.public_repos}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-500 mt-0.5">저장소</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          {user.company && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-xs font-mono">
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.company}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
          {user.blog && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-xs font-mono">
              <LinkIcon className="w-3.5 h-3.5 shrink-0" />
              <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate transition-colors">
                {user.blog}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>가입일: {joinDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
