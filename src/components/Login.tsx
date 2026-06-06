import React, { useEffect } from 'react';
import { Github, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data.token) {
          localStorage.setItem('auth_token', event.data.token);
        }
        setIsLoggingIn(false);
        onLoginSuccess();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess]);

  const handleConnect = async () => {
    setIsLoggingIn(true);
    setError(null);
    // 모바일 브라우저의 팝업 차단을 방지하기 위해 클릭 즉시 빈 창을 먼저 엽니다.
    const authWindow = window.open('', 'oauth_popup', 'width=600,height=700');

    if (!authWindow) {
      setError('팝업이 차단되었습니다. 모바일 기기나 브라우저의 팝업 차단을 해제하고 다시 시도해주세요.');
      setIsLoggingIn(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('인증 URL을 가져오는데 실패했습니다.');
      }
      const { url } = await response.json();

      // 가져온 URL로 리다이렉트
      authWindow.location.href = url;
    } catch (err) {
      console.error('OAuth error:', err);
      authWindow.close();
      setError('로그인 진행 중 오류가 발생했습니다.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto py-20 px-4 fade-in slide-in-from-bottom-4 duration-500 animate-in">
      <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] p-8 rounded-2xl w-full shadow-sm flex flex-col items-center">
        <Github className="w-16 h-16 text-gray-900 dark:text-white mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">GitHub로 로그인</h2>
        <p className="text-gray-500 dark:text-slate-400 text-center mb-8 text-sm">
          내 계정으로 로그인하여 다른 기기에서도 북마크한 유저 목록을 동기화하세요.
        </p>

        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          {isLoggingIn ? '로그인 중...' : 'GitHub 계정으로 연결'}
        </button>
      </div>
    </div>
  );
}
