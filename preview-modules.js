/* 自动生成 — tools/build-preview.js */
(function () {
'use strict';
var modules = {};
var cache = {};
function req(id) {
  if (cache[id]) return cache[id].exports;
  var key = modules[id] ? id : null;
  if (!key) {
    var alt = id;
    if (modules[alt + ".js"]) key = alt + ".js";
    else if (alt.endsWith(".js") && modules[alt.slice(0, -3)]) key = alt.slice(0, -3);
  }
  if (!key || !modules[key]) throw new Error("Cannot find module " + id);
  var m = { exports: {} };
  cache[id] = m;
  cache[key] = m;
  modules[key](m, m.exports, req);
  return m.exports;
}
modules["./js/config.js"] = function (module, exports, require) {
/**
 * 谍网 — 设计令牌与全局配置
 */
const DESIGN_W = 750; const DESIGN_H = 1334;
const COLORS = { void: '#0A100E', voidSoft: '#121A16', dossier: '#C8B896', dossierDim: '#8A7B60', paper: '#EDE4CE', ink: '#141814', stamp: '#A63A28', stampBright: '#D4523A', signal: '#D4B06A', signalDim: '#8A7340', olive: '#1E2E26', oliveLight: '#334A3C', haze: '#7A8A80', white: '#F4F0E4', black: '#030605', win: '#6BBF82', lose: '#D4523A', info: '#6A9BB8', teamBlue: '#6A9BB8', teamRed: '#C45C4A' };
const FONTS = { mono: 'Courier New, Consolas, monospace', sans: 'PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif' };
const RULES = { START_COVER: 12, START_HAND: 5, MAX_HAND: 7, DECK_SIZE: 40, START_INTEL: 3, MAX_INTEL: 6, INTEL_COST: { listen: 1, jam: 2, decode: 1 }, JAM_ATTACK_REDUCE: 1, TEAM_COVER: 18, TEAM_START_INTEL: 4, MAX_EXPOSURE: 5, EXPO_ATK: 2, EXPO_TRICK: 1, EXPO_LISTEN_FREE: 3, EXPO_REVEAL: 5, DEEP_COVER_DRAW: 2, DEEP_COVER_ENEMY_DMG_HALF: true };
const MODES = { SOLO: 'solo', PASS: 'pass', TEAM: 'team' };
const AGENTS = [{ id: 'ghost', name: '幽灵', title: '暗影无形', desc: '暴露度影响减半（向上取整）', passive: 'exposure_half', color: '#8A9AA8' },{ id: 'mole', name: '鼹鼠', title: '情报渗透', desc: '每回合自动获得 1 情报点', passive: 'intel_regen', color: '#6A9BB8' },{ id: 'hunter', name: '猎手', title: '猎杀本能', desc: '连击伤害 +2，连守掩护 +2', passive: 'combo_boost', color: '#C45C4A' },{ id: 'weaver', name: '织网者', title: '天罗地网', desc: '暗号匹配时额外抽 1 张', passive: 'watch_draw', color: '#8B6AAF' },{ id: 'chameleon', name: '变色龙', title: '身份伪装', desc: '深潜后下回合首张牌自动匹配暗号', passive: 'deep_match', color: '#5A8A6A' }];
const LOCATIONS = [{ id: 'blackmarket', name: '黑市', desc: '情报行动费用 -1（最低 1）', effect: 'intel_discount', color: '#C4A35A' },{ id: 'listeningpost', name: '监听站', desc: '暴露 ≥ 3 时自动免费监听', effect: 'auto_listen', color: '#6A9BB8' },{ id: 'encrypted', name: '加密频道', desc: '暗号匹配时效果额外 +1', effect: 'watch_boost', color: '#8B6AAF' },{ id: 'safehouse_net', name: '安全屋网络', desc: '每回合结束恢复 1 掩护', effect: 'passive_heal', color: '#3A5244' },{ id: 'jamming', name: '信号干扰区', desc: '首次干扰不消耗情报点', effect: 'free_jam', color: '#A63A28' }];
const MEDALS = [{ id: 'coldblood', name: '冷血', desc: '连续 3 回合打出行牌', reward: '抽 1 张', check: 'streak_atk', threshold: 3 },{ id: 'ironwall', name: '铁壁', desc: '单回合免伤 ≥ 4 点', reward: '+2 情报', check: 'block_roll', threshold: 4 },{ id: 'codemaster', name: '暗号大师', desc: '连续 2 次暗号匹配', reward: '抽 1 张', check: 'streak_watch', threshold: 2 }];
module.exports = { DESIGN_W, DESIGN_H, COLORS, FONTS, RULES, MODES, AGENTS, LOCATIONS, MEDALS };
};
modules["./js/config.js"] = modules["./js/config.js"];
modules["./js/config"] = modules["./js/config.js"];
modules["./config"] = modules["./js/config.js"];
modules["./config.js"] = modules["./js/config.js"];
modules["./js/cards.js"] = function (module, exports, require) {
/**
 * 谍网 — 卡池（自有命名 + 暗号频段）
 */
const CARD_TYPES = { ATK: 'atk', DEF: 'def', TRICK: 'trick', UTIL: 'util' };
const TYPE_LABEL = { atk: '行动', def: '掩护', trick: '诡计', util: '后勤' };
const TYPE_COLOR = { atk: '#A63A28', def: '#3A5244', trick: '#C4A35A', util: '#4A6A8A' };
const BANDS = ['甲', '乙', '丙'];
const BAND_COLORS = { 甲: '#C4A35A', 乙: '#6A9BB8', 丙: '#8B6AAF' };
const CARD_DEFS = {
  deadletter: { id: 'deadletter', name: '死信箱', type: CARD_TYPES.ATK, dmg: 2, band: '甲', copies: 7, short: '造成 2 点 · 暗号+1', text: '投递死信箱。造成 2 点掩护损伤；若匹配值班暗号，伤害 +1。' },
  silence: { id: 'silence', name: '静默清除', type: CARD_TYPES.ATK, dmg: 4, band: '丙', copies: 4, short: '造成 4 点 · 暗号+1', text: '静默清除令。造成 4 点损伤；匹配暗号则 +1。深眠可完全挡下。暴露 +2。' },
  shredder: { id: 'shredder', name: '碎纸机', type: CARD_TYPES.ATK, dmg: 3, onHitDiscard: true, band: '乙', copies: 4, short: '造成 3 点 · 命中碎牌', text: '碎纸机行动：造成 3 点；命中时对方随机碎掉 1 张手牌。匹配暗号 +1。' },
  deepsleep: { id: 'deepsleep', name: '深眠', type: CARD_TYPES.DEF, band: '甲', copies: 5, short: '免疫本回合 · 反弹 1', text: '进入深眠：免疫对方全部行动伤害并反弹 1 点。匹配暗号则再 +1 掩护。' },
  safehouse: { id: 'safehouse', name: '安全屋', type: CARD_TYPES.DEF, heal: 3, band: '丙', copies: 4, short: '恢复 3 点 · 降暴露', text: '退回安全屋：恢复 3 点掩护，并使暴露 -1。匹配暗号则治疗 +1。' },
  bait: { id: 'bait', name: '饵雷', type: CARD_TYPES.TRICK, band: '乙', copies: 4, short: '遇攻击则反弹', text: '饵雷情报：若对方本回合打出行动牌，伤害原样反弹；否则造成 1 点。匹配暗号则反弹/伤害 +1。' },
  flip: { id: 'flip', name: '翻转线人', type: CARD_TYPES.TRICK, band: '丙', copies: 3, short: '夺 1 张 · 造成 1 点', text: '翻转对方线人：随机夺取 1 张手牌并造成 1 点（手牌劣势时 2 点）。匹配暗号 +1。' },
  mirror: { id: 'mirror', name: '镜像人', type: CARD_TYPES.TRICK, band: '甲', copies: 3, short: '复制对方本回合的牌', text: '镜像人：复制对方本回合的牌。双方皆为镜像人则抵消。' },
  otp: { id: 'otp', name: '密码本', type: CARD_TYPES.UTIL, band: '乙', copies: 4, short: '抽 2 张', text: '启用一次性密码本：抽 2 张。匹配暗号则抽 3 张。' },
  vanish: { id: 'vanish', name: '蒸发协议', type: CARD_TYPES.UTIL, band: '丙', copies: 2, short: '弃光抽 5 · +2 掩护 · 清暴露', text: '蒸发协议：弃光手牌抽 5，+2 掩护，暴露清零。' },
};
const LEGACY_MAP = { intel: 'deadletter', assassin: 'silence', cleaner: 'shredder', lurk: 'deepsleep', fake: 'bait', defect: 'flip', double: 'mirror', cipher: 'otp', evac: 'vanish' };
function resolveId(id) { return LEGACY_MAP[id] || id; }
const CARD_LIST = Object.keys(CARD_DEFS).map((k) => CARD_DEFS[k]);
function buildDeck() { const deck = []; let uid = 1; CARD_LIST.forEach((def) => { for (let i = 0; i < def.copies; i += 1) { deck.push({ uid: uid++, id: def.id, name: def.name, type: def.type, dmg: def.dmg || 0, heal: def.heal || 0, onHitDiscard: !!def.onHitDiscard, band: def.band, short: def.short, text: def.text }); } }); return deck; }
function shuffle(arr, rng) { const a = arr.slice(); const random = rng || Math.random; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function getCard(id) { return CARD_DEFS[resolveId(id)]; }
module.exports = { CARD_TYPES, TYPE_LABEL, TYPE_COLOR, BANDS, BAND_COLORS, CARD_DEFS, CARD_LIST, LEGACY_MAP, resolveId, buildDeck, shuffle, getCard };
};
modules["./js/cards.js"] = modules["./js/cards.js"];
modules["./js/cards"] = modules["./js/cards.js"];
modules["./cards"] = modules["./js/cards.js"];
modules["./cards.js"] = modules["./js/cards.js"];
modules["./js/assets.js"] = function (module, exports, require) {
const CARD_IDS = ['deadletter', 'silence', 'shredder', 'deepsleep', 'safehouse', 'bait', 'flip', 'mirror', 'otp', 'vanish'];
const IMG_ALIAS = { deadletter: 'intel', silence: 'assassin', shredder: 'cleaner', deepsleep: 'lurk', safehouse: 'safehouse', bait: 'fake', flip: 'defect', mirror: 'double', otp: 'cipher', vanish: 'evac' };
function isWx() { return typeof wx !== 'undefined' && typeof wx.createImage === 'function'; }
function createImage() { if (isWx()) return wx.createImage(); return new Image(); }
function AssetStore() { this.cards = {}; this.back = null; this.titleBg = null; this.ready = false; this.total = 0; this.loaded = 0; }
AssetStore.prototype.load = function load(basePath) { const self = this; const base = basePath || 'assets/'; const jobs = []; function track(img, src) { self.total += 1; return new Promise((resolve) => { img.onload = function () { self.loaded += 1; resolve(img); }; img.onerror = function () { self.loaded += 1; resolve(null); }; img.src = src; }); } CARD_IDS.forEach((id) => { const img = createImage(); const file = IMG_ALIAS[id] || id; jobs.push(track(img, base + 'cards/' + file + '.jpg').then((im) => { if (im) self.cards[id] = im; })); }); const back = createImage(); jobs.push(track(back, base + 'cards/back.jpg').then((im) => { if (im) self.back = im; })); const bg = createImage(); jobs.push(track(bg, base + 'title-bg.jpg').then((im) => { if (im) self.titleBg = im; })); return Promise.all(jobs).then(() => { self.ready = true; return self; }); };
AssetStore.prototype.progress = function progress() { if (!this.total) return 0; return this.loaded / this.total; };
AssetStore.prototype.getCard = function getCard(id) { return this.cards[id] || null; };
module.exports = { AssetStore, CARD_IDS };
};
modules["./js/assets.js"] = modules["./js/assets.js"];
modules["./js/assets"] = modules["./js/assets.js"];
modules["./assets"] = modules["./js/assets.js"];
modules["./assets.js"] = modules["./js/assets.js"];
modules["./js/storage.js"] = function (module, exports, require) {
const KEY_PRIVACY = 'spynet_privacy_v1'; const KEY_SOUND = 'spynet_sound_v1'; const KEY_VIB = 'spynet_vib_v1';
function hasWxStorage() { return typeof wx !== 'undefined' && wx.getStorageSync; }
function get(key, dflt) { try { if (hasWxStorage()) { const v = wx.getStorageSync(key); return v === '' || v == null ? dflt : v; } const v = localStorage.getItem(key); return v == null ? dflt : JSON.parse(v); } catch (e) { return dflt; } }
function set(key, val) { try { if (hasWxStorage()) { wx.setStorageSync(key, val); return; } localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function hasPrivacy() { return !!get(KEY_PRIVACY, false); } function acceptPrivacy() { set(KEY_PRIVACY, true); }
function getSound() { return get(KEY_SOUND, true); } function setSound(v) { set(KEY_SOUND, !!v); }
function getVibrate() { return get(KEY_VIB, true); } function setVibrate(v) { set(KEY_VIB, !!v); }
module.exports = { hasPrivacy, acceptPrivacy, getSound, setSound, getVibrate, setVibrate };
};
modules["./js/storage.js"] = modules["./js/storage.js"];
modules["./js/storage"] = modules["./js/storage.js"];
modules["./storage"] = modules["./js/storage.js"];
modules["./storage.js"] = modules["./js/storage.js"];
modules["./js/audio.js"] = function (module, exports, require) {
const SOUNDS = ['play', 'click', 'hit', 'block', 'win', 'lose', 'intel'];
function isWx() { return typeof wx !== 'undefined' && wx.createInnerAudioContext; }
function AudioManager() { this.enabled = true; this.ctx = {}; this.base = 'assets/audio/'; this.ready = false; this._web = {}; }
AudioManager.prototype.load = function load(base) { const self = this; if (base) this.base = base; if (isWx()) { SOUNDS.forEach((name) => { const ctx = wx.createInnerAudioContext(); ctx.src = this.base + name + '.wav'; ctx.obeyMuteSwitch = false; self.ctx[name] = ctx; }); this.ready = true; return; } SOUNDS.forEach((name) => { try { const a = new Audio(this.base + name + '.wav'); a.preload = 'auto'; self._web[name] = a; } catch (e) {} }); this.ready = true; };
AudioManager.prototype.play = function play(name) { if (!this.enabled || !name) return; if (isWx() && this.ctx[name]) { try { const c = this.ctx[name]; c.stop(); c.play(); } catch (e) {} return; } const a = this._web[name]; if (a) { try { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} } };
AudioManager.prototype.setEnabled = function setEnabled(on) { this.enabled = !!on; };
module.exports = { AudioManager, SOUNDS };
};
modules["./js/audio.js"] = modules["./js/audio.js"];
modules["./js/audio"] = modules["./js/audio.js"];
modules["./audio"] = modules["./js/audio.js"];
modules["./audio.js"] = modules["./js/audio.js"];
modules["./js/engine.js"] = function (module, exports, require) {
/**
 * 谍网 — 对局引擎
 * 同时翻开 · 暗号频段 · 暴露度 · 深潜 · 情报行动 · 连击/连守
 * 扩展：特工被动 · 地点效果 · 成就追踪
 */
const { RULES, AGENTS, LOCATIONS, MEDALS } = require('./config');
const { buildDeck, shuffle, CARD_TYPES, BANDS } = require('./cards');
function createPlayer(name, isAI) { return { name, isAI, cover: RULES.START_COVER, hand: [], deck: [], discard: [], played: null, intel: RULES.START_INTEL, exposure: 0, jamActive: false, jamIncoming: false, cleanLast: false, lastPlayedId: null, lastPlayedType: null, dealtDamageLast: false, listenUsedThisTurn: false, deepUsedStreak: 0, agentId: null, deepMatchNext: false, medals: { coldblood: { streak: 0, done: false }, codemaster: { streak: 0, done: false }, ironwall: { done: false } } }; }
function makeDeepCover() { return { uid: -999, id: '__deep', name: '深潜', type: CARD_TYPES.UTIL, band: null, deep: true, dmg: 0, heal: 0, short: '清暴露 · 抽 2 · 免疫行动', text: '切断联络进入深潜：暴露清零，抽 2 张，免疫对方行动伤害。' }; }
function drawCards(player, n, log) { for (let i = 0; i < n; i += 1) { if (player.deck.length === 0) { if (player.discard.length === 0) break; player.deck = shuffle(player.discard); player.discard = []; if (log) log.push(player.name + ' 将弃牌堆洗回牌库'); } if (player.hand.length >= RULES.MAX_HAND) break; const c = player.deck.pop(); if (c) player.hand.push(c); } }
function removeCard(hand, card) { const idx = hand.findIndex((c) => c.uid === card.uid); if (idx >= 0) hand.splice(idx, 1); }
function randomFrom(arr, rng) { if (!arr.length) return null; const r = rng || Math.random; return arr[Math.floor(r() * arr.length)]; }
function isAttack(card) { return card && card.type === CARD_TYPES.ATK; }
function countAttackInHand(hand) { return hand.filter((c) => c.type === CARD_TYPES.ATK).length; }
function gainIntel(player, n, log) { const before = player.intel; player.intel = Math.min(RULES.MAX_INTEL, player.intel + n); const gained = player.intel - before; if (gained > 0 && log) log.push(player.name + ' 情报 +' + gained); }
function addExposure(player, n, log) { if (!n) return; const before = player.exposure; player.exposure = Math.max(0, Math.min(RULES.MAX_EXPOSURE, player.exposure + n)); const d = player.exposure - before; if (d > 0) log.push(player.name + ' 暴露 +' + d + '（' + player.exposure + '）'); else if (d < 0) log.push(player.name + ' 暴露 ' + d + '（' + player.exposure + '）'); }
function nextWatchword(prev) { const i = BANDS.indexOf(prev); return BANDS[(i + 1) % BANDS.length]; }
function matchesWatch(card, watch) { return !!(card && card.band && card.band === watch); }
function applyWatchBoost(card, watch, log, who, locationId) { if (!card || card.deep || card.copied) return card; const matched = matchesWatch(card, watch); if (!matched && card.autoMatch) { const ac = Object.assign({}, card, { autoMatch: false }); return applyWatchBoost(ac, watch, log, who, locationId); } if (!matched) return card; let bonus = 1; if (locationId === 'encrypted') bonus += 1; const out = Object.assign({}, card, { watchHit: true }); if (out.dmg) { out.dmg += bonus; log.push(who + ' 暗号命中，【' + card.name + '】伤害 +' + bonus); } else if (out.heal) { out.heal += bonus; log.push(who + ' 暗号命中，【' + card.name + '】治疗 +' + bonus); } else if (out.id === 'otp') { out.watchDraw = true; log.push(who + ' 暗号命中，密码本多抽 1 张'); if (locationId === 'encrypted') out.watchDrawExtra = true; } else log.push(who + ' 暗号命中：【' + card.name + '】'); return out; }
function useIntelAction(state, side, kind) { if (state.phase !== 'select') return { ok: false, msg: '当前无法使用情报' }; const me = side === 'player' ? state.player : state.enemy; const opp = side === 'player' ? state.enemy : state.player; let cost = RULES.INTEL_COST[kind]; if (cost == null) return { ok: false, msg: '未知行动' }; if (state.locationId === 'blackmarket') { const d = cost - 1; cost = Math.max(1, d); } if (state.locationId === 'jamming' && kind === 'jam' && !me.jamActive && !me.jamFreeUsed) { cost = 0; me.jamFreeUsed = true; } if (me.intel < cost) return { ok: false, msg: '情报点不足' }; if (kind === 'listen' && me.listenUsedThisTurn) return { ok: false, msg: '本回合已监听过' }; if (kind === 'jam' && me.jamActive) return { ok: false, msg: '干扰已生效' }; me.intel -= cost; if (kind === 'listen') { me.listenUsedThisTurn = true; const n = countAttackInHand(opp.hand); return { ok: true, msg: '监听：对方约 ' + n + ' 张行动牌', listenResult: n }; } if (kind === 'jam') { me.jamActive = true; opp.jamIncoming = true; return { ok: true, msg: '干扰就绪：对方本回合行动伤害 -1' }; } if (kind === 'decode') { drawCards(me, 1); return { ok: true, msg: '破译完成：抽 1 张' }; } return { ok: false, msg: '失败' }; }
function playDeepCover(state, side) { if (state.phase !== 'select') return false; const me = side === 'player' ? state.player : state.enemy; if (me.played) return false; me.played = makeDeepCover(); return true; }
function resolveRound(state, rng) {
 const log = []; const p = state.player; const e = state.enemy; const pCard = p.played; const eCard = e.played; const watch = state.watchword; const locId = state.locationId;
 if (!pCard || !eCard) return { events: ['双方需各就位'], gameOver: false }; if (locId === 'listeningpost') { if (p.exposure >= 3 && !p.listenUsedThisTurn) { p.listenUsedThisTurn = true; const n = countAttackInHand(e.hand); log.push('监听站：我方暴露 ≥3，自动获取情报（对方 ' + n + ' 张行动牌）'); state.listenHint = n; } if (e.exposure >= 3 && !e.listenUsedThisTurn) e.listenUsedThisTurn = true; }
 const pDeep = !!pCard.deep; const eDeep = !!eCard.deep; if (pDeep) log.push('我方进入【深潜】'); else log.push('我方打出【' + pCard.name + '】'); if (eDeep) log.push('敌方进入【深潜】'); else log.push('敌方打出【' + eCard.name + '】'); log.push('值班暗号：「' + watch + '」');
 if (pDeep && p.exposure > 0) { p.exposure = 0; log.push('我方暴露清零'); } if (eDeep && e.exposure > 0) { e.exposure = 0; log.push('敌方暴露清零'); } if (pDeep && p.agentId === 'chameleon') p.deepMatchNext = true; if (eDeep && e.agentId === 'chameleon') e.deepMatchNext = true;
 let pEff = pCard; let eEff = eCard; const pIsMirror = !pDeep && pCard.id === 'mirror'; const eIsMirror = !eDeep && eCard.id === 'mirror';
 if (pIsMirror && eIsMirror) { log.push('镜像人相互抵消'); pEff = null; eEff = null; } else if (pIsMirror && !eDeep) { pEff = Object.assign({}, eCard, { name: '镜像·' + eCard.name, copied: true, band: eCard.band }); log.push('我方镜像人复制了【' + eCard.name + '】'); } else if (eIsMirror && !pDeep) { eEff = Object.assign({}, pCard, { name: '镜像·' + pCard.name, copied: true, band: pCard.band }); log.push('敌方镜像人复制了【' + pCard.name + '】'); }
 if (p.deepMatchNext && !pDeep && pEff && !pEff.copied) { pEff = Object.assign({}, pEff, { autoMatch: true }); p.deepMatchNext = false; log.push('变色龙被动：本牌自动匹配暗号'); } if (e.deepMatchNext && !eDeep && eEff && !eEff.copied) { eEff = Object.assign({}, eEff, { autoMatch: true }); e.deepMatchNext = false; }
 if (!pDeep && pEff) pEff = applyWatchBoost(pEff, watch, log, '我方', locId); if (!eDeep && eEff) eEff = applyWatchBoost(eEff, watch, log, '敌方', locId);
 const pBlocked = pEff && pEff.id === 'deepsleep'; const eBlocked = eEff && eEff.id === 'deepsleep';
 if (pEff && pEff.watchHit && !pDeep) p.medals.codemaster.streak += 1; else p.medals.codemaster.streak = 0;
 if (eEff && eEff.watchHit && !eDeep) e.medals.codemaster.streak += 1; else e.medals.codemaster.streak = 0;
 if (pEff && pEff.id === 'silence' && e.lastPlayedType === CARD_TYPES.ATK) { pEff = Object.assign({}, pEff, { dmg: (pEff.dmg || 0) + 1 }); log.push('静默清除针对对方上回合行动，伤害 +1'); } if (eEff && eEff.id === 'silence' && p.lastPlayedType === CARD_TYPES.ATK) { eEff = Object.assign({}, eEff, { dmg: (eEff.dmg || 0) + 1 }); log.push('敌方静默清除针对我方上回合行动，伤害 +1'); }
 const hc = (w) => w.agentId === 'hunter' ? 1 : 0; if (pEff && pEff.type === CARD_TYPES.ATK && p.dealtDamageLast && !pDeep) { const x = 1 + hc(p); pEff = Object.assign({}, pEff, { dmg: (pEff.dmg || 0) + x }); log.push('我方连击，行动伤害 +' + x); } if (eEff && eEff.type === CARD_TYPES.ATK && e.dealtDamageLast && !eDeep) { const x = 1 + hc(e); eEff = Object.assign({}, eEff, { dmg: (eEff.dmg || 0) + x }); log.push('敌方连击，行动伤害 +' + x); }
 const pGB = p.cleanLast && !pDeep; const eGB = e.cleanLast && !eDeep; const pJ = !!p.jamIncoming; const eJ = !!e.jamIncoming; const pIm = pDeep; const eIm = eDeep; const pB = pEff && pEff.id === 'bait'; const eB = eEff && eEff.id === 'bait'; let pR = 0; let eR = 0;
 if (pB && !pDeep) { if (isAttack(eEff) && !eDeep) { let d = eEff.dmg || 0; if (eJ) d = Math.max(0, d - RULES.JAM_ATTACK_REDUCE); eR += d; log.push('我方饵雷生效，反弹 ' + d + ' 点'); } else { eR += 1; log.push('我方饵雷落空，仍造成 1 点'); } }
 if (eB && !eDeep) { if (isAttack(pEff) && !pDeep) { let d = pEff.dmg || 0; if (pJ) d = Math.max(0, d - RULES.JAM_ATTACK_REDUCE); pR += d; log.push('敌方饵雷生效，反弹 ' + d + ' 点'); } else { pR += 1; log.push('敌方饵雷落空，仍造成 1 点'); } }
 if (pEff && pEff.id === 'flip' && !pDeep) { let d = 1; if (p.hand.length < e.hand.length) { d = 2; log.push('我方手牌劣势，翻转伤害 2'); } eR += d; const s = randomFrom(e.hand, rng); if (s) { removeCard(e.hand, s); p.hand.push(s); log.push('我方翻转线人，夺得【' + s.name + '】并造成 ' + d + ' 点'); } else log.push('我方翻转扑空，仍造成 ' + d + ' 点'); }
 if (eEff && eEff.id === 'flip' && !eDeep) { let d = 1; if (e.hand.length < p.hand.length) d = 2; pR += d; const s = randomFrom(p.hand, rng); if (s) { removeCard(p.hand, s); e.hand.push(s); log.push('敌方翻转线人，夺得【' + s.name + '】并造成 ' + d + ' 点'); } else log.push('敌方翻转扑空，仍造成 ' + d + ' 点'); }
 let pD = 0; let eD = 0; if (isAttack(pEff) && !pB && !eB && !pDeep) { if (eBlocked || eIm) log.push(eIm ? '敌方深潜，我方行动落空' : '我方【' + pEff.name + '】被深眠挡下'); else { pD = pEff.dmg || 0; if (pJ) { pD = Math.max(0, pD - RULES.JAM_ATTACK_REDUCE); log.push('干扰生效，我方伤害 -' + RULES.JAM_ATTACK_REDUCE); } if (pD > 0) log.push('我方【' + pEff.name + '】命中，' + pD + ' 点'); } }
 if (isAttack(eEff) && !eB && !pB && !eDeep) { if (pBlocked || pIm) log.push(pIm ? '我方深潜，敌方行动落空' : '敌方【' + eEff.name + '】被深眠挡下'); else { eD = eEff.dmg || 0; if (eJ) { eD = Math.max(0, eD - RULES.JAM_ATTACK_REDUCE); log.push('干扰生效，敌方伤害 -' + RULES.JAM_ATTACK_REDUCE); } if (eD > 0) log.push('敌方【' + eEff.name + '】命中，' + eD + ' 点'); } }
 if (pBlocked) { eR += 1; log.push('我方深眠反弹 1 点'); } if (eBlocked) { pR += 1; log.push('敌方深眠反弹 1 点'); }
 if (isAttack(pEff) && pD > 0 && pEff.onHitDiscard && e.hand.length > 0) { const dr = randomFrom(e.hand, rng); if (dr) { removeCard(e.hand, dr); e.discard.push(dr); log.push('碎纸机粉碎敌方【' + dr.name + '】'); } }
 if (isAttack(eEff) && eD > 0 && eEff.onHitDiscard && p.hand.length > 0) { const dr = randomFrom(p.hand, rng); if (dr) { removeCard(p.hand, dr); p.discard.push(dr); log.push('碎纸机粉碎我方【' + dr.name + '】'); } }
 if (pEff && pEff.id === 'otp' && !pDeep) { const n = (pGB ? 3 : 2) + (pEff.watchDraw ? 1 : 0) + (pEff.watchDrawExtra ? 1 : 0); drawCards(p, n, log); log.push('我方启用密码本，抽 ' + n + ' 张'); }
 if (eEff && eEff.id === 'otp' && !eDeep) { const n = (eGB ? 3 : 2) + (eEff.watchDraw ? 1 : 0) + (eEff.watchDrawExtra ? 1 : 0); drawCards(e, n, log); log.push('敌方启用密码本，抽 ' + n + ' 张'); }
 if (pEff && pEff.id === 'vanish' && !pDeep) { const n = p.hand.length; p.discard = p.discard.concat(p.hand); p.hand = []; drawCards(p, 5, log); p.cover = Math.min(RULES.START_COVER + 6, p.cover + 2); p.exposure = 0; log.push('我方蒸发协议（弃 ' + n + ' 抽 5，+2 掩护，暴露清零）'); }
 if (eEff && eEff.id === 'vanish' && !eDeep) { const n = e.hand.length; e.discard = e.discard.concat(e.hand); e.hand = []; drawCards(e, 5, log); e.cover = Math.min(RULES.START_COVER + 6, e.cover + 2); e.exposure = 0; log.push('敌方蒸发协议'); }
 if (pEff && pEff.heal && !pDeep) { let h2 = pEff.heal; if (pGB && (pEff.id === 'safehouse' || pEff.id === 'deepsleep')) { const x = p.agentId === 'hunter' ? 2 : 1; h2 += x; } p.cover = Math.min(RULES.START_COVER + 6, p.cover + h2); log.push('我方恢复 ' + h2 + ' 点掩护'); if (pEff.id === 'safehouse') addExposure(p, -1, log); }
 if (eEff && eEff.heal && !eDeep) { let h2 = eEff.heal; if (eGB && (eEff.id === 'safehouse' || eEff.id === 'deepsleep')) { const x = e.agentId === 'hunter' ? 2 : 1; h2 += x; } e.cover = Math.min(RULES.START_COVER + 6, e.cover + h2); log.push('敌方恢复 ' + h2 + ' 点掩护'); if (eEff.id === 'safehouse') addExposure(e, -1, log); }
 if (pBlocked && pGB) { const x = p.agentId === 'hunter' ? 2 : 1; p.cover = Math.min(RULES.START_COVER + 6, p.cover + x); log.push('我方连守，额外 +' + x + ' 掩护'); }
 if (eBlocked && eGB) { const x = e.agentId === 'hunter' ? 2 : 1; e.cover = Math.min(RULES.START_COVER + 6, e.cover + x); log.push('敌方连守，额外 +' + x + ' 掩护'); }
 if (pDeep) { drawCards(p, RULES.DEEP_COVER_DRAW, log); log.push('我方深潜，抽 ' + RULES.DEEP_COVER_DRAW + ' 张'); } if (eDeep) { drawCards(e, RULES.DEEP_COVER_DRAW, log); log.push('敌方深潜，抽 ' + RULES.DEEP_COVER_DRAW + ' 张'); }
 let pT = 0; let eT = 0; if (pBlocked || pIm) pT = pR; else pT = eD + pR; if (eBlocked || eIm) eT = eR; else eT = pD + eR;
 const pS = (pD + pR) - pT; if (pS >= 4 && !p.medals.ironwall.done) { p.medals.ironwall.done = true; log.push('🏅 成就「铁壁」达成：单回合免伤 ≥4，+2 情报'); gainIntel(p, 2, log); }
 const eS = (eD + eR) - eT; if (eS >= 4 && !e.medals.ironwall.done) { e.medals.ironwall.done = true; gainIntel(e, 2); }
 p.cover -= pT; e.cover -= eT; if (pT) log.push('我方掩护 -' + pT); if (eT) log.push('敌方掩护 -' + eT);
 function ef(card, deep) { if (deep) return 0; if (!card) return 0; if (card.copied) return 1; if (card.type === CARD_TYPES.ATK) return RULES.EXPO_ATK; if (card.type === CARD_TYPES.TRICK) return RULES.EXPO_TRICK; if (card.id === 'safehouse') return -1; return 0; }
 addExposure(p, ef(pCard, pDeep), log); addExposure(e, ef(eCard, eDeep), log);
 if (p.agentId === 'ghost' && p.exposure > 0) p.exposure = Math.ceil(p.exposure / 2); if (e.agentId === 'ghost' && e.exposure > 0) e.exposure = Math.ceil(e.exposure / 2);
 p.dealtDamageLast = eT > 0; e.dealtDamageLast = pT > 0; p.cleanLast = pT === 0; e.cleanLast = eT === 0; if (eT > 0) gainIntel(p, 1, log); if (pT > 0) gainIntel(e, 1, log);
 if (p.agentId === 'weaver' && pEff && pEff.watchHit && !pDeep) { drawCards(p, 1, log); log.push('织网者：暗号匹配，额外抽 1 张'); } if (e.agentId === 'weaver' && eEff && eEff.watchHit && !eDeep) drawCards(e, 1);
 if (p.agentId === 'mole') { gainIntel(p, 1, log); log.push('鼹鼠：情报 +1（被动）'); } if (e.agentId === 'mole') gainIntel(e, 1);
 if (pEff && pEff.type === CARD_TYPES.ATK && !pDeep) { p.medals.coldblood.streak += 1; if (p.medals.coldblood.streak >= 3 && !p.medals.coldblood.done) { p.medals.coldblood.done = true; drawCards(p, 1, log); log.push('🏅 成就「冷血」达成：连续 3 回合行动，抽 1 张'); } } else if (!pDeep) p.medals.coldblood.streak = 0;
 if (eEff && eEff.type === CARD_TYPES.ATK && !eDeep) { e.medals.coldblood.streak += 1; if (e.medals.coldblood.streak >= 3 && !e.medals.coldblood.done) { e.medals.coldblood.done = true; drawCards(e, 1); } } else if (!eDeep) e.medals.coldblood.streak = 0;
 if (p.medals.codemaster.streak >= 2 && !p.medals.codemaster.done) { p.medals.codemaster.done = true; drawCards(p, 1, log); log.push('🏅 成就「暗号大师」达成：连续 2 次暗号匹配，抽 1 张'); }
 if (e.medals.codemaster.streak >= 2 && !e.medals.codemaster.done) { e.medals.codemaster.done = true; drawCards(e, 1); }
 p.lastPlayedId = pCard.id; p.lastPlayedType = pDeep ? null : pCard.type; e.lastPlayedId = eCard.id; e.lastPlayedType = eDeep ? null : eCard.type;
 p.jamActive = false; e.jamActive = false; p.jamIncoming = false; e.jamIncoming = false; p.listenUsedThisTurn = false; e.listenUsedThisTurn = false;
 if (state.locationId === 'jamming') { p.jamFreeUsed = false; e.jamFreeUsed = false; }
 if (!pDeep) p.discard.push(pCard); if (!eDeep) e.discard.push(eCard); p.played = null; e.played = null; drawCards(p, 1, log); drawCards(e, 1, log);
 if (locId === 'safehouse_net') { if (p.cover > 0 && p.cover < RULES.START_COVER + 6) { p.cover = Math.min(RULES.START_COVER + 6, p.cover + 1); log.push('安全屋网络：回合结束恢复 1 掩护'); } if (e.cover > 0 && e.cover < RULES.START_COVER + 6) e.cover = Math.min(RULES.START_COVER + 6, e.cover + 1); }
 state.watchword = nextWatchword(watch); state.prevWatchword = watch;
 const gO = p.cover <= 0 || e.cover <= 0; let w = null; if (gO) { if (p.cover <= 0 && e.cover <= 0) w = 'draw'; else if (e.cover <= 0) w = 'player'; else w = 'enemy'; }
 return { events: log, playerCard: pCard, enemyCard: eCard, playerDamage: pT, enemyDamage: eT, watchwordUsed: watch, gameOver: gO, winner: w };
}
function resolveTeamRound(state, rng) {
  const log = []; const you = state.you; const mate = state.partner; const e1 = state.enemy1; const e2 = state.enemy2;
  if (!you.played || !mate.played || !e1.played || !e2.played) return { events: ['小队需全部就位'], gameOver: false };
  const watch = state.watchword; log.push('值班暗号：「' + watch + '」'); log.push('我方【' + you.played.name + '】+【' + mate.played.name + '】 VS 敌方【' + e1.played.name + '】+【' + e2.played.name + '】');
  let atkA = 0, defA = 0, atkB = 0, defB = 0;
  function ss(list, isA) { list.forEach(function(p) { let card = p.played; if (card && card.band && card.band === watch) { card = Object.assign({}, card, { dmg: (card.dmg || 0) + (card.dmg ? 1 : 0), heal: (card.heal || 0) + (card.heal ? 1 : 0) }); if (isA) log.push(p.name + ' 暗号命中'); } if (card.deep) return; if (card.type === CARD_TYPES.ATK) { if (isA) atkA += card.dmg || 0; else atkB += card.dmg || 0; } if (card.id === 'deepsleep') { if (isA) defA += 4; else defB += 4; } if (card.id === 'safehouse') { if (isA) state.teamACover = Math.min(RULES.TEAM_COVER + 8, state.teamACover + 2); else state.teamBCover = Math.min(RULES.TEAM_COVER + 8, state.teamBCover + 2); } if (card.id === 'bait' || card.id === 'flip') { if (isA) atkA += 1; else atkB += 1; } if (card.id === 'otp') drawCards(p, 2, log); }); }
  ss([you, mate], true); ss([e1, e2], false);
  if (you.played.type === CARD_TYPES.ATK && mate.played.type === CARD_TYPES.ATK) { atkA += 1; log.push('小队协同 +1'); } if (e1.played.type === CARD_TYPES.ATK && e2.played.type === CARD_TYPES.ATK) atkB += 1;
  const netA = Math.max(0, atkA - defB); const netB = Math.max(0, atkB - defA);
  state.teamACover -= netB; state.teamBCover -= netA; if (netA) log.push('敌方队伍掩护 -' + netA); if (netB) log.push('我方队伍掩护 -' + netB);
  you.cover = state.teamACover; mate.cover = state.teamACover; e1.cover = state.teamBCover; e2.cover = state.teamBCover;
  [you, mate, e1, e2].forEach(function(p) { p.lastPlayedId = p.played.id; p.lastPlayedType = p.played.type; p.cleanLast = (p === you || p === mate) ? netB === 0 : netA === 0; if (!p.played.deep) p.discard.push(p.played); p.played = null; drawCards(p, 1, log); });
  state.watchword = nextWatchword(watch); const gO = state.teamACover <= 0 || state.teamBCover <= 0; let w = null; if (gO) { if (state.teamACover <= 0 && state.teamBCover <= 0) w = 'draw'; else if (state.teamBCover <= 0) w = 'player'; else w = 'enemy'; }
  return { events: log, playerCard: you.played, enemyCard: e1.played, playerDamage: netB, enemyDamage: netA, gameOver: gO, winner: w };
}
function pickRandomLocation() { return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].id; }
function getLocationById(id) { return LOCATIONS.find(function(l) { return l.id === id; }) || LOCATIONS[0]; }
function newGame(opts) {
  const mode = (opts && opts.mode) || 'solo'; const agentId = (opts && opts.agentId) || null;
  const deck = shuffle(buildDeck(), opts && opts.rng); const watch = BANDS[Math.floor(Math.random() * BANDS.length)];
  const locId = (opts && opts.locationId) || pickRandomLocation();
  if (mode === 'team') {
    const you = createPlayer('你', false); const partner = createPlayer('搭档', true); const e1 = createPlayer('敌一', true); const e2 = createPlayer('敌二', true);
    you.deck = deck.slice(0, 12); partner.deck = deck.slice(12, 20); e1.deck = deck.slice(20, 32); e2.deck = deck.slice(32, 40);
    drawCards(you, 5); drawCards(partner, 4); drawCards(e1, 4); drawCards(e2, 4);
    you.cover = RULES.TEAM_COVER; partner.cover = RULES.TEAM_COVER; e1.cover = RULES.TEAM_COVER; e2.cover = RULES.TEAM_COVER; you.intel = RULES.TEAM_START_INTEL;
    return { mode, locationId: locId, watchword: watch, turn: 1, phase: 'select', lastResult: null, history: [], listenHint: null, teamACover: RULES.TEAM_COVER, teamBCover: RULES.TEAM_COVER, you, partner, enemy1: e1, enemy2: e2, player: you, enemy: e1 };
  }
  const player = createPlayer('特工', false); const enemy = createPlayer(mode === 'pass' ? '对手' : '对面', mode !== 'pass');
  player.agentId = agentId; const aiAgents = AGENTS.filter(function(a) { return a.id !== agentId; }); enemy.agentId = randomFrom(aiAgents, opts && opts.rng).id;
  player.deck = deck.slice(0, 20); enemy.deck = deck.slice(20, 40); drawCards(player, RULES.START_HAND); drawCards(enemy, RULES.START_HAND);
  return { mode, locationId: locId, agentId: agentId, watchword: watch, player, enemy, turn: 1, phase: 'select', lastResult: null, history: [], listenHint: null, passSeat: 0, hideHands: false };
}
function passTurn(state) { if (!state || state.mode !== 'pass') return false; state.passSeat = state.passSeat === 0 ? 1 : 0; state.hideHands = true; return true; }
function currentPassPlayer(state) { if (!state || state.mode !== 'pass') return state.player; return state.passSeat === 0 ? state.player : state.enemy; }
function playerPlay(state, cardUid) { if (state.phase !== 'select') return false; if (cardUid === -999) return playDeepCover(state, 'player'); const idx = state.player.hand.findIndex(function(c) { return c.uid === cardUid; }); if (idx < 0) return false; const card = state.player.hand.splice(idx, 1)[0]; state.player.played = card; return true; }
function undoPlay(state) { if (state.phase !== 'select') return false; if (!state.player.played) return false; if (state.player.played.deep) { state.player.played = null; return true; } state.player.hand.push(state.player.played); state.player.played = null; return true; }
module.exports = { newGame, playerPlay, undoPlay, resolveRound, resolveTeamRound, drawCards, useIntelAction, playDeepCover, countAttackInHand, passTurn, currentPassPlayer, makeDeepCover, matchesWatch, pickRandomLocation, getLocationById };
};
modules["./js/engine.js"] = modules["./js/engine.js"];
modules["./js/engine"] = modules["./js/engine.js"];
modules["./engine"] = modules["./js/engine.js"];
modules["./engine.js"] = modules["./js/engine.js"];
modules["./js/ai.js"] = function (module, exports, require) {
const { CARD_TYPES, resolveId } = require('./cards');
function scoreCard(card, me, opp, watch, locationId) {
  let score = Math.random() * 1.1; const lowSelf = me.cover <= 4; const midSelf = me.cover <= 8; const lowOpp = opp.cover <= 4; const midOpp = opp.cover <= 8;
  const fewCards = me.hand.length <= 2; const momentumAtk = !!me.dealtDamageLast; const momentumDef = !!me.cleanLast; const oppLastAtk = opp.lastPlayedType === CARD_TYPES.ATK; const highExpo = (me.exposure || 0) >= 3; const id = resolveId(card.id);
  if (watch && card.band === watch) score += 1.4;
  if (me.agentId === 'hunter' && card.type === CARD_TYPES.ATK) score += 0.8; if (me.agentId === 'hunter' && card.type === CARD_TYPES.DEF) score -= 0.4;
  if (locationId === 'encrypted' && card.band === watch) score += 0.6;
  switch (id) {
    case 'silence': score += 3.0; if (lowOpp) score += 3.2; if (midOpp) score += 1.0; if (lowSelf) score -= 1.8; if (highExpo) score -= 1.2; if (oppLastAtk) score += 1.4; if (momentumAtk) score += 1.1; if (me.agentId === 'hunter' && momentumAtk) score += 1.0; break;
    case 'shredder': score += 2.2; if (opp.hand.length >= 4) score += 1.0; if (lowOpp) score += 1.4; if (momentumAtk) score += 0.7; if (highExpo) score -= 0.5; break;
    case 'deadletter': score += 1.9; if (midOpp) score += 0.7; if (momentumAtk) score += 0.5; if (highExpo && card.band !== watch) score -= 0.4; break;
    case 'deepsleep': score += 1.5; if (lowSelf) score += 3.6; if (midSelf) score += 1.4; if (momentumDef) score += 1.3; if (momentumAtk) score -= 0.4; if (locationId === 'safehouse_net' && !lowSelf) score -= 0.6; break;
    case 'safehouse': score += 1.1; if (lowSelf) score += 3.0; if (midSelf) score += 1.3; if (me.cover >= 11) score -= 1.1; if (highExpo) score += 1.5; if (momentumDef) score += 0.9; break;
    case 'bait': score += 1.7; if (midSelf || lowSelf) score += 1.1; if (oppLastAtk) score += 0.9; if (opp.agentId === 'hunter') score += 0.7; break;
    case 'flip': score += 1.4; if (opp.hand.length >= 4) score += 1.5; if (fewCards) score += 0.8; break;
    case 'mirror': score += 0.9; if (opp.hand.length >= 5) score += 1.2; break;
    case 'otp': score += 1.3; if (fewCards) score += 2.4; if (me.hand.length <= 4) score += 0.7; if (momentumDef) score += 0.9; if (me.agentId === 'weaver' && card.band === watch) score += 1.0; break;
    case 'vanish': score += 0.3; if (fewCards && (lowSelf || highExpo)) score += 3.2; if (me.hand.length <= 3) score += 0.8; break;
  }
  return score;
}
function shouldDeepCover(me, opp, locationId) {
  if (me.agentId === 'chameleon') { if ((me.exposure || 0) >= 3) return Math.random() < 0.75; if (me.hand.length <= 1) return Math.random() < 0.6; }
  if ((me.exposure || 0) >= 4) return Math.random() < 0.7; if ((me.exposure || 0) >= 3 && me.cover <= 6) return Math.random() < 0.45; if (me.hand.length === 0) return true;
  if (locationId === 'listeningpost' && (me.exposure || 0) >= 3 && me.cover > 6) return Math.random() < 0.2; return false;
}
function chooseCard(hand, me, opp, watch, locationId) {
  if (!hand.length) return null; let best = hand[0]; let bestScore = -Infinity;
  hand.forEach(function(card) { var s = scoreCard(card, me, opp, watch, locationId); if (s > bestScore) { bestScore = s; best = card; } }); return best;
}
module.exports = { chooseCard, scoreCard, shouldDeepCover };
};
modules["./js/ai.js"] = modules["./js/ai.js"];
modules["./js/ai"] = modules["./js/ai.js"];
modules["./ai"] = modules["./js/ai.js"];
modules["./ai.js"] = modules["./js/ai.js"];
modules["./js/ui.js"] = function (module, exports, require) {
const { COLORS, FONTS } = require('./config');
function lerp(a, b, t) { return a + (b - a) * t; } function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function Toast() { this.items = []; }
Toast.prototype.push = function push(text, kind) { this.items.push({ text: String(text), kind: kind || 'info', t: 0, life: 2.2 }); if (this.items.length > 4) this.items.shift(); };
Toast.prototype.update = function update(dt) { this.items.forEach((it) => { it.t += dt; }); this.items = this.items.filter((it) => it.t < it.life); };
Toast.prototype.draw = function draw(R, x, y) { this.items.forEach((it, i) => { const a = it.t < 0.15 ? it.t / 0.15 : it.t > it.life - 0.35 ? (it.life - it.t) / 0.35 : 1; const rise = easeOutCubic(Math.min(1, it.t / 0.35)) * 12; const color = it.kind === 'bad' ? COLORS.stampBright : it.kind === 'good' ? COLORS.win : COLORS.signal; R.ctx.save(); R.ctx.globalAlpha = Math.max(0, a); R.ctx.fillStyle = 'rgba(3,6,5,0.82)'; const w = Math.min(420, 40 + it.text.length * 16); R.roundRect(x - w / 2, y + i * 40 - rise, w, 34, 4); R.ctx.fill(); R.ctx.strokeStyle = color; R.ctx.lineWidth = 1; R.ctx.stroke(); R.text(it.text, x, y + 17 + i * 40 - rise, { size: 18, color, align: 'center', baseline: 'middle', family: FONTS.sans }); R.ctx.restore(); }); };
function drawButton(R, rect, label, opts) { const o = opts || {}; const ctx = R.ctx; const disabled = !!o.disabled; const primary = !!o.primary; ctx.save(); if (disabled) ctx.globalAlpha = 0.35; let bg = COLORS.olive; let border = COLORS.oliveLight; if (primary) { bg = COLORS.stamp; border = COLORS.stampBright; } ctx.fillStyle = bg; R.roundRect(rect.x, rect.y, rect.w, rect.h, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; R.roundRect(rect.x, rect.y, rect.w, rect.h * 0.45, 6); ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = 2; R.roundRect(rect.x, rect.y, rect.w, rect.h, 6); ctx.stroke(); R.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2, { size: o.size || 26, color: disabled ? COLORS.haze : COLORS.white, align: 'center', baseline: 'middle', weight: '700', family: FONTS.sans }); ctx.restore(); }
function drawPanel(R, x, y, w, h, title) { const ctx = R.ctx; ctx.save(); ctx.fillStyle = 'rgba(10,16,14,0.92)'; R.roundRect(x, y, w, h, 10); ctx.fill(); ctx.strokeStyle = COLORS.oliveLight; ctx.lineWidth = 2; ctx.stroke(); if (title) { R.text(title, x + w / 2, y + 36, { size: 28, color: COLORS.paper, align: 'center', weight: '700' }); ctx.strokeStyle = COLORS.signalDim; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(x + 28, y + 64); ctx.lineTo(x + w - 28, y + 64); ctx.stroke(); } ctx.restore(); }
function drawChip(R, x, y, label, color) { const ctx = R.ctx; const w = 18 + label.length * 14; ctx.save(); ctx.fillStyle = 'rgba(3,6,5,0.75)'; R.roundRect(x, y, w, 28, 14); ctx.fill(); ctx.strokeStyle = color || COLORS.signalDim; ctx.lineWidth = 1; ctx.stroke(); R.text(label, x + w / 2, y + 14, { size: 14, color: color || COLORS.signal, align: 'center', baseline: 'middle', family: FONTS.mono }); ctx.restore(); return w; }
module.exports = { Toast, drawButton, drawPanel, drawChip, lerp, easeOutCubic };
};
modules["./js/ui.js"] = modules["./js/ui.js"];
modules["./js/ui"] = modules["./js/ui.js"];
modules["./ui"] = modules["./js/ui.js"];
modules["./ui.js"] = modules["./js/ui.js"];
modules["./js/renderer.js"] = function (module, exports, require) {
const { COLORS, FONTS, DESIGN_W, DESIGN_H, RULES } = require('./config');
const { TYPE_COLOR, TYPE_LABEL, BAND_COLORS, resolveId } = require('./cards');
function Renderer(canvas, width, height, assets) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.width = width; this.height = height; this.scale = Math.min(width / DESIGN_W, height / DESIGN_H); this.offsetX = (width - DESIGN_W * this.scale) / 2; this.offsetY = (height - DESIGN_H * this.scale) / 2; this.time = 0; this.cache = {}; this.assets = assets || null; }
Renderer.prototype.drawCoverImage = function drawCoverImage(img, x, y, w, h) { if (!img || !img.width) return false; const ctx = this.ctx; const ir = img.width / img.height; const rr = w / h; let dw, dh, dx, dy; if (ir > rr) { dh = h; dw = h * ir; dx = x - (dw - w) / 2; dy = y; } else { dw = w; dh = w / ir; dx = x; dy = y - (dh - h) / 2; } ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(img, dx, dy, dw, dh); ctx.restore(); return true; };
Renderer.prototype.beginFrame = function beginFrame(dt) { this.time += dt || 0; const ctx = this.ctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.width, this.height); ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, this.width, this.height); ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY); ctx.fillStyle = COLORS.void; ctx.fillRect(0, 0, DESIGN_W, DESIGN_H); };
Renderer.prototype.toDesign = function toDesign(x, y) { return { x: (x - this.offsetX) / this.scale, y: (y - this.offsetY) / this.scale }; };
Renderer.prototype.roundRect = function roundRect(x, y, w, h, r) { const ctx = this.ctx; const rr = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr); ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath(); };
Renderer.prototype.drawNoise = function drawNoise() { const ctx = this.ctx; ctx.save(); ctx.globalAlpha = 0.035; ctx.fillStyle = COLORS.white; const t = Math.floor(this.time * 8); for (let i = 0; i < 40; i += 1) { const x = (i * 137 + t * 13) % DESIGN_W; const y = (i * 89 + t * 7) % DESIGN_H; ctx.fillRect(x, y, 2, 2); } ctx.restore(); };
Renderer.prototype.drawScanlines = function drawScanlines() { const ctx = this.ctx; ctx.save(); ctx.globalAlpha = 0.04; ctx.strokeStyle = COLORS.white; ctx.lineWidth = 1; for (let y = 0; y < DESIGN_H; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(DESIGN_W, y); ctx.stroke(); } ctx.restore(); };
Renderer.prototype.drawDiagonalSecret = function drawDiagonalSecret(text) { const ctx = this.ctx; ctx.save(); ctx.translate(DESIGN_W / 2, DESIGN_H / 2); ctx.rotate(-0.4); ctx.font = '700 96px ' + FONTS.mono; ctx.fillStyle = COLORS.stamp; ctx.globalAlpha = 0.06; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; for (let row = -3; row <= 3; row += 1) { ctx.fillText(text || 'TOP SECRET', 0, row * 140); } ctx.restore(); };
Renderer.prototype.drawFrame = function drawFrame() { const ctx = this.ctx; ctx.strokeStyle = COLORS.oliveLight; ctx.lineWidth = 2; ctx.strokeRect(18, 18, DESIGN_W - 36, DESIGN_H - 36); ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = COLORS.signalDim; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.strokeRect(32, 32, DESIGN_W - 64, DESIGN_H - 64); ctx.restore(); };
Renderer.prototype.stampText = function stampText(text, x, y, size, alpha) { const ctx = this.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); ctx.font = '700 ' + (size || 42) + 'px ' + FONTS.mono; ctx.fillStyle = COLORS.stamp; ctx.globalAlpha = alpha == null ? 0.9 : alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = COLORS.stampBright; ctx.lineWidth = 2; ctx.strokeText(text, 0, 0); ctx.fillText(text, 0, 0); const w = ctx.measureText(text).width + 24; ctx.strokeRect(-w / 2, -(size || 42) * 0.75, w, (size || 42) * 1.5); ctx.restore(); };
Renderer.prototype.text = function text(str, x, y, opts) { const ctx = this.ctx; const o = opts || {}; ctx.save(); ctx.font = (o.weight || '400') + ' ' + (o.size || 24) + 'px ' + (o.family || FONTS.sans); ctx.fillStyle = o.color || COLORS.white; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'top'; if (o.alpha != null) ctx.globalAlpha = o.alpha; if (o.maxWidth) ctx.fillText(str, x, y, o.maxWidth); else ctx.fillText(str, x, y); ctx.restore(); };
Renderer.prototype.wrapText = function wrapText(str, x, y, maxWidth, lineHeight, opts) { const ctx = this.ctx; const o = opts || {}; ctx.save(); ctx.font = (o.weight || '400') + ' ' + (o.size || 22) + 'px ' + (o.family || FONTS.sans); ctx.fillStyle = o.color || COLORS.dossier; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'top'; const chars = String(str).split(''); let line = ''; let cy = y; for (let i = 0; i < chars.length; i += 1) { const test = line + chars[i]; if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, cy); line = chars[i]; cy += lineHeight; } else line = test; } if (line) ctx.fillText(line, x, cy); ctx.restore(); return cy + lineHeight; };
Renderer.prototype.drawCoverBar = function drawCoverBar(x, y, w, cover, max, label, alignRight) { const ctx = this.ctx; const pct = Math.max(0, Math.min(1, cover / max)); ctx.fillStyle = COLORS.olive; ctx.fillRect(x, y, w, 18); const fillW = Math.floor(w * pct); ctx.fillStyle = pct > 0.35 ? COLORS.signal : COLORS.stamp; ctx.fillRect(alignRight ? x + w - fillW : x, y, fillW, 18); ctx.strokeStyle = COLORS.dossierDim; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, 18); this.text(label + '  ' + cover, x + (alignRight ? w : 0), y - 28, { size: 22, color: COLORS.dossier, family: FONTS.mono, align: alignRight ? 'right' : 'left' }); };
Renderer.prototype.drawCardBack = function drawCardBack(x, y, w, h, selected) { const ctx = this.ctx; ctx.save(); if (selected) { ctx.shadowColor = COLORS.signal; ctx.shadowBlur = 16; } ctx.fillStyle = COLORS.olive; this.roundRect(x, y, w, h, 6); ctx.fill(); const art = this.assets && this.assets.back; if (art) { this.drawCoverImage(art, x + 2, y + 2, w - 4, h - 4); ctx.save(); this.roundRect(x + 2, y + 2, w - 4, h - 4, 5); ctx.clip(); ctx.fillStyle = 'rgba(11,18,16,0.18)'; ctx.fillRect(x, y, w, h); ctx.restore(); } else { ctx.globalAlpha = 0.35; ctx.strokeStyle = COLORS.signal; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.22, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + w / 2 - 10, y + h / 2); ctx.lineTo(x + w / 2 + 10, y + h / 2); ctx.moveTo(x + w / 2, y + h / 2 - 10); ctx.lineTo(x + w / 2, y + h / 2 + 10); ctx.stroke(); ctx.globalAlpha = 1; } ctx.strokeStyle = selected ? COLORS.signal : COLORS.dossierDim; ctx.lineWidth = selected ? 3 : 1.5; this.roundRect(x, y, w, h, 6); ctx.stroke(); ctx.restore(); };
Renderer.prototype.drawCard = function drawCard(card, x, y, w, h, opts) { const ctx = this.ctx; const o = opts || {}; const faceDown = o.faceDown; const selected = o.selected; const dim = o.dim; const reveal = o.reveal; const compact = o.compact || w < 140; if (faceDown || (reveal != null && reveal < 0.5)) { this.drawCardBack(x, y, w, h, selected); return; } ctx.save(); if (dim) ctx.globalAlpha = 0.5; if (selected) { ctx.shadowColor = COLORS.signal; ctx.shadowBlur = 18; } ctx.fillStyle = COLORS.paper; this.roundRect(x, y, w, h, 6); ctx.fill(); const artH = compact ? Math.floor(h * 0.58) : Math.floor(h * 0.52); const art = this.assets && this.assets.getCard ? this.assets.getCard(resolveId(card.id)) : null; const accent = TYPE_COLOR[card.type] || COLORS.haze; ctx.save(); this.roundRect(x + 2, y + 2, w - 4, artH, 4); ctx.clip(); if (art) { this.drawCoverImage(art, x + 2, y + 2, w - 4, artH); } else { ctx.fillStyle = COLORS.olive; ctx.fillRect(x + 2, y + 2, w - 4, artH); } const grad = ctx.createLinearGradient(0, y + artH - 28, 0, y + artH); grad.addColorStop(0, 'rgba(232,223,200,0)'); grad.addColorStop(1, 'rgba(232,223,200,0.85)'); ctx.fillStyle = grad; ctx.fillRect(x + 2, y + artH - 28, w - 4, 28); ctx.restore(); ctx.fillStyle = accent; ctx.fillRect(x, y, w, 8); this.roundRect(x, y, w, 12, 4); ctx.globalAlpha = (dim ? 0.5 : 1) * 0.35; ctx.fill(); ctx.globalAlpha = dim ? 0.5 : 1; if (card.band) { const bc = BAND_COLORS[card.band] || COLORS.signal; ctx.fillStyle = bc; ctx.beginPath(); ctx.arc(x + w - 18, y + 22, 14, 0, Math.PI * 2); ctx.fill(); this.text(card.band, x + w - 18, y + 22, { size: 14, color: COLORS.void, align: 'center', baseline: 'middle', weight: '700', family: FONTS.sans }); } ctx.strokeStyle = selected ? COLORS.signal : COLORS.ink; ctx.lineWidth = selected ? 2.5 : 1.5; this.roundRect(x, y, w, h, 6); ctx.stroke(); this.text(card.name, x + w / 2, y + artH + (compact ? 14 : 18), { size: compact ? 22 : 28, color: COLORS.ink, align: 'center', weight: '700', family: FONTS.sans, maxWidth: w - 12 }); this.text(TYPE_LABEL[card.type] || '', x + w / 2, y + artH + (compact ? 40 : 52), { size: compact ? 14 : 16, color: accent, align: 'center', family: FONTS.mono, weight: '700' }); if (!compact) this.wrapText(card.short || '', x + 12, y + artH + 78, w - 24, 22, { size: 16, color: '#3A3F3A', family: FONTS.sans, align: 'left' }); ctx.restore(); };
Renderer.prototype.drawButton = function drawButton(rect, label, opts) { const ctx = this.ctx; const o = opts || {}; const pressed = o.pressed; const disabled = o.disabled; ctx.save(); if (disabled) ctx.globalAlpha = 0.4; ctx.fillStyle = pressed ? COLORS.stamp : (o.primary ? COLORS.stamp : COLORS.olive); this.roundRect(rect.x, rect.y, rect.w, rect.h, 4); ctx.fill(); ctx.strokeStyle = o.primary ? COLORS.stampBright : COLORS.signalDim; ctx.lineWidth = 2; ctx.stroke(); this.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2, { size: o.size || 28, color: COLORS.white, align: 'center', baseline: 'middle', weight: '700', family: FONTS.sans }); ctx.restore(); };
Renderer.prototype.hitTest = function hitTest(rect, x, y) { return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h; };
Renderer.prototype.drawLog = function drawLog(lines, x, y, maxW) { const recent = lines.slice(-5); this.ctx.save(); this.ctx.fillStyle = 'rgba(11,18,16,0.75)'; this.roundRect(x - 10, y - 8, maxW + 20, recent.length * 30 + 16, 4); this.ctx.fill(); this.ctx.restore(); recent.forEach(function(line, i) { this.text('› ' + line, x, y + i * 30, { size: 18, color: COLORS.dossierDim, family: FONTS.mono, maxWidth: maxW }); }, this); };
Renderer.prototype.drawAgentCard = function drawAgentCard(agent, x, y, w, h, selected) { const ctx = this.ctx; ctx.save(); if (selected) { ctx.shadowColor = COLORS.signal; ctx.shadowBlur = 20; } const bg = selected ? COLORS.oliveLight : COLORS.voidSoft; ctx.fillStyle = bg; this.roundRect(x, y, w, h, 8); ctx.fill(); const accent = agent.color || COLORS.info; ctx.fillStyle = accent; ctx.fillRect(x, y, w, 8); this.roundRect(x, y, w, 12, 4); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = accent; ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(x + w / 2, y + 60, 36, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; this.text(agent.name.charAt(0), x + w / 2, y + 60, { size: 36, color: accent, align: 'center', baseline: 'middle', weight: '700', family: FONTS.sans }); this.text(agent.name, x + w / 2, y + 98, { size: 20, color: COLORS.paper, align: 'center', weight: '700', family: FONTS.sans }); this.text(agent.title, x + w / 2, y + 122, { size: 13, color: accent, align: 'center', family: FONTS.mono }); ctx.strokeStyle = selected ? COLORS.signal : COLORS.oliveLight; ctx.lineWidth = selected ? 2.5 : 1.5; this.roundRect(x, y, w, h, 8); ctx.stroke(); ctx.restore(); };
module.exports = Renderer;
};
modules["./js/renderer.js"] = modules["./js/renderer.js"];
modules["./js/renderer"] = modules["./js/renderer.js"];
modules["./renderer"] = modules["./js/renderer.js"];
modules["./renderer.js"] = modules["./js/renderer.js"];
modules["./js/scenes.js"] = function (module, exports, require) {
/**
 * 谍网 — 场景主循环（上架向）
 * 启动 / 标题 / 模式 / 特工选择 / 对局 / 结算 / 设置
 */

const { DESIGN_W, DESIGN_H, COLORS, FONTS, RULES, MODES, AGENTS, LOCATIONS } = require('./config');
const {
  newGame,
  playerPlay,
  undoPlay,
  resolveRound,
  resolveTeamRound,
  useIntelAction: runIntel,
  passTurn,
  currentPassPlayer,
  playDeepCover,
  pickRandomLocation,
  getLocationById,
} = require('./engine');
const { chooseCard, shouldDeepCover } = require('./ai');
const { BAND_COLORS } = require('./cards');
const Renderer = require('./renderer');
const { AssetStore } = require('./assets');
const { Toast, drawButton, drawPanel, easeOutCubic } = require('./ui');
const { AudioManager } = require('./audio');
const storage = require('./storage');

function partnerPick(hand, me, opp, watch) {
  return chooseCard(hand, me, opp, watch);
}

const SCENES = {
  BOOT: 'boot',
  TITLE: 'title',
  MODE: 'mode',
  AGENT_SELECT: 'agentselect',
  RULES: 'rules',
  GAME: 'game',
  OVER: 'over',
  PASS_WAIT: 'passwait',
};

function createGame(canvas, width, height, assets) {
  const R = new Renderer(canvas, width, height, assets);
  const toast = new Toast();
  const audio = new AudioManager();

  const state = {
    scene: SCENES.BOOT,
    game: null,
    mode: MODES.SOLO,
    selectedUid: null,
    selectedAgentId: null,
    anim: null,
    log: [],
    winner: null,
    shake: 0,
    flash: 0,
    lastTs: 0,
    bootT: 0,
    titleT: 0,
    settingsOpen: false,
    privacyOpen: false,
    soundOn: storage.getSound(),
    vibrateOn: storage.getVibrate(),
    listenHint: null,
    passPending: false,
    stats: { turns: 0, dmgDealt: 0, dmgTaken: 0 },
    shownTutorial: false,
    audio,
  };

  audio.setEnabled(state.soundOn);

  const HAND_CARD_W = 116;
  const HAND_CARD_H = 166;
  const HAND_BASE_Y = 1118;

  const L = {
    titleBtnSolo: { x: 160, y: 700, w: 430, h: 78 },
    titleBtnMode: { x: 160, y: 800, w: 430, h: 78 },
    titleBtnRules: { x: 160, y: 900, w: 430, h: 68 },
    titleBtnSettings: { x: 300, y: 1000, w: 150, h: 56 },
    modeSolo: { x: 100, y: 360, w: 550, h: 120 },
    modePass: { x: 100, y: 510, w: 550, h: 120 },
    modeTeam: { x: 100, y: 660, w: 550, h: 120 },
    modeBack: { x: 220, y: 1100, w: 310, h: 64 },
    agentCards: AGENTS.map((_, i) => ({ x: 30 + i * 144, y: 280, w: 126, h: 200 })),
    agentConfirm: { x: 220, y: 1060, w: 310, h: 64 },
    agentBack: { x: 220, y: 1140, w: 310, h: 64 },
    rulesBack: { x: 220, y: 1180, w: 310, h: 64 },
    gameConfirm: { x: 230, y: 1038, w: 290, h: 62 },
    gameUndo: { x: 56, y: 1038, w: 140, h: 62 },
    gameMenu: { x: 580, y: 48, w: 120, h: 46 },
    btnListen: { x: 48, y: 968, w: 200, h: 50 },
    btnJam: { x: 275, y: 968, w: 200, h: 50 },
    btnDecode: { x: 502, y: 968, w: 200, h: 50 },
    btnDeep: { x: 275, y: 900, w: 200, h: 52 },
    overAgain: { x: 160, y: 780, w: 430, h: 72 },
    overTitle: { x: 160, y: 870, w: 430, h: 72 },
    passReady: { x: 160, y: 700, w: 430, h: 80 },
    privacyAgree: { x: 160, y: 720, w: 430, h: 70 },
    privacyDeny: { x: 160, y: 810, w: 430, h: 60 },
    enemySlot: { x: 250, y: 200, w: 250, h: 300 },
    playerSlot: { x: 250, y: 620, w: 250, h: 300 },
    partnerSlot: { x: 40, y: 620, w: 160, h: 210 },
    enemy2Slot: { x: 550, y: 200, w: 160, h: 210 },
    settingsSound: { x: 200, y: 520, w: 350, h: 56 },
    settingsVib: { x: 200, y: 600, w: 350, h: 56 },
    settingsClose: { x: 200, y: 700, w: 350, h: 56 },
  };

  function layoutHand(hand, selectedUid) {
    const n = hand.length;
    const cardW = HAND_CARD_W;
    const cardH = HAND_CARD_H;
    const gap = n > 1 ? Math.min(126, (DESIGN_W - 70 - cardW) / (n - 1)) : 0;
    const totalW = cardW + gap * Math.max(0, n - 1);
    const startX = (DESIGN_W - totalW) / 2;
    return hand.map((card, i) => {
      const selected = card.uid === selectedUid;
      return { card, x: startX + i * gap, y: selected ? HAND_BASE_Y - 42 : HAND_BASE_Y, w: cardW, h: cardH, selected };
    });
  }

  function activeSeat() {
    const g = state.game;
    if (!g) return null;
    if (g.mode === MODES.PASS) return currentPassPlayer(g);
    return g.player;
  }

  function startGame(mode, agentId) {
    state.mode = mode || state.mode || MODES.SOLO;
    state.game = newGame({ mode: state.mode, agentId: agentId || null });
    state.scene = SCENES.GAME;
    state.selectedUid = null;
    state.selectedAgentId = null;
    state.anim = null;
    state.winner = null;
    state.log = [];
    state.listenHint = null;
    state.passPending = false;
    state.stats = { turns: 0, dmgDealt: 0, dmgTaken: 0 };
    const loc = getLocationById(state.game.locationId);
    state.log.push('行动地点：【' + loc.name + '】' + loc.desc);
    if (state.mode === MODES.TEAM) {
      state.log.push('小队行动：你与搭档对抗敌方双人组。队伍掩护 ' + RULES.TEAM_COVER);
      toast.push('小队行动开始', 'good');
    } else if (state.mode === MODES.PASS) {
      state.game.hideHands = true; state.scene = SCENES.PASS_WAIT;
      state.log.push('同屏潜伏：玩家 A 先手。确认出牌后交给对方。');
    } else {
      if (agentId) { var agent = AGENTS.find(function(a) { return a.id === agentId; }); if (agent) state.log.push('特工【' + agent.name + '·' + agent.title + '】就位：' + agent.desc); }
      state.log.push('密令对决：点选手牌，可用情报，确认后同时翻开。');
      toast.push('行动开始', 'good');
    }
  }

  function tryPlaySelected() {
    var g = state.game;
    if (!g || g.phase !== 'select') return;
    var seat = activeSeat();
    if (!seat || !state.selectedUid) return;
    var card = seat.hand.find(function(c) { return c.uid === state.selectedUid; });
    if (!card) return;
    audio.play('play');
    if (g.mode === MODES.TEAM) {
      playerPlay(g, card.uid); state.selectedUid = null;
      var m = partnerPick(g.partner.hand, g.partner, g.enemy1, g.watchword);
      if (m) { var i = g.partner.hand.findIndex(function(c) { return c.uid === m.uid; }); if (i >= 0) g.partner.hand.splice(i, 1); g.partner.played = m; }
      var a = chooseCard(g.enemy1.hand, g.enemy1, g.you, g.watchword, g.locationId);
      if (a) { var i2 = g.enemy1.hand.findIndex(function(c) { return c.uid === a.uid; }); if (i2 >= 0) g.enemy1.hand.splice(i2, 1); g.enemy1.played = a; }
      var b = chooseCard(g.enemy2.hand, g.enemy2, g.partner, g.watchword, g.locationId);
      if (b) { var i3 = g.enemy2.hand.findIndex(function(c) { return c.uid === b.uid; }); if (i3 >= 0) g.enemy2.hand.splice(i3, 1); g.enemy2.played = b; }
      g.phase = 'reveal'; afterResolve(resolveTeamRound(g)); return;
    }
    playerPlay(g, card.uid); state.selectedUid = null;
    if (g.mode === MODES.PASS) {
      var other = g.passSeat === 0 ? g.enemy : g.player;
      if (other.played) { g.phase = 'reveal'; afterResolve(resolveRound(g)); }
      else { passTurn(g); state.scene = SCENES.PASS_WAIT; toast.push('交给对方', 'info'); }
      return;
    }
    state.anim = { t: 0, duration: 0.7, phase: 'ai', done: false };
  }

  function tryPlayDeepAndGo() {
    var g = state.game; if (!g || !g.player.played || !g.player.played.deep) return;
    if (g.mode === MODES.TEAM) { toast.push('小队模式请使用手牌', 'bad'); undoPlay(g); return; }
    if (g.mode === MODES.PASS) {
      var other = g.passSeat === 0 ? g.enemy : g.player;
      if (other.played) { g.phase = 'reveal'; afterResolve(resolveRound(g)); }
      else { passTurn(g); state.scene = SCENES.PASS_WAIT; }
      return;
    }
    state.anim = { t: 0, duration: 0.7, phase: 'ai', done: false };
  }

  function afterResolve(result) {
    var g = state.game; g.lastResult = result; g.turn += 1;
    state.stats.turns += 1; state.stats.dmgDealt += result.enemyDamage || 0; state.stats.dmgTaken += result.playerDamage || 0;
    (result.events || []).forEach(function(e) { state.log.push(e); });
    state.shake = (result.playerDamage || 0) >= 3 ? 0.3 : 0; state.flash = (result.playerDamage || 0) > 0 ? 0.22 : 0;
    if ((result.playerDamage || 0) > 0) audio.play('hit'); else if ((result.enemyDamage || 0) > 0) audio.play('hit'); else audio.play('block');
    if (result.gameOver) audio.play(result.winner === 'player' ? 'win' : 'lose');
    if (state.vibrateOn && (result.playerDamage || 0) >= 3 && typeof wx !== 'undefined' && wx.vibrateShort) { try { wx.vibrateShort({ type: 'medium' }); } catch (e) {} }
    g.phase = 'result'; state.anim = { t: 0, duration: 1.55, phase: 'result', done: false };
    if (result.gameOver) { g.phase = 'over'; state.anim.duration = 1.7; state.winner = result.winner; }
  }

  function aiPlayAndResolve() {
    var g = state.game; if (!g || g.mode !== MODES.SOLO) return;
    if (g.enemy.intel >= RULES.INTEL_COST.jam && g.player.cover <= 6 && Math.random() < 0.4) { runIntel(g, 'enemy', 'jam'); state.log.push('敌方干扰了信道…'); }
    else if (g.enemy.intel >= RULES.INTEL_COST.decode && g.enemy.hand.length <= 3 && Math.random() < 0.45) { runIntel(g, 'enemy', 'decode'); }
    if (shouldDeepCover(g.enemy, g.player, g.locationId)) { playDeepCover(g, 'enemy'); state.log.push('敌方切断了联络…'); }
    else { var pick = chooseCard(g.enemy.hand, g.enemy, g.player, g.watchword, g.locationId); if (pick) { var idx = g.enemy.hand.findIndex(function(c) { return c.uid === pick.uid; }); if (idx >= 0) g.enemy.hand.splice(idx, 1); g.enemy.played = pick; } }
    afterResolve(resolveRound(g));
  }

  function useIntel(kind) {
    var g = state.game; if (!g || g.phase !== 'select') return;
    if (g.mode === MODES.TEAM) { toast.push('小队模式暂不使用个人情报', 'bad'); return; }
    var seat = activeSeat(); if (seat.played) { toast.push('已出牌，无法使用情报', 'bad'); return; }
    var side = g.mode === MODES.PASS ? (g.passSeat === 0 ? 'player' : 'enemy') : 'player';
    var r = runIntel(g, side, kind); if (r.ok) audio.play('intel');
    toast.push(r.msg || (r.ok ? '完成' : '失败'), r.ok ? 'good' : 'bad');
    if (r.ok && r.listenResult != null) state.listenHint = r.listenResult;
  }

  function finishAnim() {
    var g = state.game; if (!g) return;
    if (g.phase === 'over') { state.scene = SCENES.OVER; return; }
    g.phase = 'select'; g.lastResult = null; state.listenHint = null;
    if (g.mode === MODES.PASS) { state.scene = SCENES.PASS_WAIT; g.hideHands = true; }
  }

  function onTouchStart(x, y) {
    var d = R.toDesign(x, y); toast.update(0);
    if (state.privacyOpen) {
      if (R.hitTest(L.privacyAgree, d.x, d.y)) { storage.acceptPrivacy(); state.privacyOpen = false; audio.play('click'); toast.push('已同意用户协议与隐私政策', 'good'); }
      else if (R.hitTest(L.privacyDeny, d.x, d.y)) toast.push('需同意后才能开始行动', 'bad');
      return;
    }
    if (state.settingsOpen) {
      if (R.hitTest(L.settingsSound, d.x, d.y)) { state.soundOn = !state.soundOn; storage.setSound(state.soundOn); audio.setEnabled(state.soundOn); if (state.soundOn) audio.play('click'); toast.push(state.soundOn ? '音效开' : '音效关'); }
      else if (R.hitTest(L.settingsVib, d.x, d.y)) { state.vibrateOn = !state.vibrateOn; storage.setVibrate(state.vibrateOn); toast.push(state.vibrateOn ? '震动开' : '震动关'); }
      else if (R.hitTest(L.settingsClose, d.x, d.y)) { state.settingsOpen = false; audio.play('click'); }
      return;
    }
    if (state.scene === SCENES.BOOT) return;
    if (state.scene === SCENES.TITLE) {
      if (R.hitTest(L.titleBtnSolo, d.x, d.y)) { if (!storage.hasPrivacy()) { state.privacyOpen = true; return; } audio.play('click'); startGame(MODES.SOLO); }
      else if (R.hitTest(L.titleBtnMode, d.x, d.y)) { if (!storage.hasPrivacy()) { state.privacyOpen = true; return; } audio.play('click'); state.scene = SCENES.MODE; }
      else if (R.hitTest(L.titleBtnRules, d.x, d.y)) { audio.play('click'); state.scene = SCENES.RULES; }
      else if (R.hitTest(L.titleBtnSettings, d.x, d.y)) { audio.play('click'); state.settingsOpen = true; }
      return;
    }
    if (state.scene === SCENES.MODE) {
      if (R.hitTest(L.modeSolo, d.x, d.y)) { audio.play('click'); state.mode = MODES.SOLO; state.scene = SCENES.AGENT_SELECT; }
      else if (R.hitTest(L.modePass, d.x, d.y)) startGame(MODES.PASS);
      else if (R.hitTest(L.modeTeam, d.x, d.y)) startGame(MODES.TEAM);
      else if (R.hitTest(L.modeBack, d.x, d.y)) state.scene = SCENES.TITLE;
      return;
    }
    if (state.scene === SCENES.AGENT_SELECT) {
      for (var i = 0; i < AGENTS.length; i += 1) { if (R.hitTest(L.agentCards[i], d.x, d.y)) { audio.play('click'); state.selectedAgentId = state.selectedAgentId === AGENTS[i].id ? null : AGENTS[i].id; return; } }
      if (R.hitTest(L.agentConfirm, d.x, d.y) && state.selectedAgentId) { audio.play('click'); startGame(state.mode, state.selectedAgentId); }
      else if (R.hitTest(L.agentBack, d.x, d.y)) { audio.play('click'); state.selectedAgentId = null; state.scene = SCENES.MODE; }
      return;
    }
    if (state.scene === SCENES.RULES) { if (R.hitTest(L.rulesBack, d.x, d.y)) state.scene = SCENES.TITLE; return; }
    if (state.scene === SCENES.PASS_WAIT) { if (R.hitTest(L.passReady, d.x, d.y)) { state.game.hideHands = false; state.scene = SCENES.GAME; } return; }
    if (state.scene === SCENES.OVER) { if (R.hitTest(L.overAgain, d.x, d.y)) startGame(state.mode); else if (R.hitTest(L.overTitle, d.x, d.y)) state.scene = SCENES.TITLE; return; }
    if (state.scene !== SCENES.GAME) return;
    var g = state.game; if (!g) return;
    if (R.hitTest(L.gameMenu, d.x, d.y)) { state.scene = SCENES.TITLE; return; }
    if (g.phase === 'select') {
      if (R.hitTest(L.gameUndo, d.x, d.y) && g.player.played) { undoPlay(g); toast.push('已撤回'); return; }
      if (R.hitTest(L.gameConfirm, d.x, d.y)) { if (state.selectedUid) tryPlaySelected(); else tryPlayDeepAndGo(); return; }
      if (R.hitTest(L.btnListen, d.x, d.y)) { useIntel('listen'); return; }
      if (R.hitTest(L.btnJam, d.x, d.y)) { useIntel('jam'); return; }
      if (R.hitTest(L.btnDecode, d.x, d.y)) { useIntel('decode'); return; }
      if (R.hitTest(L.btnDeep, d.x, d.y)) {
        var seat2 = activeSeat();
        if (seat2.played) toast.push('已就位，无法深潜', 'bad');
        else if (playDeepCover(g, g.mode === MODES.PASS ? (g.passSeat === 0 ? 'player' : 'enemy') : 'player')) {
          audio.play('play'); toast.push('进入深潜：清暴露 · 抽 2 · 免疫行动', 'good');
          state.selectedUid = null; tryPlayDeepAndGo();
        }
        return;
      }
      var seat = activeSeat(); var hand = layoutHand(seat.hand, state.selectedUid);
      for (var j = hand.length - 1; j >= 0; j -= 1) { if (R.hitTest(hand[j], d.x, d.y)) { state.selectedUid = state.selectedUid === hand[j].card.uid ? null : hand[j].card.uid; return; } }
    }
  }

  function drawBoot() {
    R.ctx.fillStyle = COLORS.void; R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    var p = assets ? Math.min(1, assets.progress()) : 1;
    R.text('SPYNET', DESIGN_W / 2, 520, { size: 42, color: COLORS.paper, align: 'center', family: FONTS.mono, weight: '700' });
    R.text('载入机密档案…', DESIGN_W / 2, 600, { size: 20, color: COLORS.haze, align: 'center', family: FONTS.sans });
    var bw = 360; R.ctx.fillStyle = COLORS.olive; R.roundRect((DESIGN_W - bw) / 2, 660, bw, 10, 5); R.ctx.fill();
    R.ctx.fillStyle = COLORS.signal; R.roundRect((DESIGN_W - bw) / 2, 660, bw * p, 10, 5); R.ctx.fill();
  }

  function drawTitle() {
    if (R.assets && R.assets.titleBg) {
      R.drawCoverImage(R.assets.titleBg, 0, 0, DESIGN_W, DESIGN_H);
      R.ctx.fillStyle = 'rgba(10,16,14,0.58)'; R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
      var grd = R.ctx.createLinearGradient(0, DESIGN_H * 0.3, 0, DESIGN_H);
      grd.addColorStop(0, 'rgba(10,16,14,0)'); grd.addColorStop(1, 'rgba(10,16,14,0.92)');
      R.ctx.fillStyle = grd; R.ctx.fillRect(0, DESIGN_H * 0.3, DESIGN_W, DESIGN_H * 0.7);
    }
    R.drawNoise(); R.drawScanlines(); R.drawDiagonalSecret('TOP SECRET'); R.drawFrame();
    var t = state.titleT; var slide = easeOutCubic(Math.min(1, t / 0.8));
    R.ctx.save(); R.ctx.globalAlpha = slide;
    R.text('CLASSIFIED // OPERATION SPYNET', DESIGN_W / 2, 170, { size: 18, color: COLORS.haze, family: FONTS.mono, align: 'center' });
    R.text('谍  网', DESIGN_W / 2, 280, { size: 108, color: COLORS.paper, align: 'center', weight: '700' });
    R.stampText('SPYNET', DESIGN_W / 2, 430, 34, 0.9);
    R.text('同时翻开 · 情报博弈 · 掩护归零者败', DESIGN_W / 2, 510, { size: 22, color: COLORS.dossierDim, align: 'center' });
    R.ctx.restore();
    drawButton(R, L.titleBtnSolo, '快速行动', { primary: true, size: 28 });
    drawButton(R, L.titleBtnMode, '模式选择', { size: 28 });
    drawButton(R, L.titleBtnRules, '作战手册', { size: 24 });
    drawButton(R, L.titleBtnSettings, '设置', { size: 20 });
    R.text('FOR AUTHORIZED EYES ONLY', DESIGN_W / 2, 1260, { size: 14, color: COLORS.haze, family: FONTS.mono, align: 'center' });
  }

  function drawMode() {
    R.drawNoise(); R.drawFrame();
    R.text('选择行动', DESIGN_W / 2, 160, { size: 44, color: COLORS.paper, align: 'center', weight: '700' });
    R.text('SELECT OPERATION', DESIGN_W / 2, 220, { size: 16, color: COLORS.haze, family: FONTS.mono, align: 'center' });
    function modeCard(rect, title, sub, tag) {
      var ctx = R.ctx; ctx.save(); ctx.fillStyle = 'rgba(30,46,38,0.9)'; R.roundRect(rect.x, rect.y, rect.w, rect.h, 8); ctx.fill();
      ctx.strokeStyle = COLORS.oliveLight; ctx.lineWidth = 2; ctx.stroke();
      R.text(title, rect.x + 28, rect.y + 28, { size: 30, color: COLORS.paper, weight: '700' });
      R.text(sub, rect.x + 28, rect.y + 72, { size: 18, color: COLORS.dossierDim });
      if (tag) R.text(tag, rect.x + rect.w - 24, rect.y + 36, { size: 16, color: COLORS.signal, family: FONTS.mono, align: 'right' });
      ctx.restore();
    }
    modeCard(L.modeSolo, '密令对决', '1v1 对抗 AI · 可选特工', 'SOLO');
    modeCard(L.modePass, '同屏潜伏', '两人一机 · 交替出牌，注意遮挡', '2P');
    modeCard(L.modeTeam, '小队行动', '你 + 搭档 AI 对抗敌方双人组', '2v2');
    drawButton(R, L.modeBack, '返回');
  }

  function drawAgentSelect() {
    R.drawNoise(); R.drawFrame();
    R.text('选择特工', DESIGN_W / 2, 120, { size: 40, color: COLORS.paper, align: 'center', weight: '700' });
    R.text('SELECT OPERATIVE', DESIGN_W / 2, 170, { size: 16, color: COLORS.haze, align: 'center', family: FONTS.mono });
    AGENTS.forEach(function(agent, i) { var rect = L.agentCards[i]; var selected = state.selectedAgentId === agent.id; R.drawAgentCard(agent, rect.x, rect.y, rect.w, rect.h, selected); });
    if (state.selectedAgentId) {
      var agent = AGENTS.find(function(a) { return a.id === state.selectedAgentId; });
      if (agent) { drawPanel(R, 50, 510, 650, 210, agent.name + ' · ' + agent.title); R.text('被动技能', 100, 580, { size: 18, color: COLORS.signal, family: FONTS.mono }); R.text(agent.desc, 100, 620, { size: 22, color: COLORS.dossier }); }
    } else {
      drawPanel(R, 50, 510, 650, 210, '选择你的特工');
      R.text('每名特工拥有独特的被动技能，', 100, 590, { size: 20, color: COLORS.haze });
      R.text('影响整局对战策略。', 100, 620, { size: 20, color: COLORS.haze });
    }
    drawButton(R, L.agentConfirm, '确认出击', { primary: true, size: 24, disabled: !state.selectedAgentId });
    drawButton(R, L.agentBack, '返回');
  }

  function drawCover(x, y, w, cover, max, label, align) { R.drawCoverBar(x, y, w, cover, max, label, align); }

  function drawHUD() {
    var g = state.game;
    R.ctx.fillStyle = 'rgba(30,46,38,0.72)'; R.roundRect(28, 36, DESIGN_W - 56, 100, 8); R.ctx.fill(); R.ctx.strokeStyle = COLORS.oliveLight; R.ctx.stroke();
    var modeName = g.mode === MODES.TEAM ? '小队' : g.mode === MODES.PASS ? '同屏' : '密令';
    var seatName = g.mode === MODES.PASS ? (g.passSeat === 0 ? '玩家A' : '玩家B') : '';
    R.text(modeName + ' · 回合 ' + g.turn + (seatName ? ' · ' + seatName : ''), 48, 48, { size: 20, color: COLORS.paper, family: FONTS.mono, weight: '700' });
    if (g.locationId) { var loc = getLocationById(g.locationId); var locColor = loc.color || COLORS.signal; R.ctx.save(); R.ctx.fillStyle = 'rgba(3,6,5,0.55)'; R.roundRect(DESIGN_W - 200, 44, 170, 24, 4); R.ctx.fill(); R.ctx.strokeStyle = locColor; R.ctx.stroke(); R.text(loc.name, DESIGN_W - 115, 56, { size: 14, color: locColor, align: 'center', baseline: 'middle', family: FONTS.mono, weight: '700' }); R.ctx.restore(); }
    if (g.mode !== MODES.TEAM) {
      var seat = activeSeat();
      R.text('情报 ' + (seat ? seat.intel : g.player.intel) + '/' + RULES.MAX_INTEL, 48, 80, { size: 16, color: COLORS.signal, family: FONTS.mono });
      var expo = seat ? seat.exposure : 0;
      R.text('暴露 ' + expo, 200, 80, { size: 16, color: expo >= 3 ? COLORS.stampBright : COLORS.haze, family: FONTS.mono });
      if (seat && seat.agentId) { var agent = AGENTS.find(function(a) { return a.id === seat.agentId; }); if (agent) R.text(agent.name, 320, 80, { size: 16, color: agent.color || COLORS.info, family: FONTS.mono, weight: '700' }); }
    } else { R.text('队伍掩护同步显示', 48, 80, { size: 16, color: COLORS.haze, family: FONTS.mono }); }
    var ww = g.watchword || '—'; var wColor = BAND_COLORS[ww] || COLORS.signal;
    R.ctx.save(); R.ctx.fillStyle = 'rgba(3,6,5,0.55)'; R.roundRect(DESIGN_W - 210, 90, 170, 34, 4); R.ctx.fill(); R.ctx.strokeStyle = wColor; R.ctx.stroke();
    R.text('暗号「' + ww + '」', DESIGN_W - 125, 107, { size: 16, color: wColor, align: 'center', baseline: 'middle', family: FONTS.mono, weight: '700' }); R.ctx.restore();
    drawButton(R, L.gameMenu, '撤离', { size: 18 });
    if (g.mode === MODES.TEAM) { drawCover(70, 155, 380, g.teamACover, RULES.TEAM_COVER, '我方小队', false); R.text('搭档手牌 ' + g.partner.hand.length, 70, 183, { size: 16, color: COLORS.haze, family: FONTS.mono }); drawCover(70, 555, 380, g.teamBCover, RULES.TEAM_COVER, '敌方小队', false); }
    else { drawCover(70, 155, 380, g.enemy.cover, RULES.START_COVER, '敌方掩护', false); R.text('手牌 ' + g.enemy.hand.length + ' · 情报 ' + g.enemy.intel, 70, 183, { size: 16, color: COLORS.haze, family: FONTS.mono }); drawCover(70, 555, 380, g.player.cover, RULES.START_COVER, '我方掩护', false); }
    if (state.listenHint != null) R.text('监听：对方约 ' + state.listenHint + ' 张行动牌', 70, 530, { size: 15, color: COLORS.signal, family: FONTS.mono });
    if (g.mode !== MODES.TEAM) {
      var seat2 = activeSeat(); if (seat2 && seat2.medals) {
        var m = seat2.medals; var medalText = '';
        if (!m.coldblood.done) medalText += '冷血 ' + (m.coldblood.streak || 0) + '/3  ';
        if (!m.ironwall.done) medalText += '铁壁  ';
        if (!m.codemaster.done) medalText += '暗号 ' + (m.codemaster.streak || 0) + '/2  ';
        if (medalText) R.text('🏅 ' + medalText, DESIGN_W - 250, 535, { size: 13, color: COLORS.signalDim, align: 'right', family: FONTS.mono });
      }
    }
  }

  function drawSlot(card, x, y, w, h, faceDown, label) {
    if (card) R.drawCard(card, x, y, w, h, { faceDown: faceDown, selected: false });
    else { R.ctx.save(); R.ctx.setLineDash([6, 6]); R.ctx.strokeStyle = COLORS.oliveLight; R.ctx.strokeRect(x, y, w, h); R.ctx.restore(); R.text(label || '', x + w / 2, y + h / 2, { size: 18, color: COLORS.haze, align: 'center', baseline: 'middle', family: FONTS.mono }); }
  }

  function drawFlipCard(card, x, y, w, h, faceDown, flipT) {
    var t = flipT == null ? 1 : flipT; var scale = Math.abs(Math.cos(t * Math.PI)); var drawW = Math.max(2, w * (0.15 + 0.85 * scale)); var dx = x + (w - drawW) / 2;
    R.ctx.save(); R.ctx.shadowColor = 'rgba(0,0,0,0.45)'; R.ctx.shadowBlur = 12; R.ctx.shadowOffsetY = 4;
    if (card) R.drawCard(card, dx, y, drawW, h, { faceDown: faceDown || !(t >= 0.5), selected: false });
    else { R.ctx.strokeStyle = COLORS.oliveLight; R.ctx.setLineDash([6, 6]); R.ctx.strokeRect(x, y, w, h); R.ctx.setLineDash([]); }
    R.ctx.restore();
  }

  function drawPlayArea() {
    var g = state.game; var flipT = 1;
    if (state.anim && state.anim.phase === 'result') flipT = Math.min(1, state.anim.t / 0.35);
    else if (state.anim && state.anim.phase === 'ai') flipT = 0;
    var showEnemyFace = !state.anim || state.anim.phase === 'result' ? flipT >= 0.5 : false;
    var showSelfFace = !state.anim || state.anim.phase !== 'ai';
    if (g.mode === MODES.TEAM) {
      drawSlot(g.partner.played, L.partnerSlot.x, L.partnerSlot.y, L.partnerSlot.w, L.partnerSlot.h, !showEnemyFace, '搭档');
      drawSlot(g.enemy2.played, L.enemy2Slot.x, L.enemy2Slot.y, L.enemy2Slot.w, L.enemy2Slot.h, !showEnemyFace, '敌二');
      drawSlot(g.enemy1.played, L.enemySlot.x, L.enemySlot.y, L.enemySlot.w, L.enemySlot.h, !showEnemyFace, '敌一');
      var sel = state.selectedUid ? g.player.hand.find(function(c) { return c.uid === state.selectedUid; }) : null;
      if (g.player.played) drawFlipCard(g.player.played, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, showSelfFace ? 1 : 0.2);
      else if (sel) R.drawCard(sel, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, { selected: true });
      else drawSlot(null, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, '你的行动');
    } else {
      if (g.enemy.played) drawFlipCard(g.enemy.played, L.enemySlot.x, L.enemySlot.y, L.enemySlot.w, L.enemySlot.h, true, showEnemyFace ? flipT : 0);
      else drawSlot(null, L.enemySlot.x, L.enemySlot.y, L.enemySlot.w, L.enemySlot.h, false, '待命');
      if (!showEnemyFace && g.enemy.played) R.text('?', L.enemySlot.x + L.enemySlot.w / 2, L.enemySlot.y + L.enemySlot.h / 2, { size: 48, color: COLORS.signal, align: 'center', baseline: 'middle', family: FONTS.mono, weight: '700' });
      var sel2 = state.selectedUid ? activeSeat().hand.find(function(c) { return c.uid === state.selectedUid; }) : null;
      if (g.player.played) drawFlipCard(g.player.played, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, 1);
      else if (sel2) { R.drawCard(sel2, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, { selected: true }); R.text('再点手牌收回 · 确认出击', DESIGN_W / 2, 930, { size: 15, color: COLORS.signalDim, align: 'center', family: FONTS.mono }); }
      else drawSlot(null, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, '选择手牌');
    }
    R.text('VS', DESIGN_W / 2, 540, { size: 30, color: COLORS.signal, align: 'center', baseline: 'middle', family: FONTS.mono, weight: '700', alpha: 0.75 + Math.sin(R.time * 3) * 0.15 });
    if (state.anim && g.lastResult && showEnemyFace && state.anim.phase === 'result') {
      if (g.lastResult.enemyDamage > 0) R.stampText('-' + g.lastResult.enemyDamage, DESIGN_W / 2 + 140, 260, 32, 0.95);
      if (g.lastResult.playerDamage > 0) R.stampText('-' + g.lastResult.playerDamage, DESIGN_W / 2 + 140, 680, 32, 0.95);
    }
  }

  function drawHandAndButtons() {
    var g = state.game; var seat = activeSeat(); var selectable = g.phase === 'select';
    var hand = layoutHand(seat.hand, state.selectedUid);
    hand.forEach(function(slot) { R.drawCard(slot.card, slot.x, slot.y, slot.w, slot.h, { selected: slot.selected, dim: !selectable }); });
    if (selectable) {
      var canIntel = g.mode !== MODES.TEAM && !seat.played; var intel = seat.intel; var cost = RULES.INTEL_COST;
      drawButton(R, L.btnListen, '监听 ' + cost.listen, { size: 18, disabled: !canIntel || intel < cost.listen || seat.listenUsedThisTurn });
      drawButton(R, L.btnJam, '干扰 ' + cost.jam, { size: 18, disabled: !canIntel || intel < cost.jam });
      drawButton(R, L.btnDecode, '破译 ' + cost.decode, { size: 18, disabled: !canIntel || intel < cost.decode });
      drawButton(R, L.btnDeep, '深潜', { size: 20, disabled: !!seat.played || g.mode === MODES.TEAM });
      drawButton(R, L.gameUndo, '撤回', { size: 20, disabled: !seat.played });
      drawButton(R, L.gameConfirm, '确认出击', { primary: true, size: 24, disabled: !state.selectedUid && !(seat.played && seat.played.deep) });
    } else if (state.anim) R.text('结算中…', DESIGN_W / 2, 1050, { size: 20, color: COLORS.signal, align: 'center', family: FONTS.mono });
  }

  function drawGame() { R.drawNoise(); R.drawScanlines(); R.drawDiagonalSecret(g_secret()); R.drawFrame(); drawHUD(); drawPlayArea(); drawHandAndButtons(); R.drawLog(state.log.slice(-4), 500, 200, 220); }
  function g_secret() { return state.game && state.game.mode === MODES.TEAM ? 'SQUAD' : 'EYES ONLY'; }

  function drawPassWait() {
    R.drawNoise(); R.drawFrame(); var seat = state.game.passSeat === 0 ? '玩家 A' : '玩家 B';
    drawPanel(R, 90, 380, 570, 320, '交给 ' + seat);
    R.text('请将设备递给对方', DESIGN_W / 2, 500, { size: 24, color: COLORS.dossier, align: 'center' });
    R.text('确认对方准备好后再揭开手牌', DESIGN_W / 2, 550, { size: 18, color: COLORS.haze, align: 'center' });
    drawButton(R, L.passReady, '我准备好了', { primary: true });
  }

  function drawOver() {
    R.drawNoise(); R.drawScanlines(); R.drawFrame();
    var win = state.winner === 'player'; var draw = state.winner === 'draw';
    R.drawDiagonalSecret(win ? 'CLEAR' : 'BURN');
    if (draw) R.stampText('僵局', DESIGN_W / 2, 400, 60, 0.9);
    else if (win) R.stampText('任务完成', DESIGN_W / 2, 400, 52, 0.9);
    else R.stampText('身份暴露', DESIGN_W / 2, 400, 52, 0.95);
    drawPanel(R, 130, 500, 490, 260, '行动摘要');
    var g = state.game;
    if (g && g.player && g.player.agentId) { var agent = AGENTS.find(function(a) { return a.id === g.player.agentId; }); if (agent) R.text('特工 ' + agent.name, 200, 570, { size: 18, color: agent.color || COLORS.info, family: FONTS.mono, weight: '700' }); }
    if (g && g.locationId) { var loc = getLocationById(g.locationId); R.text('地点 ' + loc.name, 400, 570, { size: 18, color: loc.color || COLORS.signal, family: FONTS.mono }); }
    R.text('回合 ' + state.stats.turns, 200, 610, { size: 20, color: COLORS.dossier });
    R.text('输出 ' + state.stats.dmgDealt, 380, 610, { size: 20, color: COLORS.dossier });
    R.text('承受 ' + state.stats.dmgTaken, 200, 650, { size: 20, color: COLORS.dossier });
    var modeName = state.mode === MODES.TEAM ? '小队行动' : state.mode === MODES.PASS ? '同屏潜伏' : '密令对决';
    R.text(modeName, 380, 650, { size: 20, color: COLORS.signal });
    if (g && g.player && g.player.medals) {
      var m = g.player.medals; var done = [];
      if (m.coldblood.done) done.push('冷血'); if (m.ironwall.done) done.push('铁壁'); if (m.codemaster.done) done.push('暗号大师');
      if (done.length) R.text('🏅 ' + done.join(' · '), 200, 700, { size: 16, color: COLORS.win, family: FONTS.sans });
    }
    drawButton(R, L.overAgain, '再次行动', { primary: true });
    drawButton(R, L.overTitle, '返回封面');
  }

  function drawSettings() { R.ctx.fillStyle = 'rgba(0,0,0,0.55)'; R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H); drawPanel(R, 120, 380, 510, 420, '设置'); drawButton(R, L.settingsSound, state.soundOn ? '音效：开' : '音效：关'); drawButton(R, L.settingsVib, state.vibrateOn ? '震动：开' : '震动：关'); drawButton(R, L.settingsClose, '关闭', { primary: true }); }

  function drawPrivacy() {
    R.ctx.fillStyle = 'rgba(0,0,0,0.72)'; R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    drawPanel(R, 70, 300, 610, 580, '用户协议与隐私政策');
    R.wrapText('欢迎来到谍网。我们仅在本机存储：是否同意协议、音效与震动偏好、对局进度。不收集手机号、通讯录或精确位置。继续即表示你已阅读并同意《用户协议》与《隐私政策》。', 110, 400, 530, 34, { size: 20, color: COLORS.dossier });
    R.text('同意后即可开始行动', 110, 620, { size: 16, color: COLORS.haze, family: FONTS.mono });
    drawButton(R, L.privacyAgree, '同意并继续', { primary: true });
    drawButton(R, L.privacyDeny, '暂不使用', { danger: true, size: 22 });
  }

  function update(dt) {
    if (state.scene === SCENES.BOOT) { state.bootT += dt; var ready = assets && assets.ready; if ((ready && state.bootT > 0.35) || state.bootT > 4) state.scene = SCENES.TITLE; }
    if (state.scene === SCENES.TITLE) state.titleT += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    toast.update(dt);
    var g = state.game;
    if (state.scene === SCENES.GAME && g && state.anim && !state.anim.done) {
      state.anim.t += dt;
      if (state.anim.phase === 'ai' && state.anim.t >= state.anim.duration) { state.anim.done = true; aiPlayAndResolve(); }
      else if (state.anim.phase === 'result' && state.anim.t >= state.anim.duration) { state.anim.done = true; finishAnim(); }
    }
  }

  function draw() {
    R.beginFrame(1 / 60); var ctx = R.ctx;
    if (state.shake > 0) { var s = state.shake * 10; ctx.translate(Math.sin(R.time * 55) * s, Math.cos(R.time * 41) * s); }
    if (state.scene === SCENES.BOOT) drawBoot();
    else if (state.scene === SCENES.TITLE) drawTitle();
    else if (state.scene === SCENES.MODE) drawMode();
    else if (state.scene === SCENES.AGENT_SELECT) drawAgentSelect();
    else if (state.scene === SCENES.RULES) drawRules();
    else if (state.scene === SCENES.GAME) drawGame();
    else if (state.scene === SCENES.PASS_WAIT) drawPassWait();
    else if (state.scene === SCENES.OVER) drawOver();
    if (state.flash > 0) { ctx.save(); ctx.globalAlpha = state.flash * 0.45; ctx.fillStyle = COLORS.stamp; ctx.fillRect(0, 0, DESIGN_W, DESIGN_H); ctx.restore(); }
    toast.draw(R, DESIGN_W / 2, 470);
    if (state.settingsOpen) drawSettings();
    if (state.privacyOpen) drawPrivacy();
  }

  var raf = 0;
  function loop(ts) { var now = ts || Date.now(); var dt = Math.min(0.05, state.lastTs ? (now - state.lastTs) / 1000 : 1 / 60); state.lastTs = now; update(dt); draw(); raf = requestAnimationFrame(loop); }

  function resize(w, h) { R.width = w; R.height = h; }

  function _internal() { return { startGame: startGame, tryPlaySelected: tryPlaySelected, skipBoot: function() { state.scene = SCENES.TITLE; } }; }

  return { state: state, start: function() { if (!raf) raf = requestAnimationFrame(loop); }, onTouchStart: onTouchStart, resize: resize, get _internal() { return _internal(); } };
}

module.exports = { createGame: createGame, SCENES: SCENES };
};
modules["./js/scenes.js"] = modules["./js/scenes.js"];
modules["./js/scenes"] = modules["./js/scenes.js"];
modules["./scenes"] = modules["./js/scenes.js"];
modules["./scenes.js"] = modules["./js/scenes.js"];
window.__spyNetModules = modules;
window.__spyNetRequire = req;
})();