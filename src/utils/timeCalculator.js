// src/utils/timeCalculator.js

export const calculateSessionDuration = (modules) => {
    if (!modules || modules.length === 0) return 0;

    let totalSeconds = 0;

    modules.forEach(module => {
        // 1. 估算朗读时间
        // 假设催眠语速较慢，约每秒 3 个字 (中文)
        const charCount = module.content.length;
        const speakingTime = charCount / 3.0;

        // 2. 估算省略号停顿时间
        // 匹配 ……, ..., …
        const ellipses = module.content.match(/……|\.\.\.|…/g);
        const ellipsisCount = ellipses ? ellipses.length : 0;
        const pauseTime = ellipsisCount * module.ellipsisDelay;

        // 3. 单次播放总时长
        const singleRunTime = speakingTime + pauseTime;

        // 4. 加上重复次数和模块间延迟
        const moduleTotalTime = (singleRunTime * module.repeatCount) + module.delayAfter;

        totalSeconds += moduleTotalTime;
    });

    return Math.ceil(totalSeconds / 60); // 返回分钟数
};