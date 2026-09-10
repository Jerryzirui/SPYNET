/**
 * 谍网 — 对局引擎
 * 同时翻开 · 暗号频段 · 暴露度 · 深潜 · 情报行动 · 连击/连守
 * 扩展：特工被动 · 地点效果 · 成就追踪
 */

const { RULES, AGENTS, LOCATIONS, MEDALS } = require('./config');
const { buildDeck, shuffle, CARD_TYPES, BANDS } = require('./cards');

function createPlayer(name, isAI) {
  return {
    name, isAI, cover: RULES.START_COVER, hand: [], deck: [], discard: [],
    played: null, intel: RULES.START_INTEL, exposure: 0,
    jamActive: false, jamIncoming: false, cleanLast: false,
    lastPlayedId: null, lastPlayedType: null, dealtDamageLast: false,
    listenUsedThisTurn: false, deepUsedStreak: 0,
    agentId: null, deepMatchNext: false,
    medals: { coldblood: { streak: 0, done: false }, codemaster: { streak: 0, done: false }, ironwall: { done: false } },
  };
}

function makeDeepCover() {
  return { uid: -999, id: '__deep', name: '深潜', type: CARD_TYPES.UTIL, band: null, deep: true, dmg: 0, heal: 0, short: '清暴露 · 抽 2 · 免疫行动', text: '切断联络进入深潜：暴露清零，抽 2 张，免疫对方行动伤害。' };
}

function drawCards(player, n, log) {
  for (let i = 0; i < n; i += 1) {
    if (player.deck.length === 0) { if (player.discard.length === 0) break; player.deck = shuffle(player.discard); player.discard = []; if (log) log.push(player.name + ' 将弃牌堆洗回牌库'); }
    if (player.hand.length >= RULES.MAX_HAND) break; const c = player.deck.pop(); if (c) player.hand.push(c);
  }
}
function removeCard(hand, card) { const idx = hand.findIndex((c) => c.uid === card.uid); if (idx >= 0) hand.splice(idx, 1); }
function randomFrom(arr, rng) { if (!arr.length) return null; const r = rng || Math.random; return arr[Math.floor(r() * arr.length)]; }
function isAttack(card) { return card && card.type === CARD_TYPES.ATK; }
function countAttackInHand(hand) { return hand.filter((c) => c.type === CARD_TYPES.ATK).length; }
function gainIntel(player, n, log) { const before = player.intel; player.intel = Math.min(RULES.MAX_INTEL, player.intel + n); const gained = player.intel - before; if (gained > 0 && log) log.push(player.name + ' 情报 +' + gained); }
function addExposure(player, n, log) { if (!n) return; const before = player.exposure; player.exposure = Math.max(0, Math.min(RULES.MAX_EXPOSURE, player.exposure + n)); const d = player.exposure - before; if (d > 0) log.push(player.name + ' 暴露 +' + d + '（' + player.exposure + '）'); else if (d < 0) log.push(player.name + ' 暴露 ' + d + '（' + player.exposure + '）'); }
function nextWatchword(prev) { const i = BANDS.indexOf(prev); return BANDS[(i + 1) % BANDS.length]; }
function matchesWatch(card, watch) { return !!(card && card.band && card.band === watch); }

function applyWatchBoost(card, watch, log, who, locationId) {
  if (!card || card.deep || card.copied) return card; const matched = matchesWatch(card, watch);
  if (!matched && card.autoMatch) { card = Object.assign({}, card, { autoMatch: false }); return applyWatchBoost(card, watch, log, who, locationId); }
  if (!matched) return card; let bonus = 1; if (locationId === 'encrypted') bonus += 1;
  const out = Object.assign({}, card, { watchHit: true });
  if (out.dmg) { out.dmg += bonus; log.push(who + ' 暗号命中，【' + card.name + '】伤害 +' + bonus); }
  else if (out.heal) { out.heal += bonus; log.push(who + ' 暗号命中，【' + card.name + '】治疗 +' + bonus); }
  else if (out.id === 'otp') { out.watchDraw = true; log.push(who + ' 暗号命中，密码本多抽 1 张'); if (locationId === 'encrypted') out.watchDrawExtra = true; }
  else { log.push(who + ' 暗号命中：【' + card.name + '】'); }
  return out;
}

function useIntelAction(state, side, kind) {
  if (state.phase !== 'select') return { ok: false, msg: '当前无法使用情报' };
  const me = side === 'player' ? state.player : state.enemy; const opp = side === 'player' ? state.enemy : state.player;
  let cost = RULES.INTEL_COST[kind]; if (cost == null) return { ok: false, msg: '未知行动' };
  if (state.locationId === 'blackmarket') { const d = cost - 1; cost = Math.max(1, d); }
  if (state.locationId === 'jamming' && kind === 'jam' && !me.jamActive && !me.jamFreeUsed) { cost = 0; me.jamFreeUsed = true; }
  if (me.intel < cost) return { ok: false, msg: '情报点不足' };
  if (kind === 'listen' && me.listenUsedThisTurn) return { ok: false, msg: '本回合已监听过' };
  if (kind === 'jam' && me.jamActive) return { ok: false, msg: '干扰已生效' };
  me.intel -= cost;
  if (kind === 'listen') { me.listenUsedThisTurn = true; const n = countAttackInHand(opp.hand); return { ok: true, msg: '监听：对方约 ' + n + ' 张行动牌', listenResult: n }; }
  if (kind === 'jam') { me.jamActive = true; opp.jamIncoming = true; return { ok: true, msg: '干扰就绪：对方本回合行动伤害 -1' }; }
  if (kind === 'decode') { drawCards(me, 1); return { ok: true, msg: '破译完成：抽 1 张' }; }
  return { ok: false, msg: '失败' };
}

function playDeepCover(state, side) { if (state.phase !== 'select') return false; const me = side === 'player' ? state.player : state.enemy; if (me.played) return false; me.played = makeDeepCover(); return true; }

