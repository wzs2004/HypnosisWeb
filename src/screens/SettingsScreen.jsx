import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Mic2, Download, Upload, FileJson, PlayCircle, StopCircle, Volume2 } from 'lucide-react';
import { useStore } from '../store';

const SettingsScreen = ({ onBack }) => {
    const store = useStore();
    const { apiKey, setApiKey, baseUrl, setBaseUrl, selectedVoiceURI, setSelectedVoiceURI, importData } = store;
    const [voices, setVoices] = useState([]);
    const [isTesting, setIsTesting] = useState(false); // [新增] 试音状态
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            setVoices(allVoices);
        };
        loadVoices();
        // Chrome/iOS Safari 加载声音列表是异步的
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // [新增] 试音功能
    const handleTestVoice = () => {
        if (isTesting) {
            window.speechSynthesis.cancel();
            setIsTesting(false);
            return;
        }

        const u = new SpeechSynthesisUtterance("你好，这是一段测试音频。如果听到声音，说明设置正常。");
        u.lang = 'zh-CN';
        u.rate = 1.0; // 测试用标准语速
        
        // 应用当前选择的声音
        if (selectedVoiceURI) {
            const targetVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
            if (targetVoice) u.voice = targetVoice;
        }

        u.onstart = () => setIsTesting(true);
        u.onend = () => setIsTesting(false);
        u.onerror = () => setIsTesting(false);

        window.speechSynthesis.speak(u);
    };

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

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.sessions) {
                    if(confirm(`检测到备份文件。\n包含方案: ${data.sessions.length} 个\n确定要恢复吗？`)) {
                        importData(data);
                        alert("数据恢复成功！");
                    }
                } else {
                    alert("文件格式错误");
                }
            } catch (err) {
                alert("导入失败");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="flex flex-col h-screen bg-backgroundGray">
            <div className="p-4 flex items-center bg-white shadow-sm">
                <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }}><ChevronLeft size={28}/></button>
                <div className="flex-1 ml-4 font-bold text-lg">设置</div>
            </div>
            <div className="p-4 space-y-6 overflow-y-auto pb-20">
                
                {/* [新增] iOS 警告提示 */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex gap-3 items-start">
                    <Volume2 className="text-orange-500 shrink-0 mt-0.5" size={20}/>
                    <div className="text-xs text-orange-700 leading-relaxed">
                        <strong>iPhone 用户必读：</strong><br/>
                        如果播放没有声音，请检查手机侧面的<strong>“静音开关”</strong>是否开启。网页音频会被静音键屏蔽，请关闭静音模式（拨到上方）。
                    </div>
                </div>

                {/* 声音设置 */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold mb-4 text-textBlack flex items-center gap-2">
                        <Mic2 size={20} className="text-appleBlue"/> 语音合成 (TTS)
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">选择发音人</label>
                            
                            {/* [新增] 下拉框 + 试音按钮组合 */}
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 p-3 bg-gray-50 rounded-lg border focus:border-appleBlue outline-none text-sm w-0" // w-0 用于 flex 布局防溢出
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
                                <button 
                                    onClick={handleTestVoice}
                                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${isTesting ? 'bg-red-100 text-red-500' : 'bg-appleBlue/10 text-appleBlue'}`}
                                >
                                    {isTesting ? <StopCircle size={20} /> : <PlayCircle size={20} />}
                                    <span className="text-xs font-bold ml-1">{isTesting ? '停止' : '试听'}</span>
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                💡 提示：若想使用 MultiTTS，请在系统设置中切换引擎后重启浏览器。
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

                {/* 备份 */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <h3 className="font-bold mb-4 text-textBlack flex items-center gap-2">
                        <FileJson size={20} className="text-appleBlue"/> 数据备份
                    </h3>
                    <div className="flex gap-4">
                        <button onClick={handleExport} className="flex-1 bg-appleBlue/10 hover:bg-appleBlue/20 text-appleBlue font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                            <Download size={20}/>
                            <span className="text-xs">导出</span>
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                            <Upload size={20}/>
                            <span className="text-xs">恢复</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;