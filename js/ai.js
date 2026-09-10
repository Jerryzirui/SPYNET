/**
 * 谍网 — AI 决策
 * 扩展：特工感知 · 地点感知 · 局势判断
 */

const { CARD_TYPES, resolveId } = require('./cards');
const { AGENTS } = require('./config');

function scoreCard(card, me, opp, watch, locationId) {
  let score = Math.random() * 1.1;
  const lowSelf = me.cover <= 4;
  const midSelf = me.cover <= 8;
  const lowOpp = opp.cover <= 4;
  const midOpp = opp.cover <= 8;
  const fewCards = me.hand.length <= 2;
  const momentumAtk = !!me.dealtDamageLast;
  const momentumDef = !!me.cleanLast;
  const oppLastAtk = opp.lastPlayedType === CARD_TYPES.ATK;
  const highExpo = (me.exposure || 0) >= 3;
  const id = resolveId(card.id);

  // 暗号匹配优先
  if (watch && card.band === watch) score += 1.4;

  // 特工感知：猎手更倾向行动牌
  if (me.agentId === 'hunter' && card.type === CARD_TYPES.ATK) score += 0.8;
  if (me.agentId === 'hunter' && card.type === CARD_TYPES.DEF) score -= 0.4;

  // 地点感知：加密频道时更看重暗号匹配
  if (locationId === 'encrypted' && card.band === watch) score += 0.6;

  switch (id) {
    case 'silence':
      score += 3.0;
      if (lowOpp) score += 3.2;
      if (midOpp) score += 1.0;
      if (lowSelf) score -= 1.8;
      if (highExpo) score -= 1.2;
      if (oppLastAtk) score += 1.4;
      if (momentumAtk) score += 1.1;
      // 猎手连击时更激进
      if (me.agentId === 'hunter' && momentumAtk) score += 1.0;
      break;
    case 'shredder':
      score += 2.2;
      if (opp.hand.length >= 4) score += 1.0;
      if (lowOpp) score += 1.4;
      if (momentumAtk) score += 0.7;
      if (highExpo) score -= 0.5;
      break;
    case 'deadletter':
      score += 1.9;
      if (midOpp) score += 0.7;
      if (momentumAtk) score += 0.5;
      // 监听站/暴露高时优先低暴露行动
      if (highExpo && card.band !== watch) score -= 0.4;
      break;
    case 'deepsleep':
      score += 1.5;
      if (lowSelf) score += 3.6;
      if (midSelf) score += 1.4;
      if (momentumDef) score += 1.3;
      if (momentumAtk) score -= 0.4;
      // 安全屋网络时降低深眠偏好（反正能回血）
      if (locationId === 'safehouse_net' && !lowSelf) score -= 0.6;
      break;
    case 'safehouse':
      score += 1.1;
      if (lowSelf) score += 3.0;
      if (midSelf) score += 1.3;
      if (me.cover >= 11) score -= 1.1;
      if (highExpo) score += 1.5;
      if (momentumDef) score += 0.9;
      break;
    case 'bait':
      score += 1.7;
      if (midSelf || lowSelf) score += 1.1;
      if (oppLastAtk) score += 0.9;
      // 知道对方猎手时提高饵雷优先级
      if (opp.agentId === 'hunter') score += 0.7;
      break;
    case 'flip':
      score += 1.4;
      if (opp.hand.length >= 4) score += 1.5;
      if (fewCards) score += 0.8;
      break;
    case 'mirror':
      score += 0.9;
      if (opp.hand.length >= 5) score += 1.2;
      break;
    case 'otp':
      score += 1.3;
      if (fewCards) score += 2.4;
      if (me.hand.length <= 4) score += 0.7;
      if (momentumDef) score += 0.9;
      // 织网者暗号匹配时密码本效果更好
      if (me.agentId === 'weaver' && card.band === watch) score += 1.0;
      break;
    case 'vanish':
      score += 0.3;
      if (fewCards && (lowSelf || highExpo)) score += 3.2;
      if (me.hand.length <= 3) score += 0.8;
      break;
    default:
      break;
  }

  return score;
}

/** 是否倾向深潜（考虑特工与地点） */
function shouldDeepCover(me, opp, locationId) {
  // 变色龙：深潜后下回合暗号自动匹配，更倾向深潜
  if (me.agentId === 'chameleon') {
    if ((me.exposure || 0) >= 3) return Math.random() < 0.75;
    if (me.hand.length <= 1) return Math.random() < 0.6;
  }
  if ((me.exposure || 0) >= 4) return Math.random() < 0.7;
  if ((me.exposure || 0) >= 3 && me.cover <= 6) return Math.random() < 0.45;
  if (me.hand.length === 0) return true;
  // 监听站：暴露高时少深潜（反正能自动监听）
  if (locationId === 'listeningpost' && (me.exposure || 0) >= 3 && me.cover > 6) return Math.random() < 0.2;
  return false;
}

function chooseCard(hand, me, opp, watch, locationId) {
  if (!hand.length) return null;
  let best = hand[0];
  let bestScore = -Infinity;
  hand.forEach((card) => {
    const s = scoreCard(card, me, opp, watch, locationId);
    if (s > bestScore) {
      bestScore = s;
      best = card;
    }
  });
  return best;
}

module.exports = { chooseCard, scoreCard, shouldDeepCover };