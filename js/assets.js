/**
 * 谍网 — 美术资源加载
 * 微信: wx.createImage；浏览器: new Image()
 */

const CARD_IDS = [
  'deadletter', 'silence', 'shredder', 'deepsleep', 'safehouse',
  'bait', 'flip', 'mirror', 'otp', 'vanish',
];

const IMG_ALIAS = {
  deadletter: 'intel',
  silence: 'assassin',
  shredder: 'cleaner',
  deepsleep: 'lurk',
  safehouse: 'safehouse',
  bait: 'fake',
  flip: 'defect',
  mirror: 'double',
  otp: 'cipher',
  vanish: 'evac',
};

function isWx() {
  return typeof wx !== 'undefined' && typeof wx.createImage === 'function';
}

function createImage() {
  if (isWx()) return wx.createImage();
  // eslint-disable-next-line no-undef
  return new Image();
}

function AssetStore() {
  this.cards = {};
  this.back = null;
  this.titleBg = null;
  this.ready = false;
  this.total = 0;
  this.loaded = 0;
}

AssetStore.prototype.load = function load(basePath) {
  const self = this;
  const base = basePath || 'assets/';
  const jobs = [];

  function track(img, src) {
    self.total += 1;
    return new Promise((resolve) => {
      img.onload = function () {
        self.loaded += 1;
        resolve(img);
      };
      img.onerror = function () {
        self.loaded += 1;
        resolve(null);
      };
      img.src = src;
    });
  }

  CARD_IDS.forEach((id) => {
    const img = createImage();
    const file = IMG_ALIAS[id] || id;
    jobs.push(track(img, base + 'cards/' + file + '.jpg').then((im) => {
      if (im) self.cards[id] = im;
    }));
  });

  const back = createImage();
  jobs.push(track(back, base + 'cards/back.jpg').then((im) => {
    if (im) self.back = im;
  }));

  const bg = createImage();
  jobs.push(track(bg, base + 'title-bg.jpg').then((im) => {
    if (im) self.titleBg = im;
  }));

  return Promise.all(jobs).then(() => {
    self.ready = true;
    return self;
  });
};

AssetStore.prototype.progress = function progress() {
  if (!this.total) return 0;
  return this.loaded / this.total;
};

AssetStore.prototype.getCard = function getCard(id) {
  return this.cards[id] || null;
};

module.exports = {
  AssetStore,
  CARD_IDS,
};
