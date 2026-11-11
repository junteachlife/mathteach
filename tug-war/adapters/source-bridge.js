(()=>{
'use strict';
const GAME_DEFS=[{"id":"source:grade7-1-exponent-scientific-notation","semester":"七上","title":"指數與科學記號大挑戰｜數學遊戲樂園","source":"tug-war/adapters/sources/grade7-1/exponent-scientific-notation.html","modes":[{"id":"notation","name":"🔢 指數記法基礎"},{"id":"operations","name":"🧮 含指數四則運算"},{"id":"tenPower","name":"🔟 10 的次方與位值"}]},{"id":"source:grade7-2-direct-inverse-proportion","semester":"七下","title":"七下 3-2 正比與反比大挑戰","source":"tug-war/adapters/sources/grade7-2/direct-inverse-proportion.html","modes":[{"id":"relationJudge","name":"🔍 正比／反比判別"},{"id":"directProportion","name":"📈 正比關係"},{"id":"inverseProportion","name":"🔁 反比關係"},{"id":"proportionApplication","name":"🧪 正反比生活應用"}]},{"id":"source:grade7-2-linear-equation-graph","semester":"七下","title":"七下 2-2 二元一次方程式的圖形大挑戰","source":"tug-war/adapters/sources/grade7-2/linear-equation-graph.html","modes":[{"id":"solutionPoints","name":"✅ 方程式的解與點"},{"id":"lineGraphIntercepts","name":"🎯 畫線與兩軸交點"},{"id":"equationFromGraph","name":"🧩 由點求直線方程式"}]},{"id":"source:grade7-2-linear-inequality-basics","semester":"七下","title":"4-1 一元一次不等式的解及圖示大挑戰","source":"tug-war/adapters/sources/grade7-2/linear-inequality-basics.html","modes":[{"id":"meaning","name":"不等式與語句"},{"id":"solutionCheck","name":"代入檢驗解"},{"id":"numberLineRead","name":"數線判讀"}]},{"id":"source:grade7-2-linear-system-applications","semester":"七下","title":"七下 1-3 應用問題大挑戰","source":"tug-war/adapters/sources/grade7-2/linear-system-applications.html","modes":[{"id":"reasonableness","name":"✅ 合理性與無解判斷"}]},{"id":"source:grade7-2-proportion-equation","semester":"七下","title":"七下 3-1 比例式大挑戰","source":"tug-war/adapters/sources/grade7-2/proportion-equation.html","modes":[{"id":"ratioValue","name":"➗ 比與比值"},{"id":"proportionSolve","name":"⚖️ 比例式求未知數"}]},{"id":"source:grade7-2-statistics-data","semester":"七下","title":"5 統計圖表與統計數據大挑戰","source":"tug-war/adapters/sources/grade7-2/statistics-data.html","modes":[{"id":"chartsRead","name":"生活統計圖表"},{"id":"contingency","name":"列聯表"},{"id":"frequency","name":"次數分配與圖形"},{"id":"center","name":"平均數・中位數・眾數"}]},{"id":"source:grade7-2-symmetry-three-views","semester":"七下","title":"6 線對稱與三視圖大挑戰","source":"tug-war/adapters/sources/grade7-2/symmetry-three-views.html","modes":[{"id":"geometryBasics","name":"簡單圖形與垂直平分"},{"id":"symmetryJudge","name":"線對稱判斷"},{"id":"reflection","name":"對稱點與完成圖形"}]},{"id":"source:grade7-2-two-variable-linear-equation","semester":"七下","title":"七下 1-1 二元一次方程式大挑戰","source":"tug-war/adapters/sources/grade7-2/two-variable-linear-equation.html","modes":[{"id":"expressionBasics","name":"🧮 二元一次式與求值"},{"id":"simplify","name":"🧹 二元一次式化簡"},{"id":"equationSolution","name":"🎯 方程式與解"},{"id":"integerSolutions","name":"🔎 正整數解與合理性"}]},{"id":"source:grade8-1-multiplication-formula","semester":"八上","title":"乘法公式大挑戰","source":"tug-war/adapters/sources/grade8-1/multiplication-formula.html","modes":[{"id":"numberBasic","name":"數字乘法公式"},{"id":"numberMixed","name":"數字變化計算"}]},{"id":"source:grade8-1-quadratic-applications","semester":"八上","title":"4-3 一元二次方程式應用問題大挑戰","source":"tug-war/adapters/sources/grade8-1/quadratic-applications.html","modes":[{"id":"geometry","name":"📐 面積與路寬問題"},{"id":"priceRevenue","name":"💰 售價、數量與收入"},{"id":"validityApprox","name":"✅ 合理根與近似值"}]},{"id":"source:grade8-1-quadratic-completing-formula","semester":"八上","title":"4-2 配方法與公式解大挑戰","source":"tug-war/adapters/sources/grade8-1/quadratic-completing-formula.html","modes":[{"id":"discriminant","name":"🔎 判別式與根的情形"}]},{"id":"source:grade8-1-quadratic-equation","semester":"八上","title":"4-3 一元二次方程式應用問題大挑戰","source":"tug-war/adapters/sources/grade8-1/quadratic-equation.html","modes":[{"id":"geometry","name":"📐 面積與路寬問題"},{"id":"priceRevenue","name":"💰 售價、數量與收入"},{"id":"validityApprox","name":"✅ 合理根與近似值"}]},{"id":"source:grade8-1-square-root","semester":"八上","title":"平方根大挑戰｜數學遊戲樂園","source":"tug-war/adapters/sources/grade8-1/square-root.html","modes":[{"id":"squarePractice","name":"平方數熟練場"},{"id":"approximation","name":"根號值與十分逼近"},{"id":"meaning","name":"平方根觀念應用"}]},{"id":"source:grade8-1-statistics-data-processing","semester":"八上","title":"5 統計資料處理大挑戰","source":"tug-war/adapters/sources/grade8-1/statistics-data-processing.html","modes":[{"id":"relativeFrequency","name":"📋 相對次數分配表"},{"id":"relativeGraph","name":"📈 相對次數折線圖"},{"id":"cumulativeFrequency","name":"➕ 累積次數分配"},{"id":"cumulativeRelative","name":"📉 累積相對次數分配"},{"id":"graphInterpretation","name":"🔎 統計圖表判讀與比較"}]},{"id":"source:grade9-1-central-inscribed-angle","semester":"九上","title":"九上 2-2 圓心角與圓周角大挑戰","source":"tug-war/adapters/sources/grade9-1/central-inscribed-angle.html","modes":[{"id":"centralArc","name":"🎯 圓心角、弧與弦"},{"id":"inscribedAngle","name":"📐 圓周角與弧"},{"id":"diameterParallel","name":"⭕ 直徑與平行線截弧"},{"id":"cyclicQuadrilateral","name":"◇ 圓內接四邊形"}]},{"id":"source:grade9-1-continued-ratio","semester":"九上","title":"九上 1-1 連比大挑戰","source":"tug-war/adapters/sources/grade9-1/continued-ratio.html","modes":[{"id":"parts","name":"🧃 按比例分配"}]},{"id":"source:grade9-1-geometric-proof","semester":"九上","title":"九上 3-1 推理證明大挑戰","source":"tug-war/adapters/sources/grade9-1/geometric-proof.html","modes":[{"id":"proofStructure","name":"🧩 證明結構與理由"},{"id":"geometryProof","name":"📐 幾何推理證明"},{"id":"auxiliaryLine","name":"✏️ 輔助線與思路分析"},{"id":"parityProof","name":"🔢 奇偶數證明"},{"id":"algebraProof","name":"🧮 代數推理與因數倍數"}]},{"id":"source:grade9-1-point-line-circle","semester":"九上","title":"九上 2-1 點、線、圓大挑戰","source":"tug-war/adapters/sources/grade9-1/point-line-circle.html","modes":[{"id":"pointCircle","name":"🎯 點與圓的位置"},{"id":"lineCircle","name":"📏 直線與圓的位置"},{"id":"tangent","name":"📐 切線與切線段"},{"id":"chordDistance","name":"🪢 弦與弦心距"}]},{"id":"source:grade9-1-proportional-segments","semester":"九上","title":"九上 1-2 比例線段大挑戰","source":"tug-war/adapters/sources/grade9-1/proportional-segments.html","modes":[{"id":"parallelSegments","name":"🛤️ 平行線截比例線段"},{"id":"parallelJudge","name":"✅ 比例線段判別平行"},{"id":"midpoint","name":"✂️ 中點連線段"}]},{"id":"source:grade9-1-similar-polygons","semester":"九上","title":"九上 1-3 相似多邊形大挑戰","source":"tug-war/adapters/sources/grade9-1/similar-polygons.html","modes":[{"id":"scaling","name":"🔍 圖形縮放"},{"id":"polygonSimilarity","name":"⬡ 相似多邊形"},{"id":"aaSimilarity","name":"∠ AA 相似"},{"id":"sasSimilarity","name":"📏 SAS 相似"},{"id":"sssSimilarity","name":"△ SSS 相似"}]},{"id":"source:grade9-1-similar-triangle-trig","semester":"九上","title":"九上 1-4 相似三角形應用與三角比大挑戰","source":"tug-war/adapters/sources/grade9-1/similar-triangle-trig.html","modes":[{"id":"measurement","name":"🌳 簡易測量"},{"id":"specialRight","name":"📏 特殊直角三角形"},{"id":"trigRatio","name":"sin 三角比"},{"id":"trigApplication","name":"🚲 三角比應用"}]}];
const frames=new Map();
function sourceFor(g){
 if(frames.has(g.id))return frames.get(g.id);
 const iframe=document.createElement('iframe');
 iframe.hidden=true; iframe.tabIndex=-1;iframe.setAttribute('aria-hidden','true');
 iframe.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-10000px';
 iframe.src='./'+g.source;
 document.body.appendChild(iframe);
 const wait=new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('原始題庫載入逾時：'+g.title)),12000);
  iframe.addEventListener('load',()=>{
   const started=Date.now();
   const poll=()=>{
    try{const api=iframe.contentWindow?.__TUG_SOURCE__;
      if(api?.generate){clearTimeout(timeout);resolve(api);return;}}
    catch(e){clearTimeout(timeout);reject(e);return;}
    if(Date.now()-started<5000)setTimeout(poll,100);
    else{clearTimeout(timeout);reject(Error('來源模組未能啟動：'+g.title));}
   };poll();
  },{once:true});
  iframe.addEventListener('error',()=>{clearTimeout(timeout);reject(Error('無法讀取題庫：'+g.source));},{once:true});
 });
 frames.set(g.id,wait);
 return wait;
}
function numeric(s){
 const v=String(s).replace(/−/g,'-').replace(/\s/g,'');
 if(/^[-+]?\d+(?:\.\d+)?$/.test(v))return Number(v);
 const f=v.match(/^([-+]?\d+)\/([1-9]\d*)$/);
 return f?Number(f[1])/Number(f[2]):NaN;
}
function answerNumber(q){
 const v=q.answer;
 if(typeof v==='number')return v;
 if(v&&typeof v==='object'&&Number.isFinite(v.n)&&Number.isFinite(v.d)&&v.d!==0)return v.n/v.d;
 return numeric(v);
}
function convert(q){
 const kind=q.type||q.kind;
 const html=String(q.html||q.questionHTML||q.prompt||q.question||'');
 if(!html)throw Error('題目缺少顯示內容');
 if(kind==='choice'){
  if(!Array.isArray(q.choices)&&!Array.isArray(q.options))throw Error('選擇題沒有選項');
  const originals=q.choices||q.options;
  const options=originals.map((o,i)=>{
   const id=typeof o==='object' ? String(o.value??o.id??o.label??i) : String(o);
   const presentation=typeof o==='object'?String(o.html??o.text??o.label??id):String(o);
   return {label:String.fromCharCode(65+i),text:presentation,html:presentation,sourceValue:id};
  });
  const key=String(q.answer);
  const chosen=options.find(o=>o.sourceValue===key || o.text===key || o.html===key);
  if(!chosen)throw Error('選擇題正確答案不在選項內');
  return {question:html.replace(/<[^>]+>/g,'').trim()||'選擇題',questionHTML:html,inputType:'choice',options,correct:chosen.label,difficulty:q.difficulty||q.family||''};
 }
 if(!['number','decimal','rational'].includes(kind))throw Error('題型尚不支援：'+kind);
 const ans=answerNumber(q);
 if(!Number.isFinite(ans))throw Error('沒有有效的數值答案');
 return {question:html.replace(/<[^>]+>/g,'').trim()||'計算題',questionHTML:html,inputType:'number',numeric:ans,difficulty:q.difficulty||q.family||'',answerType:kind};
}
function makeAdapter(g){
 let api=null,queue=[],mode='';
 function replenish(selected){
  const original=api.generate(selected);
  if(!Array.isArray(original)||!original.length)throw Error('原始模式沒有回傳題目');
  for(const raw of original)queue.push(convert(raw));
  if(queue.length>500)queue=queue.slice(-200);
 }
 function next(selected){if(mode!==selected){mode=selected;queue=[];} if(queue.length<2)replenish(selected);return queue.shift();}
 return {
  id:g.id,semester:g.semester,title:g.title,modes:g.modes,
  description:'原始遊戲出題程式的獨立副本（測試串接）；特殊答案模式仍待適配，原始遊戲不修改。',
  async prepare(selected){api=await sourceFor(g);mode='';queue=[];replenish(selected);},
  generatePair(selected){if(!api)throw Error('請先載入原始出題模組');let a=next(selected),b=next(selected);let n=0;while(a.questionHTML===b.questionHTML&&n++<20)b=next(selected);if(a.questionHTML===b.questionHTML)throw Error('兩隊抽到同一題');return [a,b];},
  validate(q,answer){if(q.inputType==='choice')return String(answer).trim().toUpperCase()===q.correct;const n=numeric(answer);return Number.isFinite(n)&&Math.abs(n-q.numeric)<=1e-6*Math.max(1,Math.abs(q.numeric));}
 };
}
for(const g of GAME_DEFS)try{window.TugWar.register(makeAdapter(g));}catch(e){console.warn('競賽題庫略過',g.title,e);}
})();
