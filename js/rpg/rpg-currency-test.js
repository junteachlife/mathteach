/** RPG currency Firestore TEST only — no production writes. */
import { auth, db } from "../firebase-config.js";
import { doc, getDoc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { RPG_CONFIG, getRpgCollections, isRpgTestEnvironment } from "./rpg-config.js";
const LIMIT = 1000000000;
function safety() {
  if (!isRpgTestEnvironment() || RPG_CONFIG.testMode !== true || RPG_CONFIG.allowProductionWrites !== false) throw Error("僅允許 RPG TEST 環境");
  const c = getRpgCollections();
  if (![c.playerProgress,c.currencyTransactions].every(v=>String(v).startsWith("rpgTest"))) throw Error("測試集合檢查失敗");
  if (!auth.currentUser?.uid) throw Error("請先登入 Google 帳號");
  return {c,uid:auth.currentUser.uid};
}
const n = v => Number.isSafeInteger(v) && v>=0 && v<=LIMIT ? v : 0;
export async function readTestWallet(){
  const {c,uid}=safety();
  const snap=await getDoc(doc(db,c.playerProgress,uid));
  const w=snap.exists()?snap.data().rpgCurrencyTest||{}:{};
  return {yuanbao:n(w.yuanbao),diamonds:n(w.diamonds)};
}
export async function changeTestWallet({kind,amount,operation,reason,transactionId}){
  const {c,uid}=safety();
  if (!['yuanbao','diamonds'].includes(kind)) throw Error('貨幣種類錯誤');
  if (!['add','spend'].includes(operation)) throw Error('操作種類錯誤');
  if (!Number.isSafeInteger(amount)||amount<=0||amount>100000) throw Error('單次數量限 1–100000 整數');
  if (typeof transactionId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(transactionId)) throw Error('交易 ID 不正確');
  const walletRef=doc(db,c.playerProgress,uid);
  const trxRef=doc(db,c.currencyTransactions,`${uid}_${transactionId}`);
  return runTransaction(db,async t=>{
    // Reads must precede writes, and transaction ID makes retries idempotent.
    const [trxSnap,playerSnap]=await Promise.all([t.get(trxRef),t.get(walletRef)]);
    const old=playerSnap.exists()?playerSnap.data().rpgCurrencyTest||{}:{};
    const before={yuanbao:n(old.yuanbao),diamonds:n(old.diamonds)};
    if(trxSnap.exists()) return {duplicate:true,before,after:before};
    const delta=(operation==='add'?1:-1)*amount;
    const newAmount=before[kind]+delta;
    if(newAmount<0) throw Error('餘額不足，無法扣款');
    if(newAmount>LIMIT) throw Error('超過測試餘額上限');
    const after={...before,[kind]:newAmount};
    t.set(walletRef,{uid,rpgCurrencyTest:after},{merge:true});
    t.set(trxRef,{uid,transactionId,kind,operation,amount,delta,before:before[kind],after:newAmount,reason:String(reason||'手動測試').slice(0,100),environment:'test',createdAt:serverTimestamp()});
    return {duplicate:false,before,after};
  });
}
