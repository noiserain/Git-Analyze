import { Github } from 'lucide-react';

export function LoginView() {
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to fetch auth url');
      }
      const { url } = await response.json();
      window.location.href = url; // Redirect to the URL
    } catch (e: any) {
      console.error(e);
      alert(`로그인 준비 중 오류가 발생했습니다: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] p-6 rounded-full mb-6 relative overflow-hidden group hover:border-[#238636] transition-colors">
        <Github className="w-12 h-12 text-gray-900 dark:text-white group-hover:text-[#2ea043] transition-colors" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">GitHub 계정으로 로그인</h2>
      <p className="text-gray-500 dark:text-slate-400 max-w-md text-sm leading-relaxed mb-8">
        깃허브로 안전하게 로그인하시면 API 일일 요청 제한을 늘리고 오류 없이 더 많은 개발자 데이터를 탐색할 수 있습니다.
      </p>
      <button 
        onClick={handleLogin}
        className="flex items-center gap-3 px-8 py-3 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white transition-colors text-sm font-bold shadow-md"
      >
        <Github className="w-5 h-5" />
        GitHub으로 안전하게 인증하기
      </button>
    </div>
  );
}