function resolveRound(state, rng) {
  const log = []; const p = state.player; const e = state.enemy; const pCard = p.played; const eCard = e.played; const watch = state.watchword; const locId = state.locationId;
  if (!pCard || !eCard) return { events: ['双方需各就位'], gameOver: false };
  if (locId === 'listeningpost') { if (p.exposure >= 3 && !p.listenUsedThisTurn) { p.listenUsedThisTurn = true; const n = countAttackInHand(e.hand); log.push('监听站：我方暴露 ≥3，自动获取情报（对方 ' + n + ' 张行动牌）'); state.listenHint = n; } if (e.exposure >= 3 && !e.listenUsedThisTurn) e.listenUsedThisTurn = true; }
  const pDeep = !!pCard.deep; const eDeep = !!eCard.deep;
  if (pDeep) log.push('我方进入【深潜】'); else log.push('我方打出【' + pCard.name + '】');
  if (eDeep) log.push('敌方进入【深潜】'); else log.push('敌方打出【' + eCard.name + '】');
  log.push('值班暗号：「' + watch + '」');
  if (pDeep && p.exposure > 0) { p.exposure = 0; log.push('我方暴露清零'); } if (eDeep && e.exposure > 0) { e.exposure = 0; log.push('敌方暴露清零'); }
  if (pDeep && p.agentId === 'chameleon') p.deepMatchNext = true; if (eDeep && e.agentId === 'chameleon') e.deepMatchNext = true;
  let pEff = pCard; let eEff = eCard; const pIsMirror = !pDeep && pCard.id === 'mirror'; const eIsMirror = !eDeep && eCard.id === 'mirror';
  if (pIsMirror && eIsMirror) { log.push('镜像人相互抵消'); pEff = null; eEff = null; }
  else if (pIsMirror && !eDeep) { pEff = Object.assign({}, eCard, { name: '镜像·' + eCard.name, copied: true, band: eCard.band }); log.push('我方镜像人复制了【' + eCard.name + '】'); }
  else if (eIsMirror && !pDeep) { eEff = Object.assign({}, pCard, { name: '镜像·' + pCard.name, copied: true, band: pCard.band }); log.push('敌方镜像人复制了【' + pCard.name + '】'); }
  if (p.deepMatchNext && !pDeep && pEff && !pEff.copied) { pEff = Object.assign({}, pEff, { autoMatch: true }); p.deepMatchNext = false; log.push('变色龙被动：本牌自动匹配暗号'); }
  if (e.deepMatchNext && !eDeep && eEff && !eEff.copied) { eEff = Object.assign({}, eEff, { autoMatch: true }); e.deepMatchNext = false; }
  if (!pDeep && pEff) pEff = applyWatchBoost(pEff, watch, log, '我方', locId);
  if (!eDeep && eEff) eEff = applyWatchBoost(eEff, watch, log, '敌方', locId);
  const pBlocked = pEff && pEff.id === 'deepsleep'; const eBlocked = eEff && eEff.id === 'deepsleep';
  if (pEff && pEff.watchHit && !pDeep) p.medals.codemaster.streak += 1; else p.medals.codemaster.streak = 0;
  if (eEff && eEff.watchHit && !eDeep) e.medals.codemaster.streak += 1; else e.medals.codemaster.streak = 0;
  if (pEff && pEff.id === 'silence' && e.lastPlayedType === CARD_TYPES.ATK) { pEff = Object.assign({}, pEff, { dmg: (pEff.dmg || 0) + 1 }); log.push('静默清除针对对方上回合行动，伤害 +1'); }
  if (eEff && eEff.id === 'silence' && p.lastPlayedType === CARD_TYPES.ATK) { eEff = Object.assign({}, eEff, { dmg: (eEff.dmg || 0) + 1 }); log.push('敌方静默清除针对我方上回合行动，伤害 +1'); }

  // 连击（所有特工统一 +1）
  if (pEff && pEff.type === CARD_TYPES.ATK && p.dealtDamageLast && !pDeep) { const extra = 1; pEff = Object.assign({}, pEff, { dmg: (pEff.dmg || 0) + extra }); log.push('我方连击，行动伤害 +' + extra); }
  if (eEff && eEff.type === CARD_TYPES.ATK && e.dealtDamageLast && !eDeep) { const extra = 1; eEff = Object.assign({}, eEff, { dmg: (eEff.dmg || 0) + extra }); log.push('敌方连击，行动伤害 +' + extra); }

  const pGB = p.cleanLast && !pDeep; const eGB = e.cleanLast && !eDeep;
  const pJ = !!p.jamIncoming; const eJ = !!e.jamIncoming; const pIm = pDeep; const eIm = eDeep;
  const pB = pEff && pEff.id === 'bait'; const eB = eEff && eEff.id === 'bait'; let pR = 0; let eR = 0;
  if (pB && !pDeep) { if (isAttack(eEff) && !eDeep) { let d = eEff.dmg || 0; if (eJ) d = Math.max(0, d - RULES.JAM_ATTACK_REDUCE); eR += d; log.push('我方饵雷生效，反弹 ' + d + ' 点'); } else { eR += 1; log.push('我方饵雷落空，仍造成 1 点'); } }
  if (eB && !eDeep) { if (isAttack(pEff) && !pDeep) { let d = pEff.dmg || 0; if (pJ) d = Math.max(0, d - RULES.JAM_ATTACK_REDUCE); pR += d; log.push('敌方饵雷生效，反弹 ' + d + ' 点'); } else { pR += 1; log.push('敌方饵雷落空，仍造成 1 点'); } }
  if (pEff && pEff.id === 'flip' && !pDeep) { let d = 1; if (p.hand.length < e.hand.length) d = 2; eR += d; const s = randomFrom(e.hand, rng); if (s) { removeCard(e.hand, s); p.hand.push(s); log.push('我方翻转线人，夺得【' + s.name + '】并造成 ' + d + ' 点'); } else log.push('我方翻转扑空，仍造成 ' + d + ' 点'); }
  if (eEff && eEff.id === 'flip' && !eDeep) { let d = 1; if (e.hand.length < p.hand.length) d = 2; pR += d; const s = randomFrom(p.hand, rng); if (s) { removeCard(p.hand, s); e.hand.push(s); log.push('敌方翻转线人，夺得【' + s.name + '】并造成 ' + d + ' 点'); } else log.push('敌方翻转扑空，仍造成 ' + d + ' 点'); }
  let pD = 0; let eD = 0;
  if (isAttack(pEff) && !pB && !eB && !pDeep) { if (eBlocked || eIm) log.push(eIm ? '敌方深潜，我方行动落空' : '我方【' + pEff.name + '】被深眠挡下'); else { pD = pEff.dmg || 0; if (pJ) { pD = Math.max(0, pD - RULES.JAM_ATTACK_REDUCE); log.push('干扰生效，我方伤害 -' + RULES.JAM_ATTACK_REDUCE); } if (pD > 0) log.push('我方【' + pEff.name + '】命中，' + pD + ' 点'); } }
  if (isAttack(eEff) && !eB && !pB && !eDeep) { if (pBlocked || pIm) log.push(pIm ? '我方深潜，敌方行动落空' : '敌方【' + eEff.name + '】被深眠挡下'); else { eD = eEff.dmg || 0; if (eJ) { eD = Math.max(0, eD - RULES.JAM_ATTACK_REDUCE); log.push('干扰生效，敌方伤害 -' + RULES.JAM_ATTACK_REDUCE); } if (eD > 0) log.push('敌方【' + eEff.name + '】命中，' + eD + ' 点'); } }
  if (pBlocked) { eR += 1; log.push('我方深眠反弹 1 点'); } if (eBlocked) { pR += 1; log.push('敌方深眠反弹 1 点'); }
  if (isAttack(pEff) && pD > 0 && pEff.onHitDiscard && e.hand.length > 0) { const dr = randomFrom(e.hand, rng); if (dr) { removeCard(e.hand, dr); e.discard.push(dr); log.push('碎纸机粉碎敌方【' + dr.name + '】'); } }
  if (isAttack(eEff) && eD > 0 && eEff.onHitDiscard && p.hand.length > 0) { const dr = randomFrom(p.hand, rng); if (dr) { removeCard(p.hand, dr); p.discard.push(dr); log.push('碎纸机粉碎我方【' + dr.name + '】'); } }
  if (pEff && pEff.id === 'otp' && !pDeep) { const n = (pGB ? 3 : 2) + (pEff.watchDraw ? 1 : 0) + (pEff.watchDrawExtra ? 1 : 0); drawCards(p, n, log); log.push('我方启用密码本，抽 ' + n + ' 张'); }
  if (eEff && eEff.id === 'otp' && !eDeep) { const n = (eGB ? 3 : 2) + (eEff.watchDraw ? 1 : 0) + (eEff.watchDrawExtra ? 1 : 0); drawCards(e, n, log); log.push('敌方启用密码本，抽 ' + n + ' 张'); }
  if (pEff && pEff.id === 'vanish' && !pDeep) { const n = p.hand.length; p.discard = p.discard.concat(p.hand); p.hand = []; drawCards(p, 5, log); p.cover = Math.min(RULES.START_COVER + 6, p.cover + 2); p.exposure = 0; log.push('我方蒸发协议（弃 ' + n + ' 抽 5，+2 掩护，暴露清零）'); }
  if (eEff && eEff.id === 'vanish' && !eDeep) { const n = e.hand.length; e.discard = e.discard.concat(e.hand); e.hand = []; drawCards(e, 5, log); e.cover = Math.min(RULES.START_COVER + 6, e.cover + 2); e.exposure = 0; log.push('敌方蒸发协议'); }
  // 安全屋 / 深眠治疗（所有特工统一 +1）
  if (pEff && pEff.heal && !pDeep) { let h = pEff.heal; if (pGB && (pEff.id === 'safehouse' || pEff.id === 'deepsleep')) h += 1; p.cover = Math.min(RULES.START_COVER + 6, p.cover + h); log.push('我方恢复 ' + h + ' 点掩护'); if (pEff.id === 'safehouse') addExposure(p, -1, log); }
  if (eEff && eEff.heal && !eDeep) { let h = eEff.heal; if (eGB && (eEff.id === 'safehouse' || eEff.id === 'deepsleep')) h += 1; e.cover = Math.min(RULES.START_COVER + 6, e.cover + h); log.push('敌方恢复 ' + h + ' 点掩护'); if (eEff.id === 'safehouse') addExposure(e, -1, log); }
  if (pBlocked && pGB) { p.cover = Math.min(RULES.START_COVER + 6, p.cover + 1); log.push('我方连守，额外 +1 掩护'); }
  if (eBlocked && eGB) { e.cover = Math.min(RULES.START_COVER + 6, e.cover + 1); log.push('敌方连守，额外 +1 掩护'); }
  if (pDeep) { drawCards(p, RULES.DEEP_COVER_DRAW, log); log.push('我方深潜，抽 ' + RULES.DEEP_COVER_DRAW + ' 张'); } if (eDeep) { drawCards(e, RULES.DEEP_COVER_DRAW, log); log.push('敌方深潜，抽 ' + RULES.DEEP_COVER_DRAW + ' 张'); }
  let pT = 0; let eT = 0;
  if (pBlocked || pIm) pT = pR; else pT = eD + pR; if (eBlocked || eIm) eT = eR; else eT = pD + eR;
  if ((pD + pR) - pT >= 4 && !p.medals.ironwall.done) { p.medals.ironwall.done = true; log.push('🏅 成就「铁壁」达成：单回合免伤 ≥4，+2 情报'); gainIntel(p, 2, log); }
  if ((eD + eR) - eT >= 4 && !e.medals.ironwall.done) { e.medals.ironwall.done = true; gainIntel(e, 2); }
  p.cover -= pT; e.cover -= eT; if (pT) log.push('我方掩护 -' + pT); if (eT) log.push('敌方掩护 -' + eT);
  function ef(c, d) { if (d) return 0; if (!c) return 0; if (c.copied) return 1; if (c.type === CARD_TYPES.ATK) return RULES.EXPO_ATK; if (c.type === CARD_TYPES.TRICK) return RULES.EXPO_TRICK; if (c.id === 'safehouse') return -1; return 0; }
  addExposure(p, ef(pCard, pDeep), log); addExposure(e, ef(eCard, eDeep), log);
  if (p.agentId === 'ghost' && p.exposure > 0) p.exposure = Math.ceil(p.exposure / 2); if (e.agentId === 'ghost' && e.exposure > 0) e.exposure = Math.ceil(e.exposure / 2);
  p.dealtDamageLast = eT > 0; e.dealtDamageLast = pT > 0; p.cleanLast = pT === 0; e.cleanLast = eT === 0;
  if (eT > 0) gainIntel(p, 1, log); if (pT > 0) gainIntel(e, 1, log);
  if (p.agentId === 'weaver' && pEff && pEff.watchHit && !pDeep) { drawCards(p, 1, log); log.push('织网者：暗号匹配，额外抽 1 张'); } if (e.agentId === 'weaver' && eEff && eEff.watchHit && !eDeep) drawCards(e, 1, log);
  if (p.agentId === 'mole') { gainIntel(p, 1, log); log.push('鼹鼠：情报 +1（被动）'); } if (e.agentId === 'mole') gainIntel(e, 1, log);
  if (pEff && pEff.type === CARD_TYPES.ATK && !pDeep) { p.medals.coldblood.streak += 1; if (p.medals.coldblood.streak >= 3 && !p.medals.coldblood.done) { p.medals.coldblood.done = true; drawCards(p, 1, log); log.push('🏅 成就「冷血」达成：连续 3 回合行动，抽 1 张'); } } else if (!pDeep) p.medals.coldblood.streak = 0;
  if (eEff && eEff.type === CARD_TYPES.ATK && !eDeep) { e.medals.coldblood.streak += 1; if (e.medals.coldblood.streak >= 3 && !e.medals.coldblood.done) { e.medals.coldblood.done = true; drawCards(e, 1); } } else if (!eDeep) e.medals.coldblood.streak = 0;
  if (p.medals.codemaster.streak >= 2 && !p.medals.codemaster.done) { p.medals.codemaster.done = true; drawCards(p, 1, log); log.push('🏅 成就「暗号大师」达成：连续 2 次暗号匹配，抽 1 张'); }
  if (e.medals.codemaster.streak >= 2 && !e.medals.codemaster.done) { e.medals.codemaster.done = true; drawCards(e, 1); }
  p.lastPlayedId = pCard.id; p.lastPlayedType = pDeep ? null : pCard.type; e.lastPlayedId = eCard.id; e.lastPlayedType = eDeep ? null : eCard.type;
  p.jamActive = false; e.jamActive = false; p.jamIncoming = false; e.jamIncoming = false; p.listenUsedThisTurn = false; e.listenUsedThisTurn = false;
  if (state.locationId === 'jamming') { p.jamFreeUsed = false; e.jamFreeUsed = false; }
  if (!pDeep) p.discard.push(pCard); if (!eDeep) e.discard.push(eCard); p.played = null; e.played = null;
  drawCards(p, 1, log); drawCards(e, 1, log);
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
  state.watchword = nextWatchword(watch);
  const gO = state.teamACover <= 0 || state.teamBCover <= 0; let w = null; if (gO) { if (state.teamACover <= 0 && state.teamBCover <= 0) w = 'draw'; else if (state.teamBCover <= 0) w = 'player'; else w = 'enemy'; }
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