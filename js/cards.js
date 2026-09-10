/**
 * 谍网 — 卡池（自有命名 + 暗号频段）
 * band: 与每回合「值班暗号」匹配时，主效果 +1
 */

const CARD_TYPES = {
  ATK: 'atk',
  DEF: 'def',
  TRICK: 'trick',
  UTIL: 'util',
};

const TYPE_LABEL = {
  atk: '行动',
  def: '掩护',
  trick: '诡计',
  util: '后勤',
};

const TYPE_COLOR = {
  atk: '#A63A28',
  def: '#3A5244',
  trick: '#C4A35A',
  util: '#4A6A8A',
};

// 暗号频段：甲 / 乙 / 丙
const BANDS = ['甲', '乙', '丙'];
const BAND_COLORS = {
  甲: '#C4A35A',
  乙: '#6A9BB8',
  丙: '#8B6AAF',
};

const CARD_DEFS = {
  deadletter: {
    id: 'deadletter',
    name: '死信箱',
    type: CARD_TYPES.ATK,
    dmg: 2,
    band: '甲',
    copies: 7,
    short: '造成 2 点 · 暗号+1',
    text: '投递死信箱。造成 2 点掩护损伤；若匹配值班暗号，伤害 +1。',
  },
  silence: {
    id: 'silence',
    name: '静默清除',
    type: CARD_TYPES.ATK,
    dmg: 4,
    band: '丙',
    copies: 4,
    short: '造成 4 点 · 暗号+1',
    text: '静默清除令。造成 4 点损伤；匹配暗号则 +1。深眠可完全挡下。暴露 +2。',
  },
  shredder: {
    id: 'shredder',
    name: '碎纸机',
    type: CARD_TYPES.ATK,
    dmg: 3,
    onHitDiscard: true,
    band: '乙',
    copies: 4,
    short: '造成 3 点 · 命中碎牌',
    text: '碎纸机行动：造成 3 点；命中时对方随机碎掉 1 张手牌。匹配暗号 +1。',
  },
  deepsleep: {
    id: 'deepsleep',
    name: '深眠',
    type: CARD_TYPES.DEF,
    band: '甲',
    copies: 5,
    short: '免疫本回合 · 反弹 1',
    text: '进入深眠：免疫对方全部行动伤害并反弹 1 点。匹配暗号则再 +1 掩护。',
  },
  safehouse: {
    id: 'safehouse',
    name: '安全屋',
    type: CARD_TYPES.DEF,
    heal: 3,
    band: '丙',
    copies: 4,
    short: '恢复 3 点 · 降暴露',
    text: '退回安全屋：恢复 3 点掩护，并使暴露 -1。匹配暗号则治疗 +1。',
  },
  bait: {
    id: 'bait',
    name: '饵雷',
    type: CARD_TYPES.TRICK,
    band: '乙',
    copies: 4,
    short: '遇攻击则反弹',
    text: '饵雷情报：若对方本回合打出行动牌，伤害原样反弹；否则造成 1 点。匹配暗号则反弹/伤害 +1。',
  },
  flip: {
    id: 'flip',
    name: '翻转线人',
    type: CARD_TYPES.TRICK,
    band: '丙',
    copies: 3,
    short: '夺 1 张 · 造成 1 点',
    text: '翻转对方线人：随机夺取 1 张手牌并造成 1 点（手牌劣势时 2 点）。匹配暗号 +1。',
  },
  mirror: {
    id: 'mirror',
    name: '镜像人',
    type: CARD_TYPES.TRICK,
    band: '甲',
    copies: 3,
    short: '复制对方本回合的牌',
    text: '镜像人：复制对方本回合的牌。双方皆为镜像人则抵消。',
  },
  otp: {
    id: 'otp',
    name: '密码本',
    type: CARD_TYPES.UTIL,
    band: '乙',
    copies: 4,
    short: '抽 2 张',
    text: '启用一次性密码本：抽 2 张。匹配暗号则抽 3 张。',
  },
  vanish: {
    id: 'vanish',
    name: '蒸发协议',
    type: CARD_TYPES.UTIL,
    band: '丙',
    copies: 2,
    short: '弃光抽 5 · +2 掩护 · 清暴露',
    text: '蒸发协议：弃光手牌抽 5，+2 掩护，暴露清零。',
  },
};

// 旧 id 兼容映射（引擎/测试/图片文件名）
const LEGACY_MAP = {
  intel: 'deadletter',
  assassin: 'silence',
  cleaner: 'shredder',
  lurk: 'deepsleep',
  fake: 'bait',
  defect: 'flip',
  double: 'mirror',
  cipher: 'otp',
  evac: 'vanish',
};

function resolveId(id) {
  return LEGACY_MAP[id] || id;
}

const CARD_LIST = Object.keys(CARD_DEFS).map((k) => CARD_DEFS[k]);

function buildDeck() {
  const deck = [];
  let uid = 1;
  CARD_LIST.forEach((def) => {
    for (let i = 0; i < def.copies; i += 1) {
      deck.push({
        uid: uid++,
        id: def.id,
        name: def.name,
        type: def.type,
        dmg: def.dmg || 0,
        heal: def.heal || 0,
        onHitDiscard: !!def.onHitDiscard,
        band: def.band,
        short: def.short,
        text: def.text,
      });
    }
  });
  return deck;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  const random = rng || Math.random;
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function getCard(id) {
  return CARD_DEFS[resolveId(id)];
}

module.exports = {
  CARD_TYPES,
  TYPE_LABEL,
  TYPE_COLOR,
  BANDS,
  BAND_COLORS,
  CARD_DEFS,
  CARD_LIST,
  LEGACY_MAP,
  resolveId,
  buildDeck,
  shuffle,
  getCard,
};
