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

  // 手牌落点计算
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
    // 特工选择
    agentCards: AGENTS.map((_, i) => ({
      x: 30 + i * 144,
      y: 280,
      w: 126,
      h: 200,
    })),
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
    const baseY = HAND_BASE_Y;
    return hand.map((card, i) => {
      const selected = card.uid === selectedUid;
      return {
        card,
        x: startX + i * gap,
        y: selected ? baseY - 42 : baseY,
        w: cardW,
        h: cardH,
        selected,
      };
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

    // 地点信息
    const loc = getLocationById(state.game.locationId);
    state.log.push(`行动地点：【${loc.name}】${loc.desc}`);

    if (state.mode === MODES.TEAM) {
      state.log.push('小队行动：你与搭档对抗敌方双人组。队伍掩护 ' + RULES.TEAM_COVER);
      toast.push('小队行动开始', 'good');
    } else if (state.mode === MODES.PASS) {
      state.game.hideHands = true;
      state.scene = SCENES.PASS_WAIT;
      state.log.push('同屏潜伏：玩家 A 先手。确认出牌后交给对方。');
    } else {
      if (agentId) {
        const agent = AGENTS.find((a) => a.id === agentId);
        if (agent) state.log.push(`特工【${agent.name}·${agent.title}】就位：${agent.desc}`);
      }
      state.log.push('密令对决：点选手牌，可用情报，确认后同时翻开。');
      toast.push('行动开始', 'good');
    }
  }

  function tryPlaySelected() {
    const g = state.game;
    if (!g || g.phase !== 'select') return;
    const seat = activeSeat();
    if (!seat || !state.selectedUid) return;
    const card = seat.hand.find((c) => c.uid === state.selectedUid);
    if (!card) return;
    audio.play('play');

    if (g.mode === MODES.TEAM) {
      playerPlay(g, card.uid);
      state.selectedUid = null;
      const m = partnerPick(g.partner.hand, g.partner, g.enemy1, g.watchword);
      if (m) {
        const i = g.partner.hand.findIndex((c) => c.uid === m.uid);
        if (i >= 0) g.partner.hand.splice(i, 1);
        g.partner.played = m;
      }
      const a = chooseCard(g.enemy1.hand, g.enemy1, g.you, g.watchword, g.locationId);
      if (a) {
        const i = g.enemy1.hand.findIndex((c) => c.uid === a.uid);
        if (i >= 0) g.enemy1.hand.splice(i, 1);
        g.enemy1.played = a;
      }
      const b = chooseCard(g.enemy2.hand, g.enemy2, g.partner, g.watchword, g.locationId);
      if (b) {
        const i = g.enemy2.hand.findIndex((c) => c.uid === b.uid);
        if (i >= 0) g.enemy2.hand.splice(i, 1);
        g.enemy2.played = b;
      }
      g.phase = 'reveal';
      const result = resolveTeamRound(g);
      afterResolve(result);
      return;
    }

    playerPlay(g, card.uid);
    state.selectedUid = null;

    if (g.mode === MODES.PASS) {
      const other = g.passSeat === 0 ? g.enemy : g.player;
      if (other.played) {
        g.phase = 'reveal';
        afterResolve(resolveRound(g));
      } else {
        passTurn(g);
        state.scene = SCENES.PASS_WAIT;
        toast.push('交给对方', 'info');
      }
      return;
    }

    // solo AI
    state.anim = { t: 0, duration: 0.7, phase: 'ai', done: false };
  }

  function tryPlayDeepAndGo() {
    const g = state.game;
    if (!g || !g.player.played || !g.player.played.deep) return;
    if (g.mode === MODES.TEAM) {
      toast.push('小队模式请使用手牌', 'bad');
      undoPlay(g);
      return;
    }
    if (g.mode === MODES.PASS) {
      const other = g.passSeat === 0 ? g.enemy : g.player;
      if (other.played) {
        g.phase = 'reveal';
        afterResolve(resolveRound(g));
      } else {
        passTurn(g);
        state.scene = SCENES.PASS_WAIT;
      }
      return;
    }
    state.anim = { t: 0, duration: 0.7, phase: 'ai', done: false };
  }

  function afterResolve(result) {
    const g = state.game;
    g.lastResult = result;
    g.turn += 1;
    state.stats.turns += 1;
    state.stats.dmgDealt += result.enemyDamage || 0;
    state.stats.dmgTaken += result.playerDamage || 0;
    (result.events || []).forEach((e) => state.log.push(e));
    state.shake = (result.playerDamage || 0) >= 3 ? 0.3 : 0;
    state.flash = (result.playerDamage || 0) > 0 ? 0.22 : 0;

    if ((result.playerDamage || 0) > 0) audio.play('hit');
    else if ((result.enemyDamage || 0) > 0) audio.play('hit');
    else audio.play('block');
    if (result.gameOver) {
      audio.play(result.winner === 'player' ? 'win' : 'lose');
    }

    if (state.vibrateOn && (result.playerDamage || 0) >= 3 && typeof wx !== 'undefined' && wx.vibrateShort) {
      try { wx.vibrateShort({ type: 'medium' }); } catch (e) { /* ignore */ }
    }
    g.phase = 'result';
    state.anim = { t: 0, duration: 1.55, phase: 'result', done: false };
    if (result.gameOver) {
      g.phase = 'over';
      state.anim.duration = 1.7;
      state.winner = result.winner;
    }
  }

  function aiPlayAndResolve() {
    const g = state.game;
    if (!g || g.mode !== MODES.SOLO) return;
    // AI 情报行动
    if (g.enemy.intel >= RULES.INTEL_COST.jam && g.player.cover <= 6 && Math.random() < 0.4) {
      runIntel(g, 'enemy', 'jam');
      state.log.push('敌方干扰了信道…');
    } else if (g.enemy.intel >= RULES.INTEL_COST.decode && g.enemy.hand.length <= 3 && Math.random() < 0.45) {
      runIntel(g, 'enemy', 'decode');
    }
    if (shouldDeepCover(g.enemy, g.player, g.locationId)) {
      playDeepCover(g, 'enemy');
      state.log.push('敌方切断了联络…');
    } else {
      const pick = chooseCard(g.enemy.hand, g.enemy, g.player, g.watchword, g.locationId);
      if (pick) {
        const idx = g.enemy.hand.findIndex((c) => c.uid === pick.uid);
        if (idx >= 0) g.enemy.hand.splice(idx, 1);
        g.enemy.played = pick;
      }
    }
    afterResolve(resolveRound(g));
  }

  function useIntel(kind) {
    const g = state.game;
    if (!g || g.phase !== 'select') return;
    if (g.mode === MODES.TEAM) {
      toast.push('小队模式暂不使用个人情报', 'bad');
      return;
    }
    const seat = activeSeat();
    if (seat.played) {
      toast.push('已出牌，无法使用情报', 'bad');
      return;
    }
    const side = g.mode === MODES.PASS ? (g.passSeat === 0 ? 'player' : 'enemy') : 'player';
    const r = runIntel(g, side, kind);
    if (r.ok) audio.play('intel');
    toast.push(r.msg || (r.ok ? '完成' : '失败'), r.ok ? 'good' : 'bad');
    if (r.ok && r.listenResult != null) state.listenHint = r.listenResult;
  }

  function finishAnim() {
    const g = state.game;
    if (!g) return;
    if (g.phase === 'over') {
      state.scene = SCENES.OVER;
      return;
    }
    g.phase = 'select';
    g.lastResult = null;
    state.listenHint = null;
    if (g.mode === MODES.PASS) {
      state.scene = SCENES.PASS_WAIT;
      g.hideHands = true;
    }
  }

  // --- 输入 ---
  function onTouchStart(x, y) {
    const d = R.toDesign(x, y);
    toast.update(0);

    if (state.privacyOpen) {
      if (R.hitTest(L.privacyAgree, d.x, d.y)) {
        storage.acceptPrivacy();
        state.privacyOpen = false;
        audio.play('click');
        toast.push('已同意用户协议与隐私政策', 'good');
      } else if (R.hitTest(L.privacyDeny, d.x, d.y)) {
        toast.push('需同意后才能开始行动', 'bad');
      }
      return;
    }

    if (state.settingsOpen) {
      if (R.hitTest(L.settingsSound, d.x, d.y)) {
        state.soundOn = !state.soundOn;
        storage.setSound(state.soundOn);
        audio.setEnabled(state.soundOn);
        if (state.soundOn) audio.play('click');
        toast.push(state.soundOn ? '音效开' : '音效关');
      } else if (R.hitTest(L.settingsVib, d.x, d.y)) {
        state.vibrateOn = !state.vibrateOn;
        storage.setVibrate(state.vibrateOn);
        toast.push(state.vibrateOn ? '震动开' : '震动关');
      } else if (R.hitTest(L.settingsClose, d.x, d.y)) {
        state.settingsOpen = false;
        audio.play('click');
      }
      return;
    }

    if (state.scene === SCENES.BOOT) return;

    if (state.scene === SCENES.TITLE) {
      if (R.hitTest(L.titleBtnSolo, d.x, d.y)) {
        if (!storage.hasPrivacy()) {
          state.privacyOpen = true;
          return;
        }
        audio.play('click');
        startGame(MODES.SOLO);
      } else if (R.hitTest(L.titleBtnMode, d.x, d.y)) {
        if (!storage.hasPrivacy()) {
          state.privacyOpen = true;
          return;
        }
        audio.play('click');
        state.scene = SCENES.MODE;
      } else if (R.hitTest(L.titleBtnRules, d.x, d.y)) {
        audio.play('click');
        state.scene = SCENES.RULES;
      } else if (R.hitTest(L.titleBtnSettings, d.x, d.y)) {
        audio.play('click');
        state.settingsOpen = true;
      }
      return;
    }

    if (state.scene === SCENES.MODE) {
      if (R.hitTest(L.modeSolo, d.x, d.y)) {
        audio.play('click');
        state.mode = MODES.SOLO;
        state.scene = SCENES.AGENT_SELECT;
      } else if (R.hitTest(L.modePass, d.x, d.y)) startGame(MODES.PASS);
      else if (R.hitTest(L.modeTeam, d.x, d.y)) startGame(MODES.TEAM);
      else if (R.hitTest(L.modeBack, d.x, d.y)) state.scene = SCENES.TITLE;
      return;
    }

    if (state.scene === SCENES.AGENT_SELECT) {
      // 选特工
      for (let i = 0; i < AGENTS.length; i += 1) {
        if (R.hitTest(L.agentCards[i], d.x, d.y)) {
          audio.play('click');
          state.selectedAgentId = state.selectedAgentId === AGENTS[i].id ? null : AGENTS[i].id;
          return;
        }
      }
      if (R.hitTest(L.agentConfirm, d.x, d.y) && state.selectedAgentId) {
        audio.play('click');
        startGame(state.mode, state.selectedAgentId);
      } else if (R.hitTest(L.agentBack, d.x, d.y)) {
        audio.play('click');
        state.selectedAgentId = null;
        state.scene = SCENES.MODE;
      }
      return;
    }

    if (state.scene === SCENES.RULES) {
      if (R.hitTest(L.rulesBack, d.x, d.y)) state.scene = SCENES.TITLE;
      return;
    }

    if (state.scene === SCENES.PASS_WAIT) {
      if (R.hitTest(L.passReady, d.x, d.y)) {
        state.game.hideHands = false;
        state.scene = SCENES.GAME;
      }
      return;
    }

    if (state.scene === SCENES.OVER) {
      if (R.hitTest(L.overAgain, d.x, d.y)) startGame(state.mode);
      else if (R.hitTest(L.overTitle, d.x, d.y)) state.scene = SCENES.TITLE;
      return;
    }

    if (state.scene !== SCENES.GAME) return;
    const g = state.game;
    if (!g) return;

    if (R.hitTest(L.gameMenu, d.x, d.y)) {
      state.scene = SCENES.TITLE;
      return;
    }

    if (g.phase === 'select') {
      if (R.hitTest(L.gameUndo, d.x, d.y) && g.player.played) {
        undoPlay(g);
        toast.push('已撤回');
        return;
      }
      if (R.hitTest(L.gameConfirm, d.x, d.y)) {
        if (state.selectedUid) tryPlaySelected();
        else tryPlayDeepAndGo();
        return;
      }
      if (R.hitTest(L.btnListen, d.x, d.y)) {
        useIntel('listen');
        return;
      }
      if (R.hitTest(L.btnJam, d.x, d.y)) {
        useIntel('jam');
        return;
      }
      if (R.hitTest(L.btnDecode, d.x, d.y)) {
        useIntel('decode');
        return;
      }
      if (R.hitTest(L.btnDeep, d.x, d.y)) {
        const seat2 = activeSeat();
        if (seat2.played) {
          toast.push('已就位，无法深潜', 'bad');
        } else if (playDeepCover(g, g.mode === MODES.PASS ? (g.passSeat === 0 ? 'player' : 'enemy') : 'player')) {
          audio.play('play');
          toast.push('进入深潜：清暴露 · 抽 2 · 免疫行动', 'good');
          state.selectedUid = null;
          tryPlayDeepAndGo();
        }
        return;
      }
      const seat = activeSeat();
      const hand = layoutHand(seat.hand, state.selectedUid);
      for (let i = hand.length - 1; i >= 0; i -= 1) {
        if (R.hitTest(hand[i], d.x, d.y)) {
          state.selectedUid = state.selectedUid === hand[i].card.uid ? null : hand[i].card.uid;
          return;
        }
      }
    }
  }

  // --- 绘制 ---
  function drawBoot() {
    R.ctx.fillStyle = COLORS.void;
    R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    const p = assets ? Math.min(1, assets.progress()) : 1;
    R.text('SPYNET', DESIGN_W / 2, 520, {
      size: 42,
      color: COLORS.paper,
      align: 'center',
      family: FONTS.mono,
      weight: '700',
    });
    R.text('载入机密档案…', DESIGN_W / 2, 600, {
      size: 20,
      color: COLORS.haze,
      align: 'center',
      family: FONTS.sans,
    });
    const bw = 360;
    R.ctx.fillStyle = COLORS.olive;
    R.roundRect((DESIGN_W - bw) / 2, 660, bw, 10, 5);
    R.ctx.fill();
    R.ctx.fillStyle = COLORS.signal;
    R.roundRect((DESIGN_W - bw) / 2, 660, bw * p, 10, 5);
    R.ctx.fill();
  }

  function drawTitle() {
    if (R.assets && R.assets.titleBg) {
      R.drawCoverImage(R.assets.titleBg, 0, 0, DESIGN_W, DESIGN_H);
      R.ctx.fillStyle = 'rgba(10,16,14,0.58)';
      R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
      const grd = R.ctx.createLinearGradient(0, DESIGN_H * 0.3, 0, DESIGN_H);
      grd.addColorStop(0, 'rgba(10,16,14,0)');
      grd.addColorStop(1, 'rgba(10,16,14,0.92)');
      R.ctx.fillStyle = grd;
      R.ctx.fillRect(0, DESIGN_H * 0.3, DESIGN_W, DESIGN_H * 0.7);
    }
    R.drawNoise();
    R.drawScanlines();
    R.drawDiagonalSecret('TOP SECRET');
    R.drawFrame();

    const t = state.titleT;
    const slide = easeOutCubic(Math.min(1, t / 0.8));

    R.ctx.save();
    R.ctx.globalAlpha = slide;
    R.text('CLASSIFIED // OPERATION SPYNET', DESIGN_W / 2, 170, {
      size: 18,
      color: COLORS.haze,
      family: FONTS.mono,
      align: 'center',
    });
    R.text('谍  网', DESIGN_W / 2, 280, {
      size: 108,
      color: COLORS.paper,
      align: 'center',
      weight: '700',
    });
    R.stampText('SPYNET', DESIGN_W / 2, 430, 34, 0.9);
    R.text('同时翻开 · 情报博弈 · 掩护归零者败', DESIGN_W / 2, 510, {
      size: 22,
      color: COLORS.dossierDim,
      align: 'center',
    });
    R.ctx.restore();

    drawButton(R, L.titleBtnSolo, '快速行动', { primary: true, size: 28 });
    drawButton(R, L.titleBtnMode, '模式选择', { size: 28 });
    drawButton(R, L.titleBtnRules, '作战手册', { size: 24 });
    drawButton(R, L.titleBtnSettings, '设置', { size: 20 });

    R.text('FOR AUTHORIZED EYES ONLY', DESIGN_W / 2, 1260, {
      size: 14,
      color: COLORS.haze,
      family: FONTS.mono,
      align: 'center',
    });
  }

  function drawMode() {
    R.drawNoise();
    R.drawFrame();
    R.text('选择行动', DESIGN_W / 2, 160, {
      size: 44,
      color: COLORS.paper,
      align: 'center',
      weight: '700',
    });
    R.text('SELECT OPERATION', DESIGN_W / 2, 220, {
      size: 16,
      color: COLORS.haze,
      family: FONTS.mono,
      align: 'center',
    });

    function modeCard(rect, title, sub, tag) {
      const ctx = R.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(30,46,38,0.9)';
      R.roundRect(rect.x, rect.y, rect.w, rect.h, 8);
      ctx.fill();
      ctx.strokeStyle = COLORS.oliveLight;
      ctx.lineWidth = 2;
      ctx.stroke();
      R.text(title, rect.x + 28, rect.y + 28, {
        size: 30,
        color: COLORS.paper,
        weight: '700',
      });
      R.text(sub, rect.x + 28, rect.y + 72, {
        size: 18,
        color: COLORS.dossierDim,
      });
      if (tag) {
        R.text(tag, rect.x + rect.w - 24, rect.y + 36, {
          size: 16,
          color: COLORS.signal,
          family: FONTS.mono,
          align: 'right',
        });
      }
      ctx.restore();
    }

    modeCard(L.modeSolo, '密令对决', '1v1 对抗 AI · 可选特工', 'SOLO');
    modeCard(L.modePass, '同屏潜伏', '两人一机 · 交替出牌，注意遮挡', '2P');
    modeCard(L.modeTeam, '小队行动', '你 + 搭档 AI 对抗敌方双人组', '2v2');
    drawButton(R, L.modeBack, '返回');
  }

  function drawAgentSelect() {
    R.drawNoise();
    R.drawFrame();
    R.text('选择特工', DESIGN_W / 2, 120, {
      size: 40,
      color: COLORS.paper,
      align: 'center',
      weight: '700',
    });
    R.text('SELECT OPERATIVE', DESIGN_W / 2, 170, {
      size: 16,
      color: COLORS.haze,
      align: 'center',
      family: FONTS.mono,
    });

    AGENTS.forEach((agent, i) => {
      const rect = L.agentCards[i];
      const selected = state.selectedAgentId === agent.id;
      R.drawAgentCard(agent, rect.x, rect.y, rect.w, rect.h, selected);
    });

    // 被选特工详情
    if (state.selectedAgentId) {
      const agent = AGENTS.find((a) => a.id === state.selectedAgentId);
      if (agent) {
        drawPanel(R, 50, 510, 650, 210, agent.name + ' · ' + agent.title);
        R.text('被动技能', 100, 580, {
          size: 18,
          color: COLORS.signal,
          family: FONTS.mono,
        });
        R.text(agent.desc, 100, 620, {
          size: 22,
          color: COLORS.dossier,
        });
      }
    } else {
      drawPanel(R, 50, 510, 650, 210, '选择你的特工');
      R.text('每名特工拥有独特的被动技能，', 100, 590, {
        size: 20,
        color: COLORS.haze,
      });
      R.text('影响整局对战策略。', 100, 620, {
        size: 20,
        color: COLORS.haze,
      });
    }

    drawButton(R, L.agentConfirm, '确认出击', {
      primary: true,
      size: 24,
      disabled: !state.selectedAgentId,
    });
    drawButton(R, L.agentBack, '返回');
  }

  function drawCover(x, y, w, cover, max, label, align) {
    R.drawCoverBar(x, y, w, cover, max, label, align);
  }

  function drawHUD() {
    const g = state.game;
    R.ctx.fillStyle = 'rgba(30,46,38,0.72)';
    R.roundRect(28, 36, DESIGN_W - 56, 100, 8);
    R.ctx.fill();
    R.ctx.strokeStyle = COLORS.oliveLight;
    R.ctx.stroke();

    const modeName =
      g.mode === MODES.TEAM ? '小队' : g.mode === MODES.PASS ? '同屏' : '密令';
    const seatName =
      g.mode === MODES.PASS ? (g.passSeat === 0 ? '玩家A' : '玩家B') : '';

    // 第一行：模式 + 回合 + 暗号
    R.text(modeName + ' · 回合 ' + g.turn + (seatName ? ' · ' + seatName : ''), 48, 48, {
      size: 20,
      color: COLORS.paper,
      family: FONTS.mono,
      weight: '700',
    });

    // 地点信息（右上角）
    if (g.locationId) {
      const loc = getLocationById(g.locationId);
      const locColor = loc.color || COLORS.signal;
      R.ctx.save();
      R.ctx.fillStyle = 'rgba(3,6,5,0.55)';
      R.roundRect(DESIGN_W - 200, 44, 170, 24, 4);
      R.ctx.fill();
      R.ctx.strokeStyle = locColor;
      R.ctx.stroke();
      R.text(loc.name, DESIGN_W - 115, 56, {
        size: 14,
        color: locColor,
        align: 'center',
        baseline: 'middle',
        family: FONTS.mono,
        weight: '700',
      });
      R.ctx.restore();
    }

    // 第二行：情报 + 暴露 + 特工 + 暗号
    if (g.mode !== MODES.TEAM) {
      const seat = activeSeat();
      R.text('情报 ' + (seat ? seat.intel : g.player.intel) + '/' + RULES.MAX_INTEL, 48, 80, {
        size: 16,
        color: COLORS.signal,
        family: FONTS.mono,
      });
      const expo = seat ? seat.exposure : 0;
      R.text('暴露 ' + expo, 200, 80, {
        size: 16,
        color: expo >= 3 ? COLORS.stampBright : COLORS.haze,
        family: FONTS.mono,
      });
      // 特工名
      if (seat && seat.agentId) {
        const agent = AGENTS.find((a) => a.id === seat.agentId);
        if (agent) {
          const aColor = agent.color || COLORS.info;
          R.text(agent.name, 320, 80, {
            size: 16,
            color: aColor,
            family: FONTS.mono,
            weight: '700',
          });
        }
      }
    } else {
      R.text('队伍掩护同步显示', 48, 80, {
        size: 16,
        color: COLORS.haze,
        family: FONTS.mono,
      });
    }
    // 值班暗号
    const ww = g.watchword || '—';
    const wColor = BAND_COLORS[ww] || COLORS.signal;
    R.ctx.save();
    R.ctx.fillStyle = 'rgba(3,6,5,0.55)';
    R.roundRect(DESIGN_W - 210, 90, 170, 34, 4);
    R.ctx.fill();
    R.ctx.strokeStyle = wColor;
    R.ctx.stroke();
    R.text('暗号「' + ww + '」', DESIGN_W - 125, 107, {
      size: 16,
      color: wColor,
      align: 'center',
      baseline: 'middle',
      family: FONTS.mono,
      weight: '700',
    });
    R.ctx.restore();
    drawButton(R, L.gameMenu, '撤离', { size: 18 });

    if (g.mode === MODES.TEAM) {
      drawCover(70, 155, 380, g.teamACover, RULES.TEAM_COVER, '我方小队', false);
      R.text('搭档手牌 ' + g.partner.hand.length, 70, 183, {
        size: 16,
        color: COLORS.haze,
        family: FONTS.mono,
      });
      drawCover(70, 555, 380, g.teamBCover, RULES.TEAM_COVER, '敌方小队', false);
    } else {
      drawCover(70, 155, 380, g.enemy.cover, RULES.START_COVER, '敌方掩护', false);
      R.text('手牌 ' + g.enemy.hand.length + ' · 情报 ' + g.enemy.intel, 70, 183, {
        size: 16,
        color: COLORS.haze,
        family: FONTS.mono,
      });
      drawCover(70, 555, 380, g.player.cover, RULES.START_COVER, '我方掩护', false);
    }
    if (state.listenHint != null) {
      R.text('监听：对方约 ' + state.listenHint + ' 张行动牌', 70, 530, {
        size: 15,
        color: COLORS.signal,
        family: FONTS.mono,
      });
    }

    // === 成就进度（右下角迷你显示） ===
    if (g.mode !== MODES.TEAM) {
      const seat2 = activeSeat();
      if (seat2 && seat2.medals) {
        const m = seat2.medals;
        let medalText = '';
        if (!m.coldblood.done) medalText += '冷血 ' + (m.coldblood.streak || 0) + '/3  ';
        if (!m.ironwall.done) medalText += '铁壁  ';
        if (!m.codemaster.done) medalText += '暗号 ' + (m.codemaster.streak || 0) + '/2  ';
        if (medalText) {
          R.text('🏅 ' + medalText, DESIGN_W - 250, 535, {
            size: 13,
            color: COLORS.signalDim,
            align: 'right',
            family: FONTS.mono,
          });
        }
      }
    }
  }

  function drawSlot(card, x, y, w, h, faceDown, label) {
    if (card) {
      R.drawCard(card, x, y, w, h, { faceDown, selected: false });
    } else {
      R.ctx.save();
      R.ctx.setLineDash([6, 6]);
      R.ctx.strokeStyle = COLORS.oliveLight;
      R.ctx.strokeRect(x, y, w, h);
      R.ctx.restore();
      R.text(label || '', x + w / 2, y + h / 2, {
        size: 18,
        color: COLORS.haze,
        align: 'center',
        baseline: 'middle',
        family: FONTS.mono,
      });
    }
  }

  function drawFlipCard(card, x, y, w, h, faceDown, flipT) {
    const t = flipT == null ? 1 : flipT;
    const scale = Math.abs(Math.cos(t * Math.PI));
    const drawW = Math.max(2, w * (0.15 + 0.85 * scale));
    const face = t >= 0.5;
    const dx = x + (w - drawW) / 2;
    R.ctx.save();
    R.ctx.shadowColor = 'rgba(0,0,0,0.45)';
    R.ctx.shadowBlur = 12;
    R.ctx.shadowOffsetY = 4;
    if (card) {
      R.drawCard(card, dx, y, drawW, h, { faceDown: faceDown || !face, selected: false });
    } else {
      R.ctx.strokeStyle = COLORS.oliveLight;
      R.ctx.setLineDash([6, 6]);
      R.ctx.strokeRect(x, y, w, h);
      R.ctx.setLineDash([]);
    }
    R.ctx.restore();
  }

  function drawPlayArea() {
    const g = state.game;
    let flipT = 1;
    if (state.anim && state.anim.phase === 'result') {
      flipT = Math.min(1, state.anim.t / 0.35);
    } else if (state.anim && state.anim.phase === 'ai') {
      flipT = 0;
    }
    const showEnemyFace = !state.anim || state.anim.phase === 'result' ? flipT >= 0.5 : false;
    const showSelfFace = !state.anim || state.anim.phase !== 'ai';

    if (g.mode === MODES.TEAM) {
      drawSlot(g.partner.played, L.partnerSlot.x, L.partnerSlot.y, L.partnerSlot.w, L.partnerSlot.h, !showEnemyFace, '搭档');
      drawSlot(g.enemy2.played, L.enemy2Slot.x, L.enemy2Slot.y, L.enemy2Slot.w, L.enemy2Slot.h, !showEnemyFace, '敌二');
      drawSlot(g.enemy1.played, L.enemySlot.x, L.enemySlot.y, L.enemySlot.w, L.enemySlot.h, !showEnemyFace, '敌一');
      const sel = state.selectedUid
        ? g.player.hand.find((c) => c.uid === state.selectedUid)
        : null;
      if (g.player.played) {
        drawFlipCard(g.player.played, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, showSelfFace ? 1 : 0.2);
      } else if (sel) {
        R.drawCard(sel, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, { selected: true });
      } else {
        drawSlot(null, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, '你的行动');
      }
    } else {
      if (g.enemy.played) {
        drawFlipCard(g.enemy.played, L.enemySlot.x, L.enemySlot.y, L.enemySlot.w, L.enemySlot.h, true, showEnemyFace ? flipT : 0);
        if (!showEnemyFace) {
          R.text('?', L.enemySlot.x + L.enemySlot.w / 2, L.enemySlot.y + L.enemySlot.h / 2, {
            size: 48,
            color: COLORS.signal,
            align: 'center',
            baseline: 'middle',
            family: FONTS.mono,
            weight: '700',
          });
        }
      } else {
        drawSlot(null, L.enemySlot.x, L.enemySlot.y, L.enemySlot.w, L.enemySlot.h, false, '待命');
      }
      const sel = state.selectedUid
        ? activeSeat().hand.find((c) => c.uid === state.selectedUid)
        : null;
      if (g.player.played) {
        drawFlipCard(g.player.played, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, 1);
      } else if (sel) {
        R.drawCard(sel, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, { selected: true });
        R.text('再点手牌收回 · 确认出击', DESIGN_W / 2, 930, {
          size: 15,
          color: COLORS.signalDim,
          align: 'center',
          family: FONTS.mono,
        });
      } else {
        drawSlot(null, L.playerSlot.x, L.playerSlot.y, L.playerSlot.w, L.playerSlot.h, false, '选择手牌');
      }
    }

    R.text('VS', DESIGN_W / 2, 540, {
      size: 30,
      color: COLORS.signal,
      align: 'center',
      baseline: 'middle',
      family: FONTS.mono,
      weight: '700',
      alpha: 0.75 + Math.sin(R.time * 3) * 0.15,
    });

    if (state.anim && g.lastResult && showEnemyFace && state.anim.phase === 'result') {
      const lr = g.lastResult;
      if (lr.enemyDamage > 0) R.stampText('-' + lr.enemyDamage, DESIGN_W / 2 + 140, 260, 32, 0.95);
      if (lr.playerDamage > 0) R.stampText('-' + lr.playerDamage, DESIGN_W / 2 + 140, 680, 32, 0.95);
    }
  }

  function drawHandAndButtons() {
    const g = state.game;
    const seat = activeSeat();
    const selectable = g.phase === 'select';
    const hand = layoutHand(seat.hand, state.selectedUid);
    hand.forEach((slot) => {
      R.drawCard(slot.card, slot.x, slot.y, slot.w, slot.h, {
        selected: slot.selected,
        dim: !selectable,
      });
    });

    if (selectable) {
      const canIntel = g.mode !== MODES.TEAM && !seat.played;
      const intel = seat.intel;
      const cost = RULES.INTEL_COST;
      drawButton(R, L.btnListen, '监听 ' + cost.listen, {
        size: 18,
        disabled: !canIntel || intel < cost.listen || seat.listenUsedThisTurn,
      });
      drawButton(R, L.btnJam, '干扰 ' + cost.jam, {
        size: 18,
        disabled: !canIntel || intel < cost.jam,
      });
      drawButton(R, L.btnDecode, '破译 ' + cost.decode, {
        size: 18,
        disabled: !canIntel || intel < cost.decode,
      });
      drawButton(R, L.btnDeep, '深潜', {
        size: 20,
        disabled: !!seat.played || g.mode === MODES.TEAM,
      });
      drawButton(R, L.gameUndo, '撤回', { size: 20, disabled: !seat.played });
      drawButton(R, L.gameConfirm, '确认出击', {
        primary: true,
        size: 24,
        disabled: !state.selectedUid && !(seat.played && seat.played.deep),
      });
    } else if (state.anim) {
      R.text('结算中…', DESIGN_W / 2, 1050, {
        size: 20,
        color: COLORS.signal,
        align: 'center',
        family: FONTS.mono,
      });
    }
  }

  function drawGame() {
    R.drawNoise();
    R.drawScanlines();
    R.drawDiagonalSecret(g_secret());
    R.drawFrame();
    drawHUD();
    drawPlayArea();
    drawHandAndButtons();
    R.drawLog(state.log.slice(-4), 500, 200, 220);
  }

  function g_secret() {
    return state.game && state.game.mode === MODES.TEAM ? 'SQUAD' : 'EYES ONLY';
  }

  function drawPassWait() {
    R.drawNoise();
    R.drawFrame();
    const seat = state.game.passSeat === 0 ? '玩家 A' : '玩家 B';
    drawPanel(R, 90, 380, 570, 320, '交给 ' + seat);
    R.text('请将设备递给对方', DESIGN_W / 2, 500, {
      size: 24,
      color: COLORS.dossier,
      align: 'center',
    });
    R.text('确认对方准备好后再揭开手牌', DESIGN_W / 2, 550, {
      size: 18,
      color: COLORS.haze,
      align: 'center',
    });
    drawButton(R, L.passReady, '我准备好了', { primary: true });
  }

  function drawOver() {
    R.drawNoise();
    R.drawScanlines();
    R.drawFrame();
    const win = state.winner === 'player';
    const draw = state.winner === 'draw';
    R.drawDiagonalSecret(win ? 'CLEAR' : 'BURN');
    if (draw) R.stampText('僵局', DESIGN_W / 2, 400, 60, 0.9);
    else if (win) R.stampText('任务完成', DESIGN_W / 2, 400, 52, 0.9);
    else R.stampText('身份暴露', DESIGN_W / 2, 400, 52, 0.95);

    drawPanel(R, 130, 500, 490, 260, '行动摘要');

    // 特工信息
    const g = state.game;
    if (g && g.player && g.player.agentId) {
      const agent = AGENTS.find((a) => a.id === g.player.agentId);
      if (agent) {
        R.text('特工 ' + agent.name, 200, 570, { size: 18, color: agent.color || COLORS.info, family: FONTS.mono, weight: '700' });
      }
    }
    // 地点信息
    if (g && g.locationId) {
      const loc = getLocationById(g.locationId);
      R.text('地点 ' + loc.name, 400, 570, { size: 18, color: loc.color || COLORS.signal, family: FONTS.mono });
    }

    R.text('回合 ' + state.stats.turns, 200, 610, { size: 20, color: COLORS.dossier });
    R.text('输出 ' + state.stats.dmgDealt, 380, 610, { size: 20, color: COLORS.dossier });
    R.text('承受 ' + state.stats.dmgTaken, 200, 650, { size: 20, color: COLORS.dossier });
    const modeName =
      state.mode === MODES.TEAM ? '小队行动' : state.mode === MODES.PASS ? '同屏潜伏' : '密令对决';
    R.text(modeName, 380, 650, { size: 20, color: COLORS.signal });

    // 成就展示
    if (g && g.player && g.player.medals) {
      const m = g.player.medals;
      const done = [];
      if (m.coldblood.done) done.push('冷血');
      if (m.ironwall.done) done.push('铁壁');
      if (m.codemaster.done) done.push('暗号大师');
      if (done.length) R.text('🏅 ' + done.join(' · '), 200, 700, {
        size: 16,
        color: COLORS.win,
        family: FONTS.sans,
      });
    }

    drawButton(R, L.overAgain, '再次行动', { primary: true });
    drawButton(R, L.overTitle, '返回封面');
  }

  function drawSettings() {
    R.ctx.fillStyle = 'rgba(0,0,0,0.55)';
    R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    drawPanel(R, 120, 380, 510, 420, '设置');
    drawButton(R, L.settingsSound, state.soundOn ? '音效：开' : '音效：关');
    drawButton(R, L.settingsVib, state.vibrateOn ? '震动：开' : '震动：关');
    drawButton(R, L.settingsClose, '关闭', { primary: true });
  }

  function drawPrivacy() {
    R.ctx.fillStyle = 'rgba(0,0,0,0.72)';
    R.ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
    drawPanel(R, 70, 300, 610, 580, '用户协议与隐私政策');
    R.wrapText(
      '欢迎来到谍网。我们仅在本机存储：是否同意协议、音效与震动偏好、对局进度。不收集手机号、通讯录或精确位置。继续即表示你已阅读并同意《用户协议》与《隐私政策》。',
      110,
      400,
      530,
      34,
      { size: 20, color: COLORS.dossier }
    );
    R.text('同意后即可开始行动', 110, 620, {
      size: 16,
      color: COLORS.haze,
      family: FONTS.mono,
    });
    drawButton(R, L.privacyAgree, '同意并继续', { primary: true });
    drawButton(R, L.privacyDeny, '暂不使用', { danger: true, size: 22 });
  }

  function update(dt) {
    if (state.scene === SCENES.BOOT) {
      state.bootT += dt;
      const ready = assets && assets.ready;
      if ((ready && state.bootT > 0.35) || state.bootT > 4) {
        state.scene = SCENES.TITLE;
      }
    }
    if (state.scene === SCENES.TITLE) state.titleT += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    toast.update(dt);

    const g = state.game;
    if (state.scene === SCENES.GAME && g && state.anim && !state.anim.done) {
      state.anim.t += dt;
      if (state.anim.phase === 'ai' && state.anim.t >= state.anim.duration) {
        state.anim.done = true;
        aiPlayAndResolve();
      } else if (state.anim.phase === 'result' && state.anim.t >= state.anim.duration) {
        state.anim.done = true;
        finishAnim();
      }
    }
  }

  function draw() {
    R.beginFrame(1 / 60);
    const ctx = R.ctx;
    if (state.shake > 0) {
      const s = state.shake * 10;
      ctx.translate(Math.sin(R.time * 55) * s, Math.cos(R.time * 41) * s);
    }

    if (state.scene === SCENES.BOOT) drawBoot();
    else if (state.scene === SCENES.TITLE) drawTitle();
    else if (state.scene === SCENES.MODE) drawMode();
    else if (state.scene === SCENES.AGENT_SELECT) drawAgentSelect();
    else if (state.scene === SCENES.RULES) drawRules();
    else if (state.scene === SCENES.GAME) drawGame();
    else if (state.scene === SCENES.PASS_WAIT) drawPassWait();
    else if (state.scene === SCENES.OVER) drawOver();

    if (state.flash > 0) {
      ctx.save();
      ctx.globalAlpha = state.flash * 0.45;
      ctx.fillStyle = COLORS.stamp;
      ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
      ctx.restore();
    }

    toast.draw(R, DESIGN_W / 2, 470);
    if (state.settingsOpen) drawSettings();
    if (state.privacyOpen) drawPrivacy();
  }

  let raf = 0;
  function loop(ts) {
    const now = ts || Date.now();
    const dt = Math.min(0.05, state.lastTs ? (now - state.lastTs) / 1000 : 1 / 60);
    state.lastTs = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  function resize(w, h) {
    R.width = w;
    R.height = h;
  }

  function _internal() {
    return {
      startGame,
      tryPlaySelected,
      skipBoot: function () { state.scene = SCENES.TITLE; },
    };
  }

  return {
    state,
    start: function () {
      if (!raf) raf = requestAnimationFrame(loop);
    },
    onTouchStart,
    resize,
    get _internal() { return _internal(); },
  };
}

module.exports = { createGame, SCENES };