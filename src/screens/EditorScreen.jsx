import React, { useState } from 'react';
import { Play, ChevronLeft, Trash2, ArrowUp, ArrowDown, Plus, Edit3, AlertCircle, Clock } from 'lucide-react';
import { useStore } from '../store';
import ModuleDetailEditor from '../components/ModuleDetailEditor';
import TemplateSelector from '../components/TemplateSelector';
import { getStageStyle } from '../utils/stageColors';
import { calculateSessionDuration } from '../utils/timeCalculator'; // [新增]

const EditorScreen = ({ sessionId, onBack, onPlay }) => {
  const { sessions, updateSession } = useStore();
  const session = sessions.find(s => s.id === sessionId);
  
  const [editingModule, setEditingModule] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  if (!session) { onBack(); return null; }

  // [新增] 计算时长
  const totalDuration = calculateSessionDuration(session.modules);

  const handleRename = (newName) => {
      updateSession({ ...session, sessionName: newName });
  };

  const moveModule = (index, direction) => {
    const newModules = [...session.modules];
    if (direction === -1 && index > 0) [newModules[index], newModules[index-1]] = [newModules[index-1], newModules[index]];
    else if (direction === 1 && index < newModules.length - 1) [newModules[index], newModules[index+1]] = [newModules[index+1], newModules[index]];
    updateSession({ ...session, modules: newModules });
  };

  const deleteModule = (index) => {
      if(confirm('删除此模块？')) {
          const newModules = session.modules.filter((_, idx) => idx !== index);
          updateSession({ ...session, modules: newModules });
      }
  };

  const addTemplate = (template) => {
      const newModule = { ...template, id: Date.now().toString(), title: template.title };
      updateSession({ ...session, modules: [...session.modules, newModule] });
      setShowTemplateSelector(false);
  };

  const saveEditedModule = (updatedModuleData) => {
      const newModules = [...session.modules];
      newModules[editingModule] = updatedModuleData;
      updateSession({ ...session, modules: newModules });
      setEditingModule(null);
  };

  return (
    <div className="flex flex-col h-screen bg-backgroundGray">
        {editingModule !== null && <ModuleDetailEditor module={session.modules[editingModule]} onSave={saveEditedModule} onCancel={() => setEditingModule(null)} />}
        {showTemplateSelector && <TemplateSelector onSelect={addTemplate} onCancel={() => setShowTemplateSelector(false)} />}
        
        <div className="p-4 flex items-center bg-white shadow-sm z-10 gap-3">
            <button onClick={onBack}><ChevronLeft size={28}/></button>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <input 
                        className="font-bold text-lg outline-none bg-transparent border-b border-transparent focus:border-appleBlue transition-colors truncate w-full"
                        value={session.sessionName}
                        onChange={(e) => handleRename(e.target.value)}
                        placeholder="请输入催眠方案名称"
                    />
                    <Edit3 size={16} className="text-gray-300 shrink-0" />
                </div>
                {/* [新增] 时长显示 */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock size={12} />
                    <span>预计时长: {totalDuration} 分钟</span>
                </div>
            </div>
            
            <button onClick={() => { if(session.modules.length > 0) onPlay(); else alert("请先添加至少一个模块"); }} className={`text-white p-3 rounded-full shadow-md active:scale-95 ${session.modules.length > 0 ? 'bg-appleBlue' : 'bg-gray-300'}`}>
                <Play size={20} fill="currentColor"/>
            </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 pb-24">
            <div className="space-y-3">
                {session.modules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                        <AlertCircle size={48} className="opacity-20"/>
                        <p>当前方案为空，点击下方添加模块</p>
                    </div>
                )}
                {session.modules.map((m, i) => {
                    const style = getStageStyle(m.stage);
                    return (
                        <div key={m.id || i} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${style.border} flex items-center`}>
                            <div className="flex-1 clickable" onClick={() => setEditingModule(i)}>
                                <div className="font-bold text-lg mb-1 text-textBlack">{m.title}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${style.badge}`}>{style.label}</span>
                                    <span className="text-xs text-gray-400">{m.repeatCount}次 • 延时{m.delayAfter}s</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                                <button onClick={() => moveModule(i, -1)} className="p-1 text-gray-400 hover:text-appleBlue"><ArrowUp size={18}/></button>
                                <button onClick={() => moveModule(i, 1)} className="p-1 text-gray-400 hover:text-appleBlue"><ArrowDown size={18}/></button>
                            </div>
                            <button onClick={() => deleteModule(i)} className="p-2 text-gray-300 hover:text-red-500 ml-1"><Trash2 size={18}/></button>
                        </div>
                    );
                })}
                <button onClick={() => setShowTemplateSelector(true)} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold hover:border-appleBlue hover:text-appleBlue transition-colors flex justify-center items-center gap-2">
                    <Plus size={20}/> 添加模版 / 模块
                </button>
            </div>
        </div>
    </div>
  );
};

export default EditorScreen;