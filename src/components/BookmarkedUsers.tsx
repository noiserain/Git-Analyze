import React, { useState, useEffect } from 'react';
import { GitHubUser, AuthUser } from '../types';
import { Bookmark, UserX, GripVertical } from 'lucide-react';

interface BookmarkedUsersProps {
  onSelectUser: (username: string) => void;
  user: AuthUser | null;
}

export function BookmarkedUsers({ onSelectUser, user }: BookmarkedUsersProps) {
  const [bookmarks, setBookmarks] = useState<Partial<GitHubUser>[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, [user]);

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

  const loadBookmarks = async () => {
    if (user) {
      try {
        const res = await fetch('/api/bookmarks', { headers: getHeaders() });
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data);
          return;
        }
      } catch (e) {
        console.error('Failed to load bookmarks from server');
      }
    }
    
    // Fallback or not logged in
    const saved = localStorage.getItem('github-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        setBookmarks([]);
      }
    } else {
      setBookmarks([]);
    }
  };

  const removeBookmark = async (e: React.MouseEvent, login: string) => {
    e.stopPropagation();
    const updated = bookmarks.filter(b => b.login !== login);
    setBookmarks(updated);
    
    if (user) {
      try {
        await fetch(`/api/bookmarks/${login}`, { method: 'DELETE', headers: getHeaders() });
      } catch (err) {
        console.error('Failed to delete bookmark on server');
      }
    } else {
      localStorage.setItem('github-bookmarks', JSON.stringify(updated));
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverItemIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedItemIndex !== null && dragOverItemIndex !== null && draggedItemIndex !== dragOverItemIndex) {
      const newBookmarks = [...bookmarks];
      const draggedItem = newBookmarks[draggedItemIndex];
      newBookmarks.splice(draggedItemIndex, 1);
      newBookmarks.splice(dragOverItemIndex, 0, draggedItem);
      
      setBookmarks(newBookmarks);
      
      if (user) {
        try {
          await fetch('/api/bookmarks', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ bookmarks: newBookmarks })
          });
        } catch (e) {
          console.error("Failed to reorder bookmarks on server");
        }
      } else {
        localStorage.setItem('github-bookmarks', JSON.stringify(newBookmarks));
      }
    }
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
          {bookmarks.map((user, index) => (
            <div 
              key={user.login}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onClick={() => onSelectUser(user.login!)}
              className={`flex items-center justify-between p-4 bg-white dark:bg-[#0d1117] border rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-md ${
                draggedItemIndex === index ? 'opacity-50 border-blue-500 dark:border-blue-500' : 
                dragOverItemIndex === index ? 'border-dashed border-2 border-blue-500 dark:border-blue-500 -translate-y-1' : 
                'border-gray-200 dark:border-[#30363d]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                  <GripVertical className="w-5 h-5" />
                </div>
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.login} 
                  className="w-12 h-12 rounded-full border border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#161b22] object-cover pointer-events-none"
                />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-gray-900 dark:text-white pointer-events-none">{user.name || user.login}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-400 font-mono pointer-events-none">@{user.login}</span>
                </div>
              </div>
              
              <button
                onClick={(e) => removeBookmark(e, user.login!)}
                className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                aria-label="Remove bookmark"
              >
                <Bookmark className="w-5 h-5 fill-current pointer-events-none" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
