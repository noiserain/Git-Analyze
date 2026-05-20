import { GitHubRepo } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LanguageChartProps {
  repos: GitHubRepo[];
}

export function LanguageChart({ repos }: LanguageChartProps) {
  // Aggregate language counts using reduce
  const languageCounts = repos.reduce((acc: Record<string, number>, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const data = Object.entries(languageCounts)
    .map(([name, value]) => ({ name, value }))
    // Sort by usage count and take top 10 to avoid cluttered chart
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <div className="bg-[#0d1117] rounded-md border border-[#30363d] p-8 h-[300px] flex items-center justify-center text-slate-500 font-mono text-sm">
        표시할 언어 데이터가 없습니다.
      </div>
    );
  }

  // Pre-defined color palette matching github dark
  const COLORS = [
    '#3b82f6', '#2ea043', '#d29922', '#f85149', 
    '#a371f7', '#ec6547', '#3fb950', '#ff7b72', 
    '#79c0ff', '#56d364'
  ];

  return (
    <div className="bg-gray-50 dark:bg-[#0d1117] transition-colors rounded-md border border-gray-200 dark:border-[#30363d] p-6 flex flex-col h-full">
      <h3 className="font-bold text-gray-900 dark:text-white mb-6">Language Distribution</h3>
      <div className="flex-1 min-h-[300px] flex items-center justify-center w-full">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-[#010409] border border-gray-200 dark:border-[#30363d] rounded-md shadow-sm p-3 font-mono text-xs">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">{payload[0].name}</p>
                      <p className="text-gray-600 dark:text-[#c9d1d9]">{payload[0].value} repos</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#8b949e', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
