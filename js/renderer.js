/**
 * 谍网 — Canvas 渲染器
 * 冷战卷宗风：硬边、虚线密级框、橡皮图章、打字机电文
 */

const { COLORS, FONTS, DESIGN_W, DESIGN_H, RULES } = require('./config');
const { TYPE_COLOR, TYPE_LABEL, BAND_COLORS, resolveId } = require('./cards');

function Renderer(canvas, width, height, assets) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.width = width;
  this.height = height;
  this.scale = Math.min(width / DESIGN_W, height / DESIGN_H);
  this.offsetX = (width - DESIGN_W * this.scale) / 2;
  this.offsetY = (height - DESIGN_H * this.scale) / 2;
  this.time = 0;
  this.cache = {};
  this.assets = assets || null;
}

Renderer.prototype.drawCoverImage = function drawCoverImage(img, x, y, w, h) {
  if (!img || !img.width) return false;
  const ctx = this.ctx;
  const ir = img.width / img.height;
  const rr = w / h;
  let dw;
  let dh;
  let dx;
  let dy;
  if (ir > rr) {
    dh = h;
    dw = h * ir;
    dx = x - (dw - w) / 2;
    dy = y;
  } else {
    dw = w;
    dh = w / ir;
    dx = x;
    dy = y - (dh - h) / 2;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  return true;
};

Renderer.prototype.beginFrame = function beginFrame(dt) {
  this.time += dt || 0;
  const ctx = this.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, this.width, this.height);
  // 信箱适配
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(0, 0, this.width, this.height);
  ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
  // 设计坐标系
  ctx.fillStyle = COLORS.void;
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);
};

Renderer.prototype.toDesign = function toDesign(x, y) {
  return {
    x: (x - this.offsetX) / this.scale,
    y: (y - this.offsetY) / this.scale,
  };
};

Renderer.prototype.roundRect = function roundRect(x, y, w, h, r) {
  const ctx = this.ctx;
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
};

Renderer.prototype.drawNoise = function drawNoise() {
  const ctx = this.ctx;
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = COLORS.white;
  const t = Math.floor(this.time * 8);
  for (let i = 0; i < 40; i += 1) {
    const x = (i * 137 + t * 13) % DESIGN_W;
    const y = (i * 89 + t * 7) % DESIGN_H;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
};

Renderer.prototype.drawScanlines = function drawScanlines() {
  const ctx = this.ctx;
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 1;
  for (let y = 0; y < DESIGN_H; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(DESIGN_W, y);
    ctx.stroke();
  }
  ctx.restore();
};

Renderer.prototype.drawDiagonalSecret = function drawDiagonalSecret(text) {
  const ctx = this.ctx;
  ctx.save();
  ctx.translate(DESIGN_W / 2, DESIGN_H / 2);
  ctx.rotate(-0.4);
  ctx.font = '700 96px ' + FONTS.mono;
  ctx.fillStyle = COLORS.stamp;
  ctx.globalAlpha = 0.06;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let row = -3; row <= 3; row += 1) {
    ctx.fillText(text || 'TOP SECRET', 0, row * 140);
  }
  ctx.restore();
};

Renderer.prototype.drawFrame = function drawFrame() {
  const ctx = this.ctx;
  // 外框
  ctx.strokeStyle = COLORS.oliveLight;
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, DESIGN_W - 36, DESIGN_H - 36);
  // 内层虚线密级框
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = COLORS.signalDim;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, DESIGN_W - 64, DESIGN_H - 64);
  ctx.restore();
};

Renderer.prototype.stampText = function stampText(text, x, y, size, alpha) {
  const ctx = this.ctx;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.font = '700 ' + (size || 42) + 'px ' + FONTS.mono;
  ctx.fillStyle = COLORS.stamp;
  ctx.globalAlpha = alpha == null ? 0.9 : alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = COLORS.stampBright;
  ctx.lineWidth = 2;
  ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);
  // 边框
  const w = ctx.measureText(text).width + 24;
  ctx.strokeRect(-w / 2, -(size || 42) * 0.75, w, (size || 42) * 1.5);
  ctx.restore();
};

Renderer.prototype.text = function text(str, x, y, opts) {
  const ctx = this.ctx;
  const o = opts || {};
  ctx.save();
  ctx.font = (o.weight || '400') + ' ' + (o.size || 24) + 'px ' + (o.family || FONTS.sans);
  ctx.fillStyle = o.color || COLORS.white;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.baseline || 'top';
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (o.maxWidth) ctx.fillText(str, x, y, o.maxWidth);
  else ctx.fillText(str, x, y);
  ctx.restore();
};

Renderer.prototype.wrapText = function wrapText(str, x, y, maxWidth, lineHeight, opts) {
  const ctx = this.ctx;
  const o = opts || {};
  ctx.save();
  ctx.font = (o.weight || '400') + ' ' + (o.size || 22) + 'px ' + (o.family || FONTS.sans);
  ctx.fillStyle = o.color || COLORS.dossier;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = 'top';
  const chars = String(str).split('');
  let line = '';
  let cy = y;
  for (let i = 0; i < chars.length; i += 1) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = chars[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  ctx.restore();
  return cy + lineHeight;
};

Renderer.prototype.drawCoverBar = function drawCoverBar(x, y, w, cover, max, label, alignRight) {
  const ctx = this.ctx;
  const pct = Math.max(0, Math.min(1, cover / max));
  // 底
  ctx.fillStyle = COLORS.olive;
  ctx.fillRect(x, y, w, 18);
  // 填充
  const fillW = Math.floor(w * pct);
  ctx.fillStyle = pct > 0.35 ? COLORS.signal : COLORS.stamp;
  ctx.fillRect(alignRight ? x + w - fillW : x, y, fillW, 18);
  // 边框
  ctx.strokeStyle = COLORS.dossierDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, 18);
  this.text(label + '  ' + cover, x + (alignRight ? w : 0), y - 28, {
    size: 22,
    color: COLORS.dossier,
    family: FONTS.mono,
    align: alignRight ? 'right' : 'left',
  });
};

Renderer.prototype.drawCardBack = function drawCardBack(x, y, w, h, selected) {
  const ctx = this.ctx;
  ctx.save();
  if (selected) {
    ctx.shadowColor = COLORS.signal;
    ctx.shadowBlur = 16;
  }
  // 底
  ctx.fillStyle = COLORS.olive;
  this.roundRect(x, y, w, h, 6);
  ctx.fill();

  const art = this.assets && this.assets.back;
  if (art) {
    this.drawCoverImage(art, x + 2, y + 2, w - 4, h - 4);
    // 压暗，保证牌背可读
    ctx.save();
    this.roundRect(x + 2, y + 2, w - 4, h - 4, 5);
    ctx.clip();
    ctx.fillStyle = 'rgba(11,18,16,0.18)';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  } else {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = COLORS.signal;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 10, y + h / 2);
    ctx.lineTo(x + w / 2 + 10, y + h / 2);
    ctx.moveTo(x + w / 2, y + h / 2 - 10);
    ctx.lineTo(x + w / 2, y + h / 2 + 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = selected ? COLORS.signal : COLORS.dossierDim;
  ctx.lineWidth = selected ? 3 : 1.5;
  this.roundRect(x, y, w, h, 6);
  ctx.stroke();
  ctx.restore();
};

Renderer.prototype.drawCard = function drawCard(card, x, y, w, h, opts) {
  const ctx = this.ctx;
  const o = opts || {};
  const faceDown = o.faceDown;
  const selected = o.selected;
  const dim = o.dim;
  const reveal = o.reveal;
  const compact = o.compact || w < 140;

  if (faceDown || (reveal != null && reveal < 0.5)) {
    this.drawCardBack(x, y, w, h, selected);
    return;
  }

  ctx.save();
  if (dim) ctx.globalAlpha = 0.5;
  if (selected) {
    ctx.shadowColor = COLORS.signal;
    ctx.shadowBlur = 18;
  }

  // 纸面
  ctx.fillStyle = COLORS.paper;
  this.roundRect(x, y, w, h, 6);
  ctx.fill();

  // 插画区
  const artH = compact ? Math.floor(h * 0.58) : Math.floor(h * 0.52);
  const art = this.assets && this.assets.getCard ? this.assets.getCard(resolveId(card.id)) : null;
  const accent = TYPE_COLOR[card.type] || COLORS.haze;

  ctx.save();
  this.roundRect(x + 2, y + 2, w - 4, artH, 4);
  ctx.clip();
  if (art) {
    this.drawCoverImage(art, x + 2, y + 2, w - 4, artH);
  } else {
    ctx.fillStyle = COLORS.olive;
    ctx.fillRect(x + 2, y + 2, w - 4, artH);
  }
  // 底部渐隐，衔接文字区
  const grad = ctx.createLinearGradient(0, y + artH - 28, 0, y + artH);
  grad.addColorStop(0, 'rgba(232,223,200,0)');
  grad.addColorStop(1, 'rgba(232,223,200,0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(x + 2, y + artH - 28, w - 4, 28);
  ctx.restore();

  // 类型色条
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, w, 8);
  this.roundRect(x, y, w, 12, 4);
  ctx.globalAlpha = (dim ? 0.5 : 1) * 0.35;
  ctx.fill();
  ctx.globalAlpha = dim ? 0.5 : 1;

  // 暗号频段角标
  if (card.band) {
    const bc = BAND_COLORS[card.band] || COLORS.signal;
    ctx.fillStyle = bc;
    ctx.beginPath();
    ctx.arc(x + w - 18, y + 22, 14, 0, Math.PI * 2);
    ctx.fill();
    this.text(card.band, x + w - 18, y + 22, {
      size: 14,
      color: COLORS.void,
      align: 'center',
      baseline: 'middle',
      weight: '700',
      family: FONTS.sans,
    });
  }

  // 边框
  ctx.strokeStyle = selected ? COLORS.signal : COLORS.ink;
  ctx.lineWidth = selected ? 2.5 : 1.5;
  this.roundRect(x, y, w, h, 6);
  ctx.stroke();

  // 名称
  this.text(card.name, x + w / 2, y + artH + (compact ? 14 : 18), {
    size: compact ? 22 : 28,
    color: COLORS.ink,
    align: 'center',
    weight: '700',
    family: FONTS.sans,
    maxWidth: w - 12,
  });

  // 类型
  this.text(TYPE_LABEL[card.type] || '', x + w / 2, y + artH + (compact ? 40 : 52), {
    size: compact ? 14 : 16,
    color: accent,
    align: 'center',
    family: FONTS.mono,
    weight: '700',
  });

  // 大卡显示短描述
  if (!compact) {
    this.wrapText(card.short || '', x + 12, y + artH + 78, w - 24, 22, {
      size: 16,
      color: '#3A3F3A',
      family: FONTS.sans,
      align: 'left',
    });
  }

  ctx.restore();
};

Renderer.prototype.drawButton = function drawButton(rect, label, opts) {
  const ctx = this.ctx;
  const o = opts || {};
  const pressed = o.pressed;
  const disabled = o.disabled;
  ctx.save();
  if (disabled) ctx.globalAlpha = 0.4;
  ctx.fillStyle = pressed ? COLORS.stamp : (o.primary ? COLORS.stamp : COLORS.olive);
  this.roundRect(rect.x, rect.y, rect.w, rect.h, 4);
  ctx.fill();
  ctx.strokeStyle = o.primary ? COLORS.stampBright : COLORS.signalDim;
  ctx.lineWidth = 2;
  ctx.stroke();
  this.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2, {
    size: o.size || 28,
    color: COLORS.white,
    align: 'center',
    baseline: 'middle',
    weight: '700',
    family: FONTS.sans,
  });
  ctx.restore();
};

Renderer.prototype.hitTest = function hitTest(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
};

Renderer.prototype.drawLog = function drawLog(lines, x, y, maxW) {
  const recent = lines.slice(-5);
  this.ctx.save();
  this.ctx.fillStyle = 'rgba(11,18,16,0.75)';
  this.roundRect(x - 10, y - 8, maxW + 20, recent.length * 30 + 16, 4);
  this.ctx.fill();
  this.ctx.restore();
  recent.forEach((line, i) => {
    this.text('› ' + line, x, y + i * 30, {
      size: 18,
      color: COLORS.dossierDim,
      family: FONTS.mono,
      maxWidth: maxW,
    });
  });
};

/** 绘制特工选择卡 */
Renderer.prototype.drawAgentCard = function drawAgentCard(agent, x, y, w, h, selected) {
  const ctx = this.ctx;
  ctx.save();
  if (selected) {
    ctx.shadowColor = COLORS.signal;
    ctx.shadowBlur = 20;
  }

  const bg = selected ? COLORS.oliveLight : COLORS.voidSoft;
  ctx.fillStyle = bg;
  this.roundRect(x, y, w, h, 8);
  ctx.fill();

  // 特工色条
  const accent = agent.color || COLORS.info;
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, w, 8);
  this.roundRect(x, y, w, 12, 4);
  ctx.globalAlpha = 0.25;
  ctx.fill();
  ctx.globalAlpha = 1;

  // 代号图标（用圆形模拟头像）
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 60, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // 首字
  this.text(agent.name.charAt(0), x + w / 2, y + 60, {
    size: 36,
    color: accent,
    align: 'center',
    baseline: 'middle',
    weight: '700',
    family: FONTS.sans,
  });

  // 名称
  this.text(agent.name, x + w / 2, y + 98, {
    size: 20,
    color: COLORS.paper,
    align: 'center',
    weight: '700',
    family: FONTS.sans,
  });

  // 称号
  this.text(agent.title, x + w / 2, y + 122, {
    size: 13,
    color: accent,
    align: 'center',
    family: FONTS.mono,
  });

  // 边框
  ctx.strokeStyle = selected ? COLORS.signal : COLORS.oliveLight;
  ctx.lineWidth = selected ? 2.5 : 1.5;
  this.roundRect(x, y, w, h, 8);
  ctx.stroke();

  ctx.restore();
};

module.exports = Renderer;