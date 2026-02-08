class BinauralBeatEngine {
  constructor() {
    this.audioContext = null;
    this.leftOsc = null;
    this.rightOsc = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    // 兼容 iOS Safari 的 AudioContext 写法
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.05; // 5% 音量
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  async start() {
    if (this.isPlaying) return;
    this.init();

    // [关键修改] iOS 强制唤醒 AudioContext
    // iOS Safari 如果处于 suspended 状态，必须在用户点击事件中 resume
    if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
    }

    // 左耳 100Hz
    this.leftOsc = this.audioContext.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.value = 100;
    
    const leftPanner = this.audioContext.createStereoPanner();
    leftPanner.pan.value = -1;

    // 右耳 105Hz (Theta 5Hz)
    this.rightOsc = this.audioContext.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.value = 105;

    const rightPanner = this.audioContext.createStereoPanner();
    rightPanner.pan.value = 1;

    this.leftOsc.connect(leftPanner).connect(this.gainNode);
    this.rightOsc.connect(rightPanner).connect(this.gainNode);

    // iOS 保护：延迟极短时间启动，防止主线程冲突
    this.leftOsc.start();
    this.rightOsc.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    
    try {
      const currTime = this.audioContext.currentTime;
      // 0.1秒淡出，避免噗噗声
      this.gainNode.gain.linearRampToValueAtTime(0, currTime + 0.1);

      setTimeout(() => {
          if(this.leftOsc) { this.leftOsc.stop(); try{this.leftOsc.disconnect()}catch(e){} }
          if(this.rightOsc) { this.rightOsc.stop(); try{this.rightOsc.disconnect()}catch(e){} }
          
          // 重置音量供下次使用
          this.gainNode.gain.value = 0.05; 
          this.isPlaying = false;
      }, 100);
    } catch(e) {
      console.error(e);
      this.isPlaying = false;
    }
  }
}

export const binauralEngine = new BinauralBeatEngine();