// src/utils/stageColors.js

export const STAGE_STYLES = {
    'INDUCTION': { 
        label: '导入', 
        bg: 'bg-blue-50', 
        border: 'border-blue-500', 
        text: 'text-blue-600', 
        badge: 'bg-blue-100 text-blue-700' 
    },
    'DEEPENING': { 
        label: '加深', 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-500', 
        text: 'text-indigo-600', 
        badge: 'bg-indigo-100 text-indigo-700' 
    },
    'CORE': { 
        label: '核心', 
        bg: 'bg-purple-50', 
        border: 'border-purple-500', 
        text: 'text-purple-600', 
        badge: 'bg-purple-100 text-purple-700' 
    },
    'TERMINATION': { 
        label: '导出', 
        bg: 'bg-pink-50', 
        border: 'border-pink-500', 
        text: 'text-pink-600', 
        badge: 'bg-pink-100 text-pink-700' 
    },
    'AWAKENING': { 
        label: '唤醒', 
        bg: 'bg-orange-50', 
        border: 'border-orange-500', 
        text: 'text-orange-600', 
        badge: 'bg-orange-100 text-orange-700' 
    },
    'PERSONAL': { 
        label: '个人', 
        bg: 'bg-teal-50', 
        border: 'border-teal-500', 
        text: 'text-teal-600', 
        badge: 'bg-teal-100 text-teal-700' 
    },
    'DEFAULT': { 
        label: '模块', 
        bg: 'bg-gray-50', 
        border: 'border-gray-300', 
        text: 'text-gray-600', 
        badge: 'bg-gray-200 text-gray-700' 
    }
};

export const getStageStyle = (stage) => {
    return STAGE_STYLES[stage] || STAGE_STYLES['DEFAULT'];
};