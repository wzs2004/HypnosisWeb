import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Mic2, Download, Upload, FileJson } from 'lucide-react';
import { useStore } from '../store';

const SettingsScreen = ({ onBack }) => {
    const store = useStore();
    const { apiKey, setApiKey, baseUrl, setBaseUrl, selectedVoiceURI, setSelectedVoiceURI, importData } = store;
    const [voices, setVoices] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            setVoices(allVoices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // 导出数据
    const handleExport = () => {
        const data = {
            sessions: store.sessions,
            customTemplates: store.customTemplates,
            apiKey: store.apiKey,
            baseUrl: store.baseUrl,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hypnosis_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 导入数据
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.sessions) {
                    if(confirm(`检测到备份文件。\n包含方案: ${data.sessions.length} 个\n包含模版: ${data.customTemplates?.length || 0} 个\n\n确定要覆盖当前数据吗？`)) {
                        importData(data);
                        alert("数据恢复成功！");
                    }
                } else {
                    alert("文件格式错误：这不是有效的备份文件。");
                }
            } catch (err) {
                alert("导入失败：文件损坏或格式错误。");
            }
        };
        reader.readAsText(file);
        // 清空 input 防止重复选择同一文件不触发 onChange
        event.target.value = '';
    };

    return (
        <div className="flex flex-col h-screen bg-backgroundGray">
            <div className="p-4 flex items-center bg-white shadow-sm">
                <button onClick={onBack}><ChevronLeft size={28}/></button>
                <div className="flex-1 ml-4 font-bold text-lg">设置</div>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto pb-20">
                
                {/* 数据备份 */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <h3 className="font-bold mb-4 text-textBlack flex items-center gap-2">
                        <FileJson size={20} className="text-appleBlue"/> 数据备份
                    </h3>
                    <div className="flex gap-4">
                        <button onClick={handleExport} className="flex-1 bg-appleBlue/10 hover:bg-appleBlue/20 text-appleBlue font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                            <Download size={20}/>
                            <span className="text-xs">导出备份</span>
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                            <Upload size={20}/>
                            <span className="text-xs">恢复备份</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".json" 
                            onChange={handleImport}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">建议定期导出，防止浏览器缓存清空导致数据丢失。</p>
                </div>

                {/* 声音设置 */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-4 text-textBlack flex items-center gap-2">
                        <Mic2 size={20} className="text-appleBlue"/> 语音合成 (TTS)
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">选择发音人</label>
                            <select 
                                className="w-full p-3 bg-gray-50 rounded-lg border focus:border-appleBlue outline-none text-sm"
                                value={selectedVoiceURI || ""}
                                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                            >
                                <option value="">-- 跟随系统默认 --</option>
                                {voices.map((voice) => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-orange-500 mt-2 leading-relaxed">
                                💡 <strong>提示：</strong> 若想使用 <strong>MultiTTS</strong>，请先在手机系统设置中将首选 TTS 引擎设为 MultiTTS，然后重启浏览器。
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI 配置 */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-4 text-textBlack">AI 配置 (Kimi)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">API Key</label>
                            <input className="w-full p-3 bg-gray-50 rounded-lg border focus:border-appleBlue outline-none" type="password" placeholder="sk-xxxxxxxx" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Base URL</label>
                            <input className="w-full p-3 bg-gray-50 rounded-lg border focus:border-appleBlue outline-none" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;