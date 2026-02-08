import React, { useState } from 'react';
import { Wand2, BookTemplate } from 'lucide-react';
import { useStore } from '../store';
import { callKimiAI } from '../utils/aiService';

const ModuleDetailEditor = ({ module, onSave, onCancel }) => {
    const { apiKey, baseUrl, addCustomTemplate } = useStore();
    const [data, setData] = useState({...module});
    const [showAI, setShowAI] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState("");

    const handleAIGenerate = async () => {
        if(!apiKey) { setAiError("请先在首页设置中配置 API Key"); return; }
        setIsGenerating(true); setAiError("");
        const prompt = `你是一位顶级催眠师。请针对关键词“${aiTopic}”为催眠的【${data.stage}】阶段编写一段专业脚本。要求：包含视觉(V)、听觉(A)、体感(K)描述；使用米尔顿模式语言；字数300-500字；大量使用“……”表示停顿；直接输出文案。`;
        try {
            const content = await callKimiAI(apiKey, baseUrl, prompt);
            setData({ ...data, content: content }); setShowAI(false);
        } catch(e) { setAiError(e.message); } finally { setIsGenerating(false); }
    };

    const handleSaveTemplate = () => { addCustomTemplate(data); alert("已保存到【个人模版】库！"); };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-backgroundGray w-full sm:max-w-lg h-[90vh] sm:h-auto sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div className="bg-white p-4 rounded-t-2xl flex justify-between items-center border-b">
                    <button onClick={onCancel} className="text-gray-500">取消</button>
                    <div className="flex gap-4 items-center"><button onClick={handleSaveTemplate} className="text-teal-600 flex items-center gap-1 text-sm font-bold"><BookTemplate size={16}/> 存为模版</button></div>
                    <button onClick={() => onSave(data)} className="text-appleBlue font-bold">完成</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <label className="text-xs text-gray-400 font-bold block mb-1">标题</label>
                        <input className="w-full text-lg outline-none" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
                    </div>
                    <div className="flex justify-end"><button onClick={() => setShowAI(!showAI)} className="flex items-center gap-1 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full shadow-md active:scale-95"><Wand2 size={14} /> AI 撰写</button></div>
                    {showAI && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <input className="w-full p-2 border rounded-lg text-sm mb-2" placeholder="输入主题，如：深海放松..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
                            {aiError && <div className="text-xs text-red-500 mb-2">{aiError}</div>}
                            <button onClick={handleAIGenerate} disabled={isGenerating || !aiTopic} className={`w-full py-2 rounded-lg text-sm font-bold text-white ${isGenerating ? 'bg-gray-400' : 'bg-purple-600'}`}>{isGenerating ? "撰写中..." : "开始生成"}</button>
                        </div>
                    )}
                    <div className="bg-white p-3 rounded-xl shadow-sm flex-1">
                        <label className="text-xs text-gray-400 font-bold block mb-1">文案内容</label>
                        <textarea className="w-full h-48 outline-none resize-none text-base leading-relaxed text-gray-700" value={data.content} onChange={e => setData({...data, content: e.target.value})} />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                        <div><div className="flex justify-between text-sm mb-1"><span>重复次数</span><span className="text-appleBlue">{data.repeatCount}次</span></div><input type="range" min="1" max="10" value={data.repeatCount} onChange={e => setData({...data, repeatCount: parseInt(e.target.value)})} className="w-full accent-appleBlue"/></div>
                        <div><div className="flex justify-between text-sm mb-1"><span>省略号停顿</span><span className="text-appleBlue">{data.ellipsisDelay}秒</span></div><input type="range" min="0.1" max="5" step="0.1" value={data.ellipsisDelay} onChange={e => setData({...data, ellipsisDelay: parseFloat(e.target.value)})} className="w-full accent-appleBlue"/></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleDetailEditor;