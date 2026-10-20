import { createGame, declareCriticalFloor, throwEgg, STRATEGIES, runStrategy } from './engine.js';
const $=id=>document.getElementById(id); let game=null;
for(let f=1;f<=100;f++){const o=document.createElement('option');o.value=f;o.textContent=`Piso ${f}`;$('floor').append(o);}
$('strategy').innerHTML=STRATEGIES.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
function draw(){ $('throws').textContent=game?.throws??0; $('eggs').textContent=game?.eggs??2; $('safe').textContent=game?`${game.highestSafe}–${game.lowestUnsafe??100}`:'0–100'; $('launch').disabled=!game||game.finished||game.eggs===0; $('tower').innerHTML=Array.from({length:100},(_,i)=>{const f=100-i;const r=game?.history.find(x=>x.floor===f);return `<span class="floor-tile ${r?(r.broke?'broken':'safe'):''}">${f}</span>`}).join('');}
function begin(){const v=$('critical').value;game=createGame(v==='random'?undefined:v==='none'?null:Number(v));$('message').textContent='Partida iniciada. Elige un piso para lanzar.';if($('mode').value==='simulation'){const id=$('strategy').value;const r=runStrategy(id,game.criticalFloor);game=r.game;$('message').textContent=`${STRATEGIES.find(s=>s.id===id).name}: ${r.throws} lanzamientos; ${r.correct?'identificó correctamente el piso crítico.':'revisa el resultado.'}`;}$('answer').value=0;draw();}
$('mode').addEventListener('change',()=>{$('strategy-setting').hidden=$('mode').value!=='simulation';$('floor-setting').hidden=$('mode').value==='simulation';});
$('start').addEventListener('click',begin);
$('launch').addEventListener('click',()=>{if(!game)return;try{const r=throwEgg(game,Number($('floor').value));$('message').textContent=r.repeated?'Aviso: el resultado de ese piso ya se conoce.':r.broke?`El huevo se rompió en el piso ${r.floor}.`:`El huevo sobrevivió al piso ${r.floor}.`;draw();}catch(e){$('message').textContent=e.message;}});
$('declare').addEventListener('click',()=>{if(!game)return;const r=declareCriticalFloor(game,Number($('answer').value));$('message').textContent=r.reason;draw();});
$('reset').addEventListener('click',()=>{game=null;$('message').textContent='Partida reiniciada. Inicia una nueva partida.';draw();});
$('comparison').innerHTML=STRATEGIES.map(s=>`<div class="strategy-result"><strong>${s.name}</strong>: ${s.worstCase} lanzamientos</div>`).join('');draw();
