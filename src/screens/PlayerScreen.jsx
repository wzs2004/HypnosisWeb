import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ChevronLeft, Music, Sliders, Mic, Volume2 } from 'lucide-react';
import { useStore } from '../store';
import { binauralEngine } from '../BinauralBeatEngine';
import InteractionOverlay from '../components/InteractionOverlay';

const hypnoticPrompts = [
    {
        intro: "现在的你……非常放松……为了让这种沉重的舒适感加深两倍……",
        action: (n) => `请允许你的潜意识……控制手指……轻轻点击屏幕 ${n} 次……`,
        benefit: "每一次点击……都像关掉一盏灯……带你进入更深的宁静……"
    },
    {
        intro: "你的身体正在休息……但你的潜意识非常清醒……为了确认这种连接……",
        action: (n) => `请在不需要睁眼的情况下……凭直觉点击屏幕 ${n} 次……`,
        benefit: "做得很好……随着指尖的触碰……所有的杂念都消失了……"
    },
    {
        intro: "想象你正站在一个通往深处的楼梯口……为了迈下这几级台阶……",
        action: (n) => `请随着我的倒数……点击屏幕 ${n} 次……`,
        benefit: "每点一次……你就向下走一步……越来越深……越来越沉……"
    }
];

const PlayerScreen = ({ sessionId, onBack }) => {
  const { sessions, selectedVoiceURI, setSelectedVoiceURI } = useStore();
  const session = sessions.find(s => s.id === sessionId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  const [currentText, setCurrentText] = useState("准备就绪");
  
  const [rate, setRate] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  
  const [interactionMode, setInteractionMode] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionStatus, setInteractionStatus] = useState("");
  const [targetTaps, setTargetTaps] = useState(0); 
  const [userTaps, setUserTaps] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false); 

  const stopSignal = useRef(false);
  const userResponseResolver = useRef(null);
  const wakeUpTimeoutRef = useRef(null); 

  useEffect(() => {
      const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  if (!session) { onBack(); return null; }

  const speak = (text, forceRate = null, forcePitch = null) => {
    return new Promise((resolve) => {
      if (stopSignal.current) { resolve(); return; }
      // 注意：这里不要盲目 cancel，否则可能会打断刚解锁的音频流，
      // 但为了防止重叠，我们只在非iOS或确定有播放时cancel，或者直接依靠 speak 队列
      window.speechSynthesis.cancel();
      
      const u = new SpeechSynthesisUtterance(text);
      const currentVoiceURI = useStore.getState().selectedVoiceURI;
      
      if (currentVoiceURI) {
          const voices = window.speechSynthesis.getVoices();
          const targetVoice = voices.find(v => v.voiceURI === currentVoiceURI);
          if (targetVoice) {
              u.voice = targetVoice;
              u.lang = targetVoice.lang; 
          }
      }
      
      if (!u.voice) u.lang = 'zh-CN'; 

      u.rate = forceRate || rate; 
      u.pitch = forcePitch || pitch;
      u.onend = resolve; 
      u.onerror = (e) => {
          // iOS 有时会因为音频会话被抢占而报错，这里做容错处理
          console.error("TTS Error:", e);
          resolve();
      }; 
      window.speechSynthesis.speak(u);
    });
  };

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const finishInteraction = (result) => {
      if (wakeUpTimeoutRef.current) {
          clearTimeout(wakeUpTimeoutRef.current);
          wakeUpTimeoutRef.current = null;
      }
      if (userResponseResolver.current) {
          userResponseResolver.current(result);
          userResponseResolver.current = null; 
      }
  };

  const handleScreenTap = () => {
      if (!isInteracting) return;
      if (isWakingUp) {
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
          finishInteraction('POSITIVE');
          return;
      }
      if (navigator.vibrate) navigator.vibrate(30); 
      const newCount = userTaps + 1;
      setUserTaps(newCount);
      if (targetTaps > 0 && newCount === targetTaps) {
          if (navigator.vibrate) navigator.vibrate([30, 50, 30]); 
          setTimeout(() => finishInteraction('POSITIVE'), 600);
      }
  };

  const startWakeUpLoop = async () => {
      setIsWakingUp(true); 
      setInteractionStatus("请点击屏幕以继续...");
      const alertUser = async () => {
          if (!userResponseResolver.current) return;
          if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
          await speak("喂！醒醒！... 如果你听到了，请点击屏幕。", 1.3, 1.2);
          if (userResponseResolver.current) {
              wakeUpTimeoutRef.current = setTimeout(alertUser, 15000);
          }
      };
      await alertUser();
  };

  const performInteractiveCheck = async () => {
      binauralEngine.stop();
      setIsInteracting(true);
      setIsWakingUp(false);
      setUserTaps(0);
      
      const randomCount = Math.floor(Math.random() * 3) + 1;
      setTargetTaps(randomCount);
      const script = hypnoticPrompts[Math.floor(Math.random() * hypnoticPrompts.length)];

      setInteractionStatus("保持闭眼，听从引导...");
      await speak(script.intro, rate * 0.9, pitch * 0.95);
      await wait(500);
      setInteractionStatus(`请点击屏幕 ${randomCount} 次...`);
      await speak(script.action(randomCount), rate, pitch);
      
      const interactionPromise = new Promise(resolve => { userResponseResolver.current = resolve; });
      wakeUpTimeoutRef.current = setTimeout(() => { startWakeUpLoop(); }, 15000);

      const result = await interactionPromise;
      if (wakeUpTimeoutRef.current) clearTimeout(wakeUpTimeoutRef.current);

      if (result === 'POSITIVE' && !isWakingUp) {
          await speak(script.benefit, rate * 0.9, pitch * 0.9);
      } else if (result === 'POSITIVE' && isWakingUp) {
          await speak("很好，你回来了。让我们继续。", 1.0, 1.0);
      }

      setIsInteracting(false);
      setIsWakingUp(false);
      setTargetTaps(0);
      binauralEngine.start();
      
      if (result === 'NEGATIVE') return 'REPEAT';
      else return 'NEXT';
  };

  // [重要] iOS 强制解锁音频引擎
  const unlockIOSAudio = () => {
      // 1. 播放一个极短的静音 TTS
      const silentUtterance = new SpeechSynthesisUtterance(" ");
      silentUtterance.volume = 0; // 静音
      silentUtterance.rate = 10;  // 极快
      window.speechSynthesis.speak(silentUtterance);

      // 2. 确保 BinauralEngine 也被 resume
      binauralEngine.start(); 
  };

  const togglePlay = async () => {
    if (session.modules.length === 0) { alert("请先添加模块！"); return; }

    if (isPlaying) {
        stopSignal.current = true;
        window.speechSynthesis.cancel();
        binauralEngine.stop();
        if (wakeUpTimeoutRef.current) clearTimeout(wakeUpTimeoutRef.current);
        setIsPlaying(false);
        setIsInteracting(false);
        setIsWakingUp(false);
        return;
    }

    // [关键点] 在用户点击的一瞬间，强制解锁 iOS 音频限制
    unlockIOSAudio();

    stopSignal.current = false;
    setIsPlaying(true);
    
    try { if (navigator.wakeLock) await navigator.wakeLock.request('screen'); } catch(e){}

    for (let i = 0; i < session.modules.length; i++) {
      if (stopSignal.current) break;
      setCurrentModuleIndex(i);
      const module = session.modules[i];
      setCurrentText(module.title);

      for (let r = 0; r < module.repeatCount; r++) {
        if (stopSignal.current) break;
        const segments = module.content.split(/……|\.\.\.|…/);
        for (const seg of segments) {
            if (stopSignal.current) break;
            if (seg.trim()) await speak(seg);
            await wait(module.ellipsisDelay * 1000);
        }
        await wait(module.delayAfter * 1000);
      }

      if (i < session.modules.length - 1 && interactionMode) {
          const action = await performInteractiveCheck();
          if (action === 'REPEAT') i--;
      }
    }
    
    setIsPlaying(false);
    binauralEngine.stop();
    setCurrentModuleIndex(-1);
    setCurrentText("播放结束");
  };

  useEffect(() => { 
      return () => { 
          stopSignal.current = true; 
          window.speechSynthesis.cancel(); 
          binauralEngine.stop(); 
          if (wakeUpTimeoutRef.current) clearTimeout(wakeUpTimeoutRef.current);
      }; 
  }, []);

  return (
    <div className="flex flex-col h-screen bg-backgroundGray text-textBlack overflow-hidden relative">
      {isInteracting && (
          <InteractionOverlay 
            status={isWakingUp ? "⚠️ 唤醒确认" : interactionStatus} 
            targetTaps={isWakingUp ? 0 : targetTaps} 
            currentTaps={userTaps}
            onTap={handleScreenTap} 
          />
      )}

      <div className="p-4 flex items-center z-10 justify-between">
        <button onClick={onBack}><ChevronLeft size={32} /></button>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
            <span className="text-xs font-bold text-gray-500">互动模式</span>
            <button 
                onClick={() => setInteractionMode(!interactionMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${interactionMode ? 'bg-appleBlue' : 'bg-gray-300'}`}
            >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${interactionMode ? 'left-6' : 'left-1'}`}></div>
            </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-appleBlue text-white' : 'text-textBlack hover:bg-gray-200'}`}><Sliders size={24} /></button>
      </div>

      {showSettings && (
          <div className="absolute top-16 right-4 left-4 z-20 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                  <div>
                      <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                          <span className="flex items-center gap-2"><Volume2 size={16}/> 发音人 (TTS)</span>
                      </div>
                      <select 
                          className="w-full p-3 bg-gray-100 rounded-lg border-none outline-none text-sm font-medium"
                          value={selectedVoiceURI || ""}
                          onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      >
                          <option value="">-- 系统默认 --</option>
                          {availableVoices.map((voice) => (
                              <option key={voice.voiceURI} value={voice.voiceURI}>
                                  {voice.name}
                              </option>
                          ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">切换后将在下一句生效</p>
                  </div>
                  <hr className="border-gray-100"/>
                  <div>
                      <div className="flex justify-between text-sm font-bold text-gray-500 mb-2"><span>语速</span><span className="text-appleBlue">{rate.toFixed(1)}x</span></div>
                      <input type="range" min="0.5" max="2.0" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-appleBlue h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                  </div>
                  <div>
                      <div className="flex justify-between text-sm font-bold text-gray-500 mb-2"><span>音调</span><span className="text-appleBlue">{pitch.toFixed(1)}</span></div>
                      <input type="range" min="0.5" max="1.5" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-appleBlue h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center -mt-10">
        <div className={`w-72 h-72 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-2xl flex items-center justify-center relative p-1 transition-all duration-500 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <div className="absolute inset-0 rounded-full border-[1px] border-white/10 opacity-50"></div>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-appleBlue to-purple-600 flex items-center justify-center shadow-inner">
                <Music className="text-white w-12 h-12 opacity-80" />
            </div>
        </div>
        <div className="mt-12 text-center px-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-3 text-textBlack">{currentText}</h2>
            <div className="inline-block bg-appleBlue/10 px-4 py-1.5 rounded-full"><p className="text-appleBlue font-medium text-sm">{currentModuleIndex >= 0 ? `正在播放: 第 ${currentModuleIndex + 1} / ${session.modules.length} 节` : "准备就绪"}</p></div>
        </div>
      </div>

      <div className="h-40 flex items-center justify-center pb-10">
        <button onClick={togglePlay} className="w-20 h-20 bg-appleBlue rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-blue-600 text-white">
            {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default PlayerScreen;