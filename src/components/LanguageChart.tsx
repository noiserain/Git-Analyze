import { useState, useEffect } from 'react';
import { GitHubRepo } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, BarChart2, Rows } from 'lucide-react';

interface LanguageChartProps {
  repos: GitHubRepo[];
}

export function LanguageChart({ repos }: LanguageChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'strip'>('pie');

  useEffect(() => {
    const saved = localStorage.getItem('language-chart-type');
    if (saved === 'pie' || saved === 'bar' || saved === 'strip') {
      setChartType(saved);
    }
  }, []);

  const handleTypeChange = (type: 'pie' | 'bar' | 'strip') => {
    setChartType(type);
    localStorage.setItem('language-chart-type', type);
  };

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

  const stripData = [
    data.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, { name: 'languages' } as Record<string, any>)
  ];

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      if (chartType === 'strip') {
        const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
        return (
          <div className="bg-white dark:bg-[#010409] border border-gray-200 dark:border-[#30363d] rounded-md shadow-sm p-3 font-mono text-xs max-h-[200px] overflow-y-auto">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">언어 비중</p>
            {sortedPayload.map((entry: any, index: number) => (
              <div key={index} className="flex gap-2 items-center mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || entry.payload?.fill }}></span>
                <span className="text-gray-600 dark:text-[#c9d1d9]">{entry.name}: {entry.value} repos</span>
              </div>
            ))}
          </div>
        );
      } else {
        const name = payload[0].payload.name || payload[0].name;
        const value = payload[0].value;
        return (
          <div className="bg-white dark:bg-[#010409] border border-gray-200 dark:border-[#30363d] rounded-md shadow-sm p-3 font-mono text-xs">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">{name}</p>
            <p className="text-gray-600 dark:text-[#c9d1d9]">{value} repos</p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0d1117] transition-colors rounded-md border border-gray-200 dark:border-[#30363d] p-6 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white">Language Distribution</h3>
        <div className="flex gap-1 bg-gray-200 dark:bg-[#161b22] p-1 rounded-md border border-gray-300 dark:border-[#30363d]">
          <button
            onClick={() => handleTypeChange('pie')}
            className={`p-1.5 rounded-sm transition-all flex items-center justify-center ${chartType === 'pie' ? 'bg-white dark:bg-[#30363d] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            title="원 그래프"
          >
            <PieIcon size={16} />
          </button>
          <button
            onClick={() => handleTypeChange('bar')}
            className={`p-1.5 rounded-sm transition-all flex items-center justify-center ${chartType === 'bar' ? 'bg-white dark:bg-[#30363d] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            title="막대 그래프"
          >
            <BarChart2 size={16} />
          </button>
          <button
            onClick={() => handleTypeChange('strip')}
            className={`p-1.5 rounded-sm transition-all flex items-center justify-center ${chartType === 'strip' ? 'bg-white dark:bg-[#30363d] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            title="띠 그래프"
          >
            <Rows size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[300px] flex items-center justify-center w-full">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'pie' ? (
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
              <Tooltip content={renderTooltip} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#8b949e', paddingTop: '20px' }}
              />
            </PieChart>
          ) : chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363d" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8b949e', fontFamily: 'JetBrains Mono' }} angle={-45} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8b949e', fontFamily: 'JetBrains Mono' }} />
              <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={stripData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={60}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip content={renderTooltip} cursor={{ fill: 'transparent' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#8b949e', paddingTop: '40px' }} />
              {data.map((entry, index) => (
                <Bar key={entry.name} dataKey={entry.name} stackId="a" fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
