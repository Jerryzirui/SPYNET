/**
 * 谍网 — 引擎自测
 * 用法: node tools/test-engine.js
 */

const path = require('path');
const root = path.join(__dirname, '..');

const { newGame, playerPlay, resolveRound, drawCards, useIntelAction } = require(path.join(root, 'js/engine.js'));
const { CARD_DEFS, buildDeck, shuffle, resolveId } = require(path.join(root, 'js/cards.js'));
const { chooseCard } = require(path.join(root, 'js/ai.js'));
const { RULES } = require(path.join(root, 'js/config.js'));

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log('  ✓', msg);
  } else {
    failed += 1;
    console.log('  ✗', msg);
  }
}

function makeCard(id, uid) {
  const def = CARD_DEFS[resolveId(id)];
  return {
    uid: uid || Math.floor(Math.random() * 1e9),
    id: def.id,
    name: def.name,
    type: def.type,
    dmg: def.dmg || 0,
    heal: def.heal || 0,
    onHitDiscard: !!def.onHitDiscard,
    band: def.band,
    short: def.short,
    text: def.text,
  };
}

function forcePlay(state, pId, eId) {
  state.player.played = makeCard(pId, 100);
  state.enemy.played = makeCard(eId, 200);
  return resolveRound(state);
}

console.log('\n[牌组]');
const deck = buildDeck();
assert(deck.length === 40, '牌库共 40 张，实际 ' + deck.length);
assert(shuffle(deck).length === 40, '洗牌后仍为 40 张');

console.log('\n[开局]');
let g = newGame();
assert(g.player.cover === RULES.START_COVER, '我方掩护 12');
assert(g.enemy.cover === RULES.START_COVER, '敌方掩护 12');
assert(g.player.hand.length === 5, '我方起手 5 张');
assert(g.enemy.hand.length === 5, '敌方起手 5 张');
assert(g.phase === 'select', '进入选牌阶段');

console.log('\n[情报 vs 无防备]');
g = newGame();
g.watchword = '丙';
let r = forcePlay(g, 'deadletter', 'otp');
assert(r.enemyDamage === 2, '死信箱造成 2 点，实际 ' + r.enemyDamage);
assert(r.playerDamage === 0, '密码本无反击');

console.log('\n[暗杀被潜伏挡下]');
g = newGame();
r = forcePlay(g, 'assassin', 'lurk');
assert(r.enemyDamage === 0, '暗杀对潜伏为 0，实际 ' + r.enemyDamage);
assert(r.playerDamage === 1, '潜伏反弹 1 点');

console.log('\n[情报 vs 潜伏]');
g = newGame();
r = forcePlay(g, 'intel', 'lurk');
assert(r.enemyDamage === 0, '情报被挡');
assert(r.playerDamage === 1, '被反弹 1');

console.log('\n[假情报反弹攻击]');
g = newGame();
r = forcePlay(g, 'fake', 'assassin');
assert(r.playerDamage === 0, '我方假情报，不吃暗杀伤害，实际 ' + r.playerDamage);
assert(r.enemyDamage === 4, '暗杀 4 点被反弹给敌方，实际 ' + r.enemyDamage);

console.log('\n[假情报打非攻击]');
g = newGame();
r = forcePlay(g, 'fake', 'safehouse');
assert(r.enemyDamage === 1, '对方非攻击时假情报造成 1');

console.log('\n[安全屋回复]');
g = newGame();
g.watchword = '甲'; // safehouse=丙
g.player.cover = 5;
r = forcePlay(g, 'safehouse', 'otp');
assert(g.player.cover === 8, '安全屋 +3 到 8，实际 ' + g.player.cover);

console.log('\n[策反偷牌]');
g = newGame();
g.enemy.hand = [makeCard('intel', 301), makeCard('lurk', 302)];
const before = g.player.hand.length;
r = forcePlay(g, 'defect', 'cipher');
const stole = r.events.some((e) => e.indexOf('夺得') >= 0);
assert(stole, '策反成功夺取手牌');
assert(g.player.hand.length >= before + 1, '我方手牌增加，实际 ' + g.player.hand.length + '（原 ' + before + '）');
assert(r.enemyDamage === 1, '策反伤害 1');

console.log('\n[双重间谍复制]');
g = newGame();
r = forcePlay(g, 'double', 'assassin');
// 复制暗杀：敌方未潜伏时应吃 4
assert(r.enemyDamage === 4, '双重复制暗杀，敌方 -4，实际 ' + r.enemyDamage);

console.log('\n[双重 vs 双重抵消]');
g = newGame();
r = forcePlay(g, 'double', 'double');
assert(r.playerDamage === 0 && r.enemyDamage === 0, '双方双重抵消');

console.log('\n[清道夫命中弃牌]');
g = newGame();
g.watchword = '甲'; // shredder=乙
g.enemy.hand = [makeCard('deadletter', 401)];
const discardBefore = g.enemy.discard.length;
r = forcePlay(g, 'shredder', 'otp');
assert(r.enemyDamage === 3, '碎纸机 3 点，实际 ' + r.enemyDamage);
assert(g.enemy.discard.length >= discardBefore + 1, '敌方弃牌堆增加');

console.log('\n[情报行动]');
g = newGame();
assert(g.player.intel === 3, '开局情报 3');
let ir = useIntelAction(g, 'player', 'listen');
assert(ir.ok, '监听成功');
assert(g.player.intel === 2, '监听后情报 2');
ir = useIntelAction(g, 'player', 'listen');
assert(!ir.ok, '同回合不能重复监听');
ir = useIntelAction(g, 'player', 'jam');
assert(ir.ok && g.enemy.jamIncoming, '干扰生效');
assert(g.player.intel === 0, '干扰后情报 0');
ir = useIntelAction(g, 'player', 'decode');
assert(!ir.ok, '情报不足无法破译');

console.log('\n[干扰减伤]');
g = newGame();
g.watchword = '乙';
g.player.jamIncoming = true; // 我方攻击被干扰
r = forcePlay(g, 'silence', 'otp');
assert(r.enemyDamage === 3, '静默清除被干扰后敌方受伤 3，实际 ' + r.enemyDamage);

console.log('\n[连击]');
g = newGame();
g.watchword = '乙'; // deadletter=甲，不匹配
g.player.dealtDamageLast = true;
r = forcePlay(g, 'deadletter', 'otp');
assert(r.enemyDamage === 3, '连击死信箱为 3，实际 ' + r.enemyDamage);

console.log('\n[暗杀条件]');
g = newGame();
g.enemy.lastPlayedType = 'atk';
r = forcePlay(g, 'silence', 'otp');
// silence 4 + 条件 1 = 5，再加暗号可能 +1
const silDmg = r.enemyDamage;
assert(silDmg >= 5, '静默清除条件后 ≥5，实际 ' + silDmg);

console.log('\n[暗号与暴露与深潜]');
g = newGame({ rng: () => 0.5 });
// 固定暗号
g.watchword = '甲';
// deadletter band 甲 → 2+1=3
r = forcePlay(g, 'deadletter', 'otp');
assert(r.enemyDamage === 3, '暗号命中死信箱为 3，实际 ' + r.enemyDamage);
assert(g.player.exposure >= 2, '行动增加暴露，实际 ' + g.player.exposure);

g = newGame();
g.watchword = '甲';
g.player.exposure = 4;
const { playDeepCover } = require(path.join(root, 'js/engine.js'));
assert(playDeepCover(g, 'player'), '深潜就位');
g.enemy.played = makeCard('silence', 900);
r = resolveRound(g);
assert(g.player.exposure === 0, '深潜清暴露');
assert(r.playerDamage === 0, '深潜免疫行动，实际 ' + r.playerDamage);

console.log('\n[整局模拟到分出胜负]');
let sim = newGame();
let turns = 0;
let guard = 0;
while (!sim.lastResult || !sim.lastResult.gameOver) {
  guard += 1;
  if (guard > 80) {
    console.log('  超过 80 回合未结束，强行检查');
    break;
  }
  const pc = chooseCard(sim.player.hand, sim.player, sim.enemy);
  const ec = chooseCard(sim.enemy.hand, sim.enemy, sim.player);
  if (!pc || !ec) {
    drawCards(sim.player, 3);
    drawCards(sim.enemy, 3);
    continue;
  }
  playerPlay(sim, pc.uid);
  const idx = sim.enemy.hand.findIndex((c) => c.uid === ec.uid);
  if (idx >= 0) sim.enemy.hand.splice(idx, 1);
  sim.enemy.played = ec;
  sim.lastResult = resolveRound(sim);
  turns += 1;
  if (sim.player.cover <= 0 || sim.enemy.cover <= 0) break;
}
assert(turns > 0, '对局至少进行 1 回合，共 ' + turns + ' 回合');
assert(
  sim.player.cover <= 0 || sim.enemy.cover <= 0 || guard > 80,
  '对局可结束 (我方 ' + sim.player.cover + ' / 敌方 ' + sim.enemy.cover + ')'
);
assert(sim.lastResult && sim.lastResult.winner, '有胜者: ' + (sim.lastResult && sim.lastResult.winner));

console.log('\n结果: 通过 ' + passed + ' / 失败 ' + failed + '\n');
process.exit(failed > 0 ? 1 : 0);
