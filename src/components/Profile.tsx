import { GitHubUser } from '../types';
import { MapPin, Link as LinkIcon, Users, UserPlus, Building, Calendar } from 'lucide-react';

interface ProfileProps {
  user: GitHubUser;
}

export function Profile({ user }: ProfileProps) {
  const joinDate = new Date(user.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 dark:bg-[#0d1117] transition-colors rounded-md border border-gray-200 dark:border-[#30363d] p-6 sm:p-8 flex flex-col items-center sm:items-start sm:flex-row gap-6 sm:gap-8">
      <img
        src={user.avatar_url}
        alt={`${user.login} profile`}
        className="w-32 h-32 rounded-full border-2 border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] object-cover transition-colors"
      />
      <div className="flex-1 space-y-4 text-center sm:text-left w-full">
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
