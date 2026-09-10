/**
 * 谍网 — 本地设置 / 隐私同意
 */

const KEY_PRIVACY = 'spynet_privacy_v1';
const KEY_SOUND = 'spynet_sound_v1';
const KEY_VIB = 'spynet_vib_v1';

function hasWxStorage() {
  return typeof wx !== 'undefined' && wx.getStorageSync;
}

function get(key, dflt) {
  try {
    if (hasWxStorage()) {
      const v = wx.getStorageSync(key);
      return v === '' || v == null ? dflt : v;
    }
    const v = localStorage.getItem(key);
    return v == null ? dflt : JSON.parse(v);
  } catch (e) {
    return dflt;
  }
}

function set(key, val) {
  try {
    if (hasWxStorage()) {
      wx.setStorageSync(key, val);
      return;
    }
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) { /* ignore */ }
}

function hasPrivacy() {
  return !!get(KEY_PRIVACY, false);
}

function acceptPrivacy() {
  set(KEY_PRIVACY, true);
}

function getSound() {
  return get(KEY_SOUND, true);
}

function setSound(v) {
  set(KEY_SOUND, !!v);
}

function getVibrate() {
  return get(KEY_VIB, true);
}

function setVibrate(v) {
  set(KEY_VIB, !!v);
}

module.exports = {
  hasPrivacy,
  acceptPrivacy,
  getSound,
  setSound,
  getVibrate,
  setVibrate,
};
