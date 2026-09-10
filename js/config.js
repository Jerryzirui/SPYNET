/**
 * 谍网 — 设计令牌与全局配置
 */

const DESIGN_W = 750;
const DESIGN_H = 1334;

const COLORS = {
  void: '#0A100E',
  voidSoft: '#121A16',
  dossier: '#C8B896',
  dossierDim: '#8A7B60',
  paper: '#EDE4CE',
  ink: '#141814',
  stamp: '#A63A28',
  stampBright: '#D4523A',
  signal: '#D4B06A',
  signalDim: '#8A7340',
  olive: '#1E2E26',
  oliveLight: '#334A3C',
  haze: '#7A8A80',
  white: '#F4F0E4',
  black: '#030605',
  win: '#6BBF82',
  lose: '#D4523A',
  info: '#6A9BB8',
  teamBlue: '#6A9BB8',
  teamRed: '#C45C4A',
};

const FONTS = {
  mono: 'Courier New, Consolas, monospace',
  sans: 'PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif',
};

const RULES = {
  START_COVER: 12,
  START_HAND: 5,
  MAX_HAND: 7,
  DECK_SIZE: 40,
  START_INTEL: 3,
  MAX_INTEL: 6,
  INTEL_COST: {
    listen: 1,
    jam: 2,
    decode: 1,
  },
  JAM_ATTACK_REDUCE: 1,
  TEAM_COVER: 18,
  TEAM_START_INTEL: 4,
  // 暴露度
  MAX_EXPOSURE: 5,
  EXPO_ATK: 2,
  EXPO_TRICK: 1,
  EXPO_LISTEN_FREE: 3, // ≥3 对方可免费监听一次（引擎内处理）
  EXPO_REVEAL: 5, // ≥5 下一张行动牌类型对敌可见（提示）
  // 深潜
  DEEP_COVER_DRAW: 2,
  DEEP_COVER_ENEMY_DMG_HALF: true,
};

const MODES = {
  SOLO: 'solo',
  PASS: 'pass',
  TEAM: 'team',
};

// ===== 特工角色系统 =====
const AGENTS = [
  {
    id: 'ghost',
    name: '幽灵',
    title: '暗影无形',
    desc: '暴露度影响减半（向上取整）',
    passive: 'exposure_half',
    color: '#8A9AA8',
  },
  {
    id: 'mole',
    name: '鼹鼠',
    title: '情报渗透',
    desc: '每回合自动获得 1 情报点',
    passive: 'intel_regen',
    color: '#6A9BB8',
  },
  {
    id: 'hunter',
    name: '猎手',
    title: '猎杀本能',
    desc: '连击伤害 +2，连守掩护 +2',
    passive: 'combo_boost',
    color: '#C45C4A',
  },
  {
    id: 'weaver',
    name: '织网者',
    title: '天罗地网',
    desc: '暗号匹配时额外抽 1 张',
    passive: 'watch_draw',
    color: '#8B6AAF',
  },
  {
    id: 'chameleon',
    name: '变色龙',
    title: '身份伪装',
    desc: '深潜后下回合首张牌自动匹配暗号',
    passive: 'deep_match',
    color: '#5A8A6A',
  },
];

// ===== 战场环境系统 =====
const LOCATIONS = [
  {
    id: 'blackmarket',
    name: '黑市',
    desc: '情报行动费用 -1（最低 1）',
    effect: 'intel_discount',
    color: '#C4A35A',
  },
  {
    id: 'listeningpost',
    name: '监听站',
    desc: '暴露 ≥ 3 时自动免费监听',
    effect: 'auto_listen',
    color: '#6A9BB8',
  },
  {
    id: 'encrypted',
    name: '加密频道',
    desc: '暗号匹配时效果额外 +1',
    effect: 'watch_boost',
    color: '#8B6AAF',
  },
  {
    id: 'safehouse_net',
    name: '安全屋网络',
    desc: '每回合结束恢复 1 掩护',
    effect: 'passive_heal',
    color: '#3A5244',
  },
  {
    id: 'jamming',
    name: '信号干扰区',
    desc: '首次干扰不消耗情报点',
    effect: 'free_jam',
    color: '#A63A28',
  },
];

// ===== 成就勋章系统 =====
const MEDALS = [
  {
    id: 'coldblood',
    name: '冷血',
    desc: '连续 3 回合打出行牌',
    reward: '抽 1 张',
    check: 'streak_atk',
    threshold: 3,
  },
  {
    id: 'ironwall',
    name: '铁壁',
    desc: '单回合免伤 ≥ 4 点',
    reward: '+2 情报',
    check: 'block_roll',
    threshold: 4,
  },
  {
    id: 'codemaster',
    name: '暗号大师',
    desc: '连续 2 次暗号匹配',
    reward: '抽 1 张',
    check: 'streak_watch',
    threshold: 2,
  },
];

module.exports = {
  DESIGN_W,
  DESIGN_H,
  COLORS,
  FONTS,
  RULES,
  MODES,
  AGENTS,
  LOCATIONS,
  MEDALS,
};