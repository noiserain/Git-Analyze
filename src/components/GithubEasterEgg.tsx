import { useState, useEffect, useRef } from 'react';
import { Github } from 'lucide-react';

export function GithubEasterEgg() {
  const [clicks, setClicks] = useState(0); // 0 to 5
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setClicks((prev) => {
      const next = Math.min(prev + 1, 5);
      if (prev < 5 && next === 5) {
        try {
          const audio = new Audio('/cat.mp3');
          audio.onerror = () => { console.log('Audio file not found, waiting for upload.'); };
          audio.play().catch(console.error);
        } catch(e) {}
      }
      return next;
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setClicks((current) => {
          if (current <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return current - 1;
        });
      }, 150); 
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fillPercentage = (clicks / 5) * 100;

  return (
    <div 
      className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] p-6 rounded-full mb-6 relative overflow-hidden group hover:border-gray-400 dark:hover:border-[#8b949e] transition-colors cursor-pointer select-none"
      onClick={handleClick}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#2ea043] transition-all duration-150 ease-linear z-0"
        style={{ height: `${fillPercentage}%` }}
      />
      <Github className={`w-12 h-12 transition-colors relative z-10 ${clicks >= 3 ? 'text-white' : 'text-gray-400 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
    </div>
  );
}
