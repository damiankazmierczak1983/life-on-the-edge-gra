"use strict";
/* Static local case validator. All answers are included in the published client bundle. */
(()=>{
const KEY='lote_offline_cases_v12';let data={};try{data=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){}
const persist=()=>localStorage.setItem(KEY,JSON.stringify(data));
function progress(ch){if(!data[ch])data[ch]={stage:0,attempts:0,hints:0,events:[],started:Date.now(),errors:{metoda:0,dowody:0,obliczenia:0}};return data[ch]}
function publicCase(ch){const c=window.LOTE_CASES[ch],p=progress(ch),stage=p.stage;return {chapter:ch,name:c.name,story:c.story,docs:c.docs.map((d,i)=>({...d,id:i})).filter(d=>d.release<=stage),stage,steps:4,mission:stage<4?c.stages[stage].mission:'Śledztwo zakończone. Podejmij decyzję strategiczną.',stageTitle:stage<4?c.stages[stage].title:'AKTA ZAMKNIĘTE',diagnosisOptions:stage<4?c.stages[stage].diagnosis_options:[],attempts:p.attempts,hints:p.hints,solved:stage>=4,unlock:stage?c.stages[stage-1].unlock:null}}
function parseAmount(s){s=String(s??'').trim().replace(/[\s\u00a0]/g,'').replace(',','.');return /^-?\d+(\.\d{1,2})?$/.test(s)?Number(s):NaN}
function request(url,body){const ch=Number(body?.chapter||new URL(url,location.href).searchParams.get('chapter'));if(!Number.isInteger(ch)||ch<1||ch>12)throw Error('Niepoprawny rozdział');const p=progress(ch),c=window.LOTE_CASES[ch];if(url.includes('/submit')){if(p.stage>=4)return {ok:true,case:publicCase(ch),feedback:'Śledztwo ukończone.'};const st=c.stages[p.stage],answer=parseAmount(body.answer),method=body.diagnosis===st.diagnosis_answer,docs=Array.isArray(body.evidence)?body.evidence:[],evidence=docs.length>=2&&new Set(docs).size===docs.length&&st.evidence_required.every(i=>docs.includes(i))&&docs.every(i=>Number.isInteger(i)&&i>=0&&i<c.docs.length&&c.docs[i].release<=p.stage),number=Number.isFinite(answer)&&Math.abs(answer-st.answer)<=.025,ok=method&&evidence&&number;p.attempts++;if(!method)p.errors.metoda++;if(!evidence)p.errors.dowody++;if(!number)p.errors.obliczenia++;p.events.push({chapter:ch,stage:p.stage+1,ok,method_ok:method,evidence_ok:evidence,number_ok:number,at:Date.now()});if(ok)p.stage++;persist();return {ok,case:publicCase(ch),feedback:ok?'Zgodność potwierdzona.':'Metoda, źródła lub wynik nie pasują do akt. Wskaż dokumenty uzasadniające rachunek.'}}
if(url.includes('/hint')){if(p.stage>=4)throw Error('Śledztwo ukończone');p.hints++;persist();return {hint:c.stages[p.stage].clues,case:publicCase(ch)}}return publicCase(ch)}
window.LOTE_OFFLINE={request,progress,all:()=>JSON.parse(JSON.stringify(data)),reset:()=>{data={};persist()}};
// When the player restarts, clear investigation results too.
const reset=document.getElementById('reset'),again=document.getElementById('again');
for(const b of [reset,again])b.addEventListener('click',()=>{if(!localStorage.getItem('lote_v1_save'))window.LOTE_OFFLINE.reset()});
})();
