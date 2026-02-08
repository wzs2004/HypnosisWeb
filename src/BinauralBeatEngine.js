class BinauralBeatEngine {
  constructor() {
    this.audioContext = null;
    this.leftOsc = null;
    this.rightOsc = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    // 浏览器音频上下文初始化
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.05; // 音量设为 5%，避免刺耳
      this.gainNode.connect(this.audioContext.destination);
    }
    // 解决浏览器自动静音策略
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  start() {
    if (this.isPlaying) return;
    this.init();

    // 左耳声道：100Hz
    this.leftOsc = this.audioContext.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.value = 200;
    
    const leftPanner = this.audioContext.createStereoPanner();
    leftPanner.pan.value = -1; // 完全左声道

    // 右耳声道：105Hz (产生 5Hz Theta 波)
    this.rightOsc = this.audioContext.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.value = 205;

    const rightPanner = this.audioContext.createStereoPanner();
    rightPanner.pan.value = 1; // 完全右声道

    // 连接节点图
    this.leftOsc.connect(leftPanner).connect(this.gainNode);
    this.rightOsc.connect(rightPanner).connect(this.gainNode);

    // 开始播放
    this.leftOsc.start();
    this.rightOsc.start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    
    try {
      // 音量平滑淡出，防止“噗”的一声
      const currTime = this.audioContext.currentTime;
      this.gainNode.gain.linearRampToValueAtTime(0, currTime + 0.1);

      setTimeout(() => {
          if(this.leftOsc) { this.leftOsc.stop(); try{this.leftOsc.disconnect()}catch(e){} }
          if(this.rightOsc) { this.rightOsc.stop(); try{this.rightOsc.disconnect()}catch(e){} }
          this.gainNode.gain.value = 0.05; // 恢复音量以便下次播放
          this.isPlaying = false;
      }, 100);
    } catch(e) {
      console.error("停止音频出错:", e);
      this.isPlaying = false;
    }
  }
}

export const binauralEngine = new BinauralBeatEngine();