import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { systemTemplates } from '../systemTemplates';
import { STAGE_STYLES, getStageStyle } from '../utils/stageColors'; // [新增]

const TemplateSelector = ({ onSelect, onCancel }) => {
    const { customTemplates, deleteCustomTemplate } = useStore();
    
    // [新增] 动态生成 Tabs，带颜色
    const stages = [
        { id: 'PERSONAL', ...STAGE_STYLES['PERSONAL'] },
        { id: 'INDUCTION', ...STAGE_STYLES['INDUCTION'] },
        { id: 'DEEPENING', ...STAGE_STYLES['DEEPENING'] },
        { id: 'CORE', ...STAGE_STYLES['CORE'] },
        { id: 'TERMINATION', ...STAGE_STYLES['TERMINATION'] },
        { id: 'AWAKENING', ...STAGE_STYLES['AWAKENING'] }
    ];
    
    const [activeStage, setActiveStage] = useState('INDUCTION');
    const currentTemplates = activeStage === 'PERSONAL' ? customTemplates : systemTemplates.filter(t => t.stage === activeStage);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-backgroundGray w-full max-w-lg h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-white p-4 flex justify-between items-center border-b">
                    <h3 className="font-bold text-lg">选择模版</h3>
                    <button onClick={onCancel}><X size={24} className="text-gray-400"/></button>
                </div>
                
                {/* 带有颜色的标签页 */}
                <div className="flex overflow-x-auto p-2 bg-white gap-2 border-b no-scrollbar">
                    {stages.map(stage => (
                        <button 
                            key={stage.id} 
                            onClick={() => setActiveStage(stage.id)} 
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                                activeStage === stage.id 
                                ? `${stage.bg} ${stage.border} ${stage.text} border` 
                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {stage.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentTemplates.length === 0 && <div className="text-center text-gray-400 mt-10">暂无模版</div>}
                    {currentTemplates.map((template) => {
                        const style = getStageStyle(template.stage);
                        return (
                            <div key={template.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${style.border} cursor-pointer active:scale-98 transition-all relative group hover:bg-gray-50`}>
                                <div onClick={() => onSelect(template)}>
                                    <div className="font-bold text-textBlack mb-1 pr-8">{template.title}</div>
                                    <div className="text-xs text-gray-400 flex gap-3 mb-2">
                                        <span className={`px-1.5 py-0.5 rounded ${style.bg} ${style.text} font-bold`}>{style.label}</span>
                                        <span className="self-center">{template.content.length} 字</span>
                                        <span className="self-center">留白 {template.ellipsisDelay}s</span>
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed opacity-80">{template.content}</div>
                                </div>
                                {activeStage === 'PERSONAL' && (
                                    <button onClick={(e) => { e.stopPropagation(); if(confirm('确定删除?')) deleteCustomTemplate(template.id); }} className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TemplateSelector;