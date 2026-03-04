import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Upload, 
  UserPlus, 
  Trash2, 
  Download, 
  RefreshCw, 
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';

// --- Types ---
type Tab = 'draw' | 'grouping';

interface Participant {
  id: string;
  name: string;
  isDuplicate: boolean;
}

// --- Constants ---
const MOCK_NAMES = [
  "王小明", "李美玲", "張大衛", "陳雅婷", "林志豪", 
  "黃淑芬", "吳建宏", "蔡依林", "周杰倫", "林俊傑",
  "徐若瑄", "金城武", "梁朝偉", "劉德華", "張曼玉",
  "王菲", "謝霆鋒", "張柏芝", "陳奕迅", "容祖兒"
];

// --- Main App Component ---
export default function App() {
  const [namesText, setNamesText] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('draw');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  // Sync namesText to participants
  useEffect(() => {
    const lines = namesText.split('\n').map(n => n.trim()).filter(n => n !== '');
    const counts: Record<string, number> = {};
    lines.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });

    const newParticipants = lines.map((name, index) => ({
      id: `${name}-${index}`,
      name,
      isDuplicate: counts[name] > 1
    }));
    setParticipants(newParticipants);
  }, [namesText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const names = results.data
          .flat()
          .map((n: any) => String(n).trim())
          .filter(n => n !== '');
        setNamesText(names.join('\n'));
      },
      header: false
    });
  };

  const removeDuplicates = () => {
    const uniqueNames = Array.from(new Set(participants.map(p => p.name)));
    setNamesText(uniqueNames.join('\n'));
  };

  const loadMockData = () => {
    setNamesText(MOCK_NAMES.join('\n'));
  };

  const hasDuplicates = participants.some(p => p.isDuplicate);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">HR Tool: Lucky Draw & Grouping</h1>
          </div>
          <div className="flex gap-1 bg-[#F0F0F0] p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('draw')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'draw' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
            >
              <div className="flex items-center gap-2">
                <Trophy size={16} />
                <span>獎品抽籤</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('grouping')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'grouping' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid size={16} />
                <span>自動分組</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Name Input */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <UserPlus size={18} />
                名單來源
              </h2>
              <button 
                onClick={loadMockData}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <RefreshCw size={12} />
                載入模擬名單
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                貼上姓名 (每行一個)
              </label>
              <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                placeholder="例如：&#10;王小明&#10;李美玲"
                className="w-full h-64 p-4 bg-[#F9F9F9] border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none font-mono"
              />
            </div>

            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer bg-white border border-black/10 hover:bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <Upload size={16} />
                上傳 CSV
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
              {hasDuplicates && (
                <button 
                  onClick={removeDuplicates}
                  className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  title="移除重複姓名"
                >
                  <Trash2 size={16} />
                  去重
                </button>
              )}
            </div>
          </section>

          {/* List Preview */}
          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                名單預覽 ({participants.length})
              </h2>
              {hasDuplicates && (
                <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle size={12} />
                  發現重複
                </div>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm italic">
                  尚未加入名單
                </div>
              ) : (
                participants.map((p) => (
                  <div 
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm ${p.isDuplicate ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-700'}`}
                  >
                    <span>{p.name}</span>
                    {p.isDuplicate && <span className="text-[10px] font-bold uppercase">Duplicate</span>}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Content: Draw or Grouping */}
        <div className="lg:col-span-8">
          {activeTab === 'draw' ? (
            <LuckyDraw participants={participants.map(p => p.name)} />
          ) : (
            <Grouping participants={participants.map(p => p.name)} />
          )}
        </div>
      </main>
    </div>
  );
}

// --- Lucky Draw Component ---
function LuckyDraw({ participants }: { participants: string[] }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [winners, setWinners] = useState<string[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [drawCount, setDrawCount] = useState(1);
  
  const drawIntervalRef = useRef<number | null>(null);

  const startDraw = () => {
    if (participants.length === 0) return;
    
    const availablePool = allowRepeat 
      ? participants 
      : participants.filter(p => !winners.includes(p));

    if (availablePool.length === 0) {
      alert('所有人都已經中獎了！');
      return;
    }

    setIsDrawing(true);
    let counter = 0;
    const duration = 2000; // 2 seconds animation
    const interval = 50;

    drawIntervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availablePool.length);
      setCurrentName(availablePool[randomIndex]);
      counter += interval;

      if (counter >= duration) {
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        const finalWinner = availablePool[Math.floor(Math.random() * availablePool.length)];
        setCurrentName(finalWinner);
        setWinners(prev => [finalWinner, ...prev]);
        setIsDrawing(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, interval);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl shadow-sm border border-black/5 p-8 text-center space-y-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="space-y-2">
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-widest">Lucky Draw</h3>
          <h2 className="text-3xl font-bold tracking-tight">獎品抽籤</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <AnimatePresence mode="wait">
            {currentName ? (
              <motion.div
                key={currentName}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, y: -20 }}
                className={`text-6xl md:text-8xl font-black tracking-tighter ${isDrawing ? 'text-gray-300 italic' : 'text-black'}`}
              >
                {currentName}
              </motion.div>
            ) : (
              <div className="text-gray-200 text-6xl font-black tracking-tighter">
                READY?
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-black/5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={allowRepeat} 
                onChange={(e) => setAllowRepeat(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-600">允許重複中獎</span>
            </label>
          </div>

          <button
            onClick={startDraw}
            disabled={isDrawing || participants.length === 0}
            className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ${
              isDrawing || participants.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isDrawing ? <RefreshCw className="animate-spin" /> : <Trophy />}
            {isDrawing ? '抽籤中...' : '開始抽籤'}
          </button>
        </div>
      </section>

      {/* Winner History */}
      <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            中獎名單 ({winners.length})
          </h3>
          {winners.length > 0 && (
            <button 
              onClick={() => setWinners([])}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              清空紀錄
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {winners.map((winner, idx) => (
              <motion.div
                key={`${winner}-${winners.length - idx}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-50 border border-black/5 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-300 w-4">#{winners.length - idx}</span>
                  <span className="font-medium text-sm">{winner}</span>
                </div>
                <Trophy size={12} className="text-yellow-500" />
              </motion.div>
            ))}
          </AnimatePresence>
          {winners.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-400 text-sm italic">
              尚未有中獎者
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// --- Grouping Component ---
function Grouping({ participants }: { participants: string[] }) {
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<string[][]>([]);

  const performGrouping = () => {
    if (participants.length === 0) return;
    
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: string[][] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push(shuffled.slice(i, i + groupSize));
    }
    
    setGroups(newGroups);
  };

  const downloadCSV = () => {
    if (groups.length === 0) return;
    
    const csvData = groups.flatMap((group, idx) => 
      group.map(name => ({ 'Group': `Group ${idx + 1}`, 'Name': name }))
    );
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `grouping_results_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">自動分組</h2>
            <p className="text-sm text-gray-500">設定每組人數，系統將隨機分配成員</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-black/5">
              <span className="text-xs font-bold text-gray-400 px-2 uppercase">每組人數</span>
              <input 
                type="number" 
                min="1" 
                max={participants.length || 1}
                value={groupSize} 
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                className="w-16 bg-white border border-black/10 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
              />
            </div>
            <button
              onClick={performGrouping}
              disabled={participants.length === 0}
              className="bg-black text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <RefreshCw size={16} />
              開始分組
            </button>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="flex justify-end">
            <button 
              onClick={downloadCSV}
              className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1 border border-black/5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              下載分組結果 (CSV)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {groups.map((group, idx) => (
              <motion.div
                key={`group-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#F9F9F9] border border-black/5 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                    <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </div>
                    第 {idx + 1} 組
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{group.length} 人</span>
                </div>
                <div className="space-y-2">
                  {group.map((name, nIdx) => (
                    <div key={nIdx} className="flex items-center gap-3 text-sm text-gray-700">
                      <ChevronRight size={12} className="text-gray-300" />
                      {name}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {groups.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <LayoutGrid className="text-gray-200" size={32} />
              </div>
              <p className="text-gray-400 text-sm italic">點擊「開始分組」以生成結果</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
