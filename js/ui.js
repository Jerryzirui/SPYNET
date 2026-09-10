/**
 * 谍网 — UI 组件（按钮态 / Toast / 遮罩 / 进度）
 */

const { COLORS, FONTS } = require('./config');

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function Toast() {
  this.items = [];
}

Toast.prototype.push = function push(text, kind) {
  this.items.push({
    text: String(text),
    kind: kind || 'info',
    t: 0,
    life: 2.2,
  });
  if (this.items.length > 4) this.items.shift();
};

Toast.prototype.update = function update(dt) {
  this.items.forEach((it) => {
    it.t += dt;
  });
  this.items = this.items.filter((it) => it.t < it.life);
};

Toast.prototype.draw = function draw(R, x, y) {
  this.items.forEach((it, i) => {
    const a = it.t < 0.15 ? it.t / 0.15 : it.t > it.life - 0.35 ? (it.life - it.t) / 0.35 : 1;
    const rise = easeOutCubic(Math.min(1, it.t / 0.35)) * 12;
    const color =
      it.kind === 'bad' ? COLORS.stampBright : it.kind === 'good' ? COLORS.win : COLORS.signal;
    R.ctx.save();
    R.ctx.globalAlpha = Math.max(0, a);
    R.ctx.fillStyle = 'rgba(3,6,5,0.82)';
    const w = Math.min(420, 40 + it.text.length * 16);
    R.roundRect(x - w / 2, y + i * 40 - rise, w, 34, 4);
    R.ctx.fill();
    R.ctx.strokeStyle = color;
    R.ctx.lineWidth = 1;
    R.ctx.stroke();
    R.text(it.text, x, y + 17 + i * 40 - rise, {
      size: 18,
      color: color,
      align: 'center',
      baseline: 'middle',
      family: FONTS.sans,
    });
    R.ctx.restore();
  });
};

function drawButton(R, rect, label, opts) {
  const o = opts || {};
  const ctx = R.ctx;
  const disabled = !!o.disabled;
  const primary = !!o.primary;
  const danger = !!o.danger;
  ctx.save();
  if (disabled) ctx.globalAlpha = 0.35;

  // 底
  let bg = COLORS.olive;
  let border = COLORS.oliveLight;
  if (primary) {
    bg = COLORS.stamp;
    border = COLORS.stampBright;
  } else if (danger) {
    bg = '#4A221C';
    border = COLORS.stamp;
  }
  ctx.fillStyle = bg;
  R.roundRect(rect.x, rect.y, rect.w, rect.h, 6);
  ctx.fill();

  // 顶光
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  R.roundRect(rect.x, rect.y, rect.w, rect.h * 0.45, 6);
  ctx.fill();

  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  R.roundRect(rect.x, rect.y, rect.w, rect.h, 6);
  ctx.stroke();

  R.text(label, rect.x + rect.w / 2, rect.y + rect.h / 2, {
    size: o.size || 26,
    color: disabled ? COLORS.haze : COLORS.white,
    align: 'center',
    baseline: 'middle',
    weight: '700',
    family: FONTS.sans,
  });
  ctx.restore();
}

function drawPanel(R, x, y, w, h, title) {
  const ctx = R.ctx;
  ctx.save();
  ctx.fillStyle = 'rgba(10,16,14,0.92)';
  R.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = COLORS.oliveLight;
  ctx.lineWidth = 2;
  ctx.stroke();
  if (title) {
    R.text(title, x + w / 2, y + 36, {
      size: 28,
      color: COLORS.paper,
      align: 'center',
      weight: '700',
    });
    ctx.strokeStyle = COLORS.signalDim;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 64);
    ctx.lineTo(x + w - 28, y + 64);
    ctx.stroke();
  }
  ctx.restore();
}

function drawChip(R, x, y, label, color) {
  const ctx = R.ctx;
  const w = 18 + label.length * 14;
  ctx.save();
  ctx.fillStyle = 'rgba(3,6,5,0.75)';
  R.roundRect(x, y, w, 28, 14);
  ctx.fill();
  ctx.strokeStyle = color || COLORS.signalDim;
  ctx.lineWidth = 1;
  ctx.stroke();
  R.text(label, x + w / 2, y + 14, {
    size: 14,
    color: color || COLORS.signal,
    align: 'center',
    baseline: 'middle',
    family: FONTS.mono,
  });
  ctx.restore();
  return w;
}

module.exports = {
  Toast,
  drawButton,
  drawPanel,
  drawChip,
  lerp,
  easeOutCubic,
};
