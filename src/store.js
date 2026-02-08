import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultSession = {
  id: 'default-1',
  sessionName: '示例：长催眠引导',
  modules: [
    { id: 'm1', title: '导入：呼吸放松', content: '现在……请找一个你觉得最舒服……最能支撑你身体的姿势……慢慢地安顿下来……', stage: 'INDUCTION', repeatCount: 1, ellipsisDelay: 0.5, delayAfter: 5 },
    { id: 'm2', title: '核心：自信增强', content: '你感到一种前所未有的自信……充满了你的全身……你不需要向任何人证明什么……', stage: 'CORE', repeatCount: 2, ellipsisDelay: 0.5, delayAfter: 5 },
    { id: 'm3', title: '唤醒：清醒', content: '现在……数到五……完全醒来……一……二……三……四……五！', stage: 'AWAKENING', repeatCount: 1, ellipsisDelay: 0.5, delayAfter: 0 }
  ]
};

export const useStore = create(
  persist(
    (set) => ({
      sessions: [defaultSession],
      customTemplates: [],
      apiKey: '',
      baseUrl: 'https://api.moonshot.cn/v1',
      selectedVoiceURI: null,
      
      setApiKey: (key) => set({ apiKey: key }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      setSelectedVoiceURI: (uri) => set({ selectedVoiceURI: uri }),
      
      addSession: () => set((state) => ({ 
        sessions: [...state.sessions, { 
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            sessionName: '新催眠方案', 
            modules: [] 
        }] 
      })),
      
      updateSession: (updatedSession) => set((state) => ({
        sessions: state.sessions.map(s => s.id === updatedSession.id ? updatedSession : s)
      })),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),

      addCustomTemplate: (template) => set((state) => ({
        customTemplates: [...state.customTemplates, { ...template, id: `custom-${Date.now()}`, stage: 'PERSONAL' }]
      })),

      deleteCustomTemplate: (id) => set((state) => ({
        customTemplates: state.customTemplates.filter(t => t.id !== id)
      })),

      // [新增] 导入数据（恢复备份）
      importData: (data) => set(() => ({
          sessions: data.sessions || [defaultSession],
          customTemplates: data.customTemplates || [],
          apiKey: data.apiKey || '',
          baseUrl: data.baseUrl || 'https://api.moonshot.cn/v1'
      }))
    }),
    { name: 'hypnosis-storage' }
  )
);