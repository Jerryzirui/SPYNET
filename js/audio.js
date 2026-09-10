/**
 * 谍网 — 音效（微信 InnerAudio / 浏览器 Audio）
 */

const SOUNDS = ['play', 'click', 'hit', 'block', 'win', 'lose', 'intel'];

function isWx() {
  return typeof wx !== 'undefined' && wx.createInnerAudioContext;
}

function AudioManager() {
  this.enabled = true;
  this.ctx = {};
  this.base = 'assets/audio/';
  this.ready = false;
  this._web = {};
}

AudioManager.prototype.load = function load(base) {
  const self = this;
  if (base) this.base = base;
  if (isWx()) {
    SOUNDS.forEach((name) => {
      const ctx = wx.createInnerAudioContext();
      ctx.src = this.base + name + '.wav';
      ctx.obeyMuteSwitch = false;
      self.ctx[name] = ctx;
    });
    this.ready = true;
    return;
  }
  // browser
  SOUNDS.forEach((name) => {
    try {
      const a = new Audio(this.base + name + '.wav');
      a.preload = 'auto';
      self._web[name] = a;
    } catch (e) { /* ignore */ }
  });
  this.ready = true;
};

AudioManager.prototype.play = function play(name) {
  if (!this.enabled || !name) return;
  if (isWx() && this.ctx[name]) {
    try {
      const c = this.ctx[name];
      c.stop();
      c.play();
    } catch (e) { /* ignore */ }
    return;
  }
  const a = this._web[name];
  if (a) {
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* ignore */ }
  }
};

AudioManager.prototype.setEnabled = function setEnabled(on) {
  this.enabled = !!on;
};

module.exports = { AudioManager, SOUNDS };
