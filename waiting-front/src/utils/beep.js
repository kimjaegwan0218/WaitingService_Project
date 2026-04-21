export async function playBeep({ freq = 880, durationMs = 160, volume = 0.06 } = {}) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    // 자동재생 정책 때문에 일부 브라우저는 사용자 제스처가 필요할 수 있음
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, durationMs);
  } catch {
    // 소리 차단/오류는 그냥 무시 (UX 깨지지 않게)
  }
}
