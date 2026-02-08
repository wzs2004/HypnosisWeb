import React from 'react';
import { Fingerprint, Hand } from 'lucide-react';

const InteractionOverlay = ({ status, targetTaps, currentTaps, onTap }) => {
    return (
        // 全屏遮罩，处理点击
        <div 
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 cursor-pointer select-none"
            onClick={onTap}
        >
            <div className="mb-10 pointer-events-none">
                {/* 状态图标 */}
                <div className="w-32 h-32 rounded-full bg-appleBlue/20 flex items-center justify-center animate-pulse mx-auto mb-6">
                    {currentTaps > 0 ? (
                        <span className="text-6xl font-bold text-white">{currentTaps}</span>
                    ) : (
                        // [修改] 默认显示手势/指纹图标，不再是麦克风
                        <Fingerprint className="text-appleBlue w-16 h-16" />
                    )}
                </div>

                {/* 提示文字 */}
                <h3 className="text-white text-2xl font-bold leading-relaxed">
                    {status}
                </h3>
                
                {targetTaps > 0 && (
                    <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/20">
                        <p className="text-gray-300 text-lg mb-2">盲操作指令</p>
                        <p className="text-appleBlue text-3xl font-bold flex items-center justify-center gap-3">
                            <Hand size={28}/> 点击屏幕 {targetTaps} 次
                        </p>
                    </div>
                )}
            </div>
            
            <p className="absolute bottom-10 text-gray-500 text-sm animate-bounce">
                点击屏幕任意位置进行确认
            </p>
        </div>
    );
};

export default InteractionOverlay;