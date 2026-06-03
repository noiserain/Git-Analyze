import React from 'react';

const FAMOUS_USERS = [
  { login: 'torvalds', name: 'Linus Torvalds' },
  { login: 'yyx990803', name: 'Evan You' },
  { login: 'gaearon', name: 'Dan Abramov' },
  { login: 'tj', name: 'TJ Holowaychuk' },
  { login: 'antfu', name: 'Anthony Fu' },
  { login: 'sindresorhus', name: 'Sindre Sorhus' },
  { login: 'bradfitz', name: 'Brad Fitzpatrick' },
  { login: 'dhh', name: 'David Heinemeier Hansson' }
];

export function FamousUsers({ onUserClick }: { onUserClick: (username: string) => void }) {
  // 중복 데이터를 통해 끊김 없는 무한 스크롤 구현
  const scrollingUsers = [...FAMOUS_USERS, ...FAMOUS_USERS];

  return (
    <div className="mt-16 w-full overflow-hidden relative fade-in slide-in-from-bottom-4 duration-500 animate-in">
      {/* 양쪽 그라데이션 페이드 효과 */}
      <div className="absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-gray-50 dark:from-[#010409] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-gray-50 dark:from-[#010409] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] py-4">
        {scrollingUsers.map((user, i) => (
          <button
            key={i}
            onClick={() => onUserClick(user.login)}
            className="flex items-center gap-4 w-64 mx-3 p-4 rounded-xl bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img 
              src={`https://github.com/${user.login}.png`} 
              alt={user.name} 
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#161b22] object-cover group-hover:scale-105 transition-transform shrink-0"
              loading="lazy"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-gray-900 dark:text-white truncate">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">@{user.login}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
