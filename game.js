/**
 * 谍网 SPYNET — 微信小游戏入口
 */

const { createGame, AssetStore } = require('./js/scenes');

function boot() {
  const canvas = wx.createCanvas();
  const info = wx.getSystemInfoSync();
  const pixelRatio = info.pixelRatio || 1;

  // 安全区适配（刘海屏）
  const safe = info.safeArea || {};
  const safeTop = safe.top || 0;

  canvas.width = Math.floor(info.windowWidth * pixelRatio);
  canvas.height = Math.floor(info.windowHeight * pixelRatio);

  const assets = new AssetStore();
  const game = createGame(canvas, canvas.width, canvas.height, assets);

  // 分享（上架闭环）
  if (wx.showShareMenu) {
    wx.showShareMenu({ withShareTicket: true });
  }
  if (wx.onShareAppMessage) {
    wx.onShareAppMessage(() => ({
      title: '谍网 SPYNET — 冷战谍报卡牌对决',
      path: '/game.js',
    }));
  }

  function handleTouch(e) {
    const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    if (!t) return;
    game.onTouchStart(t.clientX * pixelRatio, t.clientY * pixelRatio);
  }

  wx.onTouchEnd(handleTouch);

  // 音频占位：避免审核「无音效」硬伤时可再补资源
  if (wx.setInnerAudioOption) {
    try {
      wx.setInnerAudioOption({ obeyMuteSwitch: false });
    } catch (err) { /* ignore */ }
  }

  game.start();
  assets.load('assets/');
  try {
    if (game.state && game.state.audio) game.state.audio.load('assets/audio/');
  } catch (err) { /* ignore */ }

  // 供调试
  if (typeof GameGlobal !== 'undefined') {
    GameGlobal.__spyNet = game;
  }
}

boot();
