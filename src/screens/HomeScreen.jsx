import React from 'react';
import { Settings, Trash2, Plus } from 'lucide-react';
import { useStore } from '../store';

const HomeScreen = ({ onSelectSession, onSettings }) => {
  const { sessions, addSession, deleteSession } = useStore();
  return (
    <div className="min-h-screen bg-backgroundGray p-4 pb-24">
      <div className="flex justify-between items-center mb-6 mt-2 px-2"><h1 className="text-3xl font-bold text-textBlack">我的催眠</h1><button onClick={onSettings} className="text-gray-400 p-2 hover:bg-gray-100 rounded-full"><Settings size={24} /></button></div>
      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} onClick={() => onSelectSession(session.id)} className="bg-pureWhite p-5 rounded-2xl shadow-sm flex items-center active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-appleBlue/20">
            <div className="w-12 h-12 rounded-full bg-appleBlue/10 flex items-center justify-center text-appleBlue font-bold text-lg mr-4 shrink-0">{session.modules.length}</div>
            <div className="flex-1 min-w-0"><div className="font-bold text-lg text-textBlack truncate">{session.sessionName}</div><div className="text-sm text-textGray mt-0.5">点击进入</div></div>
            <button onClick={(e) => { e.stopPropagation(); if(confirm('确认删除?')) deleteSession(session.id); }} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none"><button onClick={addSession} className="pointer-events-auto bg-pureWhite text-appleBlue font-bold py-3 px-6 rounded-full shadow-xl flex items-center gap-2 border border-gray-100 active:scale-95 transition-transform"><Plus size={24} /> 新建方案</button></div>
    </div>
  );
};

export default HomeScreen;