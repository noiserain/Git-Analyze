import { useState, useEffect } from 'react';
import { GitHubUser } from '../types';
import { MapPin, Link as LinkIcon, Building, Calendar, Bookmark } from 'lucide-react';
import { fetchBookmarks, updateBookmarks } from '../lib/github';

interface ProfileProps {
  user: GitHubUser;
  token?: string | null;
  onRequireLogin?: () => void;
}

export function Profile({ user, token, onRequireLogin }: ProfileProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsBookmarked(false);
      return;
    }
    fetchBookmarks(token)
      .then(bookmarks => {
        setIsBookmarked(bookmarks.some((b: GitHubUser) => b.login === user.login));
      })
      .catch(() => {});
  }, [user.login, token]);

  const toggleBookmark = async () => {
    if (!token) {
      alert('해당 기능은 로그인이 필요해요!');
      onRequireLogin?.();
      return;
    }

    try {
      const bookmarks = await fetchBookmarks(token);
      let newBookmarks = [];
      
      if (isBookmarked) {
        newBookmarks = bookmarks.filter((b: GitHubUser) => b.login !== user.login);
      } else {
        newBookmarks = [
          ...bookmarks,
          {
            login: user.login,
            name: user.name,
            avatar_url: user.avatar_url,
          },
        ];
      }
      
      await updateBookmarks(token, newBookmarks);
      setIsBookmarked(!isBookmarked);
    } catch (e: any) {
      alert(`북마크 업데이트 중 오류가 발생했습니다: ${e.message}`);
    }
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
