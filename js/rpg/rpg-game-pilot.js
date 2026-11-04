/*
 * RPG Math Game Pilot - TEST ONLY
 * Requires ?rpgPilot=1 in the game URL and an active superAdmin account.
 * Does not alter original scores; stores only in rpgTest* collections.
 */
import { auth, db } from "../firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { createGameAttempt } from "./attempt-system.js";
import { RPG_CONFIG, isRpgTestEnvironment } from "./rpg-config.js";

const yuanbaoSvg = `<svg width="23" height="18" viewBox="0 0 48 36" aria-label="元寶" role="img" style="vertical-align:-4px;margin-right:3px"><path d="M5 20c7 6 14 2 19-10 5 12 12 16 19 10 1 9-7 13-19 13S4 29 5 20Z" fill="#eab308" stroke="#9a6700" stroke-width="2"/><ellipse cx="24" cy="12" rx="9" ry="6" fill="#ffdf65" stroke="#9a6700" stroke-width="1.8"/></svg>`;

export function createRpgGamePilot({ gameId, statusElement }) {
  let attempt = null;
  let busy = false;
  const element = statusElement;

  function setMessage(message, { html = false } = {}) {
    if (!element) return;
    if (html) element.innerHTML = message;
    else element.textContent = message;
  }

  function ensureRetryButton() {
    let button = element.querySelector('button[data-rpg-pilot-retry]');
    if (!button) {
      button = document.createElement('button');
      button.dataset.rpgPilotRetry = '1';
      button.textContent = '⛔ 重送同一局 RPG TEST（防重測試）';
      button.type = 'button';
      button.style.cssText = 'display:block;margin-top:10px;padding:9px 12px;background:#6d28d9;color:#fff;border:0;border-radius:9px;cursor:pointer';
      button.onclick = () => retry();
      element.appendChild(button);
    }
    button.disabled = busy;
  }

  async function checkTestAdmin() {
    if (new URLSearchParams(location.search).get('rpgPilot') !== '1') return false;
    if (!isRpgTestEnvironment() || RPG_CONFIG.testMode !== true || RPG_CONFIG.allowProductionWrites !== false) {
      throw new Error('RPG 不在安全的 TEST 環境');
    }
    const user = auth.currentUser;
    if (!user) throw new Error('請先使用管理員 Google 帳號登入');
    const adminSnap = await getDoc(doc(db, 'systemAdmins', user.uid));
    if (!adminSnap.exists() || adminSnap.data().role !== 'superAdmin' || adminSnap.data().active !== true) {
      setMessage('ℹ️ 目前帳號不是啟用中的最高管理員，已略過 RPG TEST；正式成績照常保留。');
      return false;
    }
    return true;
  }

  async function commit() {
    if (busy || !attempt) return;
    busy = true;
    setMessage('🧪 正在提交 XP＋元寶＋鑽石到 Firestore TEST…');
    try {
      const { settleTestAttempt } = await import('./rpg-firestore-test.js?v=20261103-atomic');
      const result = await settleTestAttempt({ attempt, awardCurrencyTest: true });
      if (result?.duplicate) {
        setMessage(`⛔ 防重複成功：同一 Attempt 未再次發獎。永久 XP 不變。`);
      } else if (!result?.success) {
        setMessage('⚠️ RPG TEST 結算失敗：' + (result?.message || result?.reason || '未知錯誤') + '。原本數學成績不受影響。');
      } else {
        const xp = Number(result.gainedXp ?? 0);
        const y = Number(result.currencyGains?.yuanbao ?? 0);
        const d = Number(result.currencyGains?.diamonds ?? 0);
        setMessage(`✅ RPG TEST 已結算：✨ +${xp} XP　${yuanbaoSvg} +${y} 元寶　💎 +${d} 鑽石`, {html:true});
      }
      if (result?.success || result?.duplicate) ensureRetryButton();
      return result;
    } catch(err) {
      setMessage('⚠️ RPG TEST 模組／權限錯誤：' + (err?.message || String(err)) + '。原本成績不受影響。');
      console.error('[RPG pilot]', err);
    } finally {
      busy = false;
      if (attempt && element?.querySelector('button[data-rpg-pilot-retry]')) ensureRetryButton();
    }
  }

  async function settle(values) {
    if (!(await checkTestAdmin())) return;
    if (!attempt) attempt = createGameAttempt({ gameId, ...values });
    return commit();
  }
  async function retry() {
    if (!(await checkTestAdmin())) return;
    return commit();
  }
  function reset() {attempt = null; busy = false; if(element)element.textContent='';}
  return {settle,retry,reset};
}
