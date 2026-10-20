import { createGame, declareCriticalFloor, throwEgg, STRATEGIES, strategySteps, randomCriticalFloor } from './engine.js';
const $=id=>document.getElementById(id);
let game=null, selectedFloor=50, round=0, toastTimer, animating=false, dragActive=false, dragPointer=null;
let strategyActive=false, strategyPlan=[], strategyIndex=0;
function makeBuilding(){
  const tower=$('tower');tower.innerHTML='';
  for(let f=100;f>=1;f--){
    const cell=document.createElement('button');cell.type='button';cell.className='floor';cell.dataset.floor=f;
    if(f%10===0)cell.classList.add('floor-milestone');
    cell.setAttribute('aria-label',`Piso ${f}, suelta aquí el huevo`);cell.title=`Piso ${f}: arrastra aquí el huevo`;
    cell.innerHTML=`<span class="floor-number">${f}</span><span class="windows"><i></i><i></i></span><span class="egg-marker" aria-hidden="true">🥚</span>`;
    cell.addEventListener('click',()=>{if(!game||game.finished||animating)return;selectedFloor=f;draw();if(game.history.some(x=>x.floor===f))showToast('Ese piso ya fue probado.');});
    tower.append(cell);
  }
}
function setMessage(text,kind=''){ $('message').textContent=text; $('message').className=`message ${kind}`; }
function draw(){
  $('throws').textContent=game?.throws??0;$('selected-floor').textContent=selectedFloor;
  const eggs=game?.eggs??2;
  $('egg-icons').innerHTML=Array.from({length:2},(_,i)=>`<button class="egg-icon ${i>=eggs?'used':''}" type="button" draggable="false" data-egg="${i}" aria-label="${i>=eggs?'Huevo usado':'Arrastrar huevo al edificio'}" ${i>=eggs||animating?'disabled':''}>🥚</button>`).join('');
  $('egg-icons').setAttribute('aria-label',`${eggs} huevos disponibles`);
  $('launch').disabled=!game||game.finished||game.eggs===0||animating||strategyActive;
  $('strategy-next').disabled=!strategyActive||animating||strategyIndex>=strategyPlan.length;

  const safeCount=game?.history.filter(x=>!x.broke).length??0;
  $('progress-label').textContent=`${safeCount} / 100`;$('progress-bar').style.width=`${safeCount}%`;
  $('progress-copy').textContent=game?.eggs===0?'Sin huevos: haz tu apuesta final.':safeCount?`Ya confirmaste ${safeCount} piso${safeCount===1?'':'s'} seguro${safeCount===1?'':'s'}.`:'Cada lanzamiento te acerca a la respuesta.';
  document.querySelectorAll('.floor').forEach(cell=>{
    const f=Number(cell.dataset.floor),result=game?.history.find(x=>x.floor===f);
    cell.classList.toggle('selected',f===selectedFloor);cell.classList.toggle('safe',Boolean(result&&!result.broke));cell.classList.toggle('broken',Boolean(result?.broke));cell.classList.toggle('egg-used',Boolean(result));
    cell.classList.toggle('drop-target',dragActive);cell.disabled=!game||game.finished||animating;
  });
}
function showToast(text,kind=''){const toast=$('toast');toast.className=`toast ${kind} show`;toast.querySelector('#toast-text').textContent=text;toast.querySelector('#toast-icon').textContent=kind==='throw-survived'?'🥚✨':kind==='throw-broken'?'🥚💥':'';clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.className='toast';},2800);}
function startGame(force=false){if(!force&&game&&!game.finished&&!window.confirm('¿Empezar una partida nueva? Perderás el progreso actual.'))return;strategyActive=false;strategyPlan=[];strategyIndex=0;round++;game=createGame();selectedFloor=50;animating=false;$('round-label').textContent=`#${String(round).padStart(2,'0')}`;$('guess-box').hidden=true;$('result-overlay').hidden=true;$('result-close').hidden=false;$('result-continue').onclick=null;setMessage('Arrastra un huevo hasta una ventana para probar ese piso.');$('strategy-status').textContent='Elige una estrategia y el piso crítico para verla en acción.';draw();}
function animateFall(floor,broke){
  return new Promise(resolve=>{
    const cell=document.querySelector(`.floor[data-floor="${floor}"]`);const start=cell?.getBoundingClientRect();const ground=$('.ground-line')?.getBoundingClientRect();
    if(!start||!ground){resolve();return;}
    const egg=document.createElement('span');egg.className=`egg-projectile ${broke?'will-break':'will-survive'}`;egg.textContent='🥚';
    egg.style.left=`${start.left+start.width/2-15}px`;egg.style.top=`${start.top+start.height/2-15}px`;document.body.append(egg);
    const distance=Math.max(80,ground.top-start.top-20);const animation=egg.animate([
      {transform:'translate3d(0,0,0) rotate(0deg) scale(1)',offset:0},
      {transform:`translate3d(0,${Math.round(distance*.72)}px,0) rotate(${broke?270:240}deg) scale(.92)`,offset:.72},
      {transform:`translate3d(0,${Math.round(distance)}px,0) rotate(${broke?540:360}deg) scale(${broke?1.2:.82})`,opacity:broke?0:1,offset:1}
    ],{duration:1050,easing:'cubic-bezier(.18,.7,.28,1)',fill:'forwards'});
    animation.finished.then(()=>{egg.remove();resolve();}).catch(()=>{egg.remove();resolve();});
  });
}
async function launchAtFloor(floor){
  if(!game||game.finished||animating||game.eggs===0)return;
  if(game.history.some(item=>item.floor===floor)){setMessage(`El piso ${floor} ya fue probado. No cuenta como lanzamiento.`,'notice');showToast('Ese piso ya tiene resultado.');return;}
  selectedFloor=floor;animating=true;draw();
  let result;
  try{result=throwEgg(game,floor);}catch(e){animating=false;setMessage(e.message,'notice');draw();return;}
  await animateFall(floor,result.broke);
  animating=false;draw();
  if(result.repeated){setMessage(`El piso ${floor} ya fue probado. No cuenta como lanzamiento.`,'notice');showToast('Piso ya comprobado.');}
  else if(result.broke){setMessage(`¡CRASH! El huevo se rompió en el piso ${floor}.`,'broken');}
  else{setMessage(`¡A salvo! El huevo sobrevivió al piso ${floor}.`,'safe');}
  if(strategyActive){strategyIndex++;$('strategy-status').textContent=`${$('strategy-choice').selectedOptions[0].text}: paso ${strategyIndex} de ${strategyPlan.length}. Se probó el piso ${floor}; ${result.broke?'se rompió.':'sobrevivió.'}`;if(strategyIndex>=strategyPlan.length){game.finished=true;const safe=game.highestSafe; $('strategy-status').textContent=`Simulación terminada: ${$('strategy-choice').selectedOptions[0].text} identificó que el piso seguro más alto es ${safe} en ${game.throws} lanzamientos.`;}}
  if(!strategyActive&&game.eggs===0){game.finished=true;$('guess-box').hidden=false;setMessage('Sin huevos: haz tu apuesta final.','notice');}
  const feedback=result.repeated?'Ese piso ya fue comprobado.':result.broke?`¡SE ROMPIÓ! El huevo cayó desde el piso ${floor}.`:`¡SOBREVIVIÓ! El huevo llegó entero desde el piso ${floor}.`;
  showToast(feedback,result.repeated?'':result.broke?'throw-broken':'throw-survived');
}
function finishResult(){
  $('result-overlay').hidden=true;
  if(strategyActive){if(strategyIndex<strategyPlan.length)$('strategy-next').focus();draw();return;}
  if(game?.eggs===0){game.finished=true;$('guess-box').hidden=false;setMessage('Te quedaste sin huevos. Haz tu apuesta final.','notice');}
  draw();
}
function beginDrag(event){
  const egg=event.target.closest('.egg-icon');if(!egg||egg.disabled||!game||animating)return;
  event.preventDefault();dragActive=true;dragPointer=event.pointerId;$('drag-ghost').classList.add('active');moveDrag(event);draw();
}
function moveDrag(event){
  if(!dragActive||event.pointerId!==dragPointer)return;
  const ghost=$('drag-ghost');ghost.style.left=`${event.clientX-20}px`;ghost.style.top=`${event.clientY-20}px`;
  document.querySelectorAll('.floor.drop-hover').forEach(x=>x.classList.remove('drop-hover'));
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.floor');if(target&&!target.disabled)target.classList.add('drop-hover');
}
function endDrag(event){
  if(!dragActive||event.pointerId!==dragPointer)return;
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.floor');const floor=target&&!target.disabled?Number(target.dataset.floor):null;
  dragActive=false;dragPointer=null;$('drag-ghost').classList.remove('active');document.querySelectorAll('.floor.drop-hover').forEach(x=>x.classList.remove('drop-hover'));draw();
  if(floor)launchAtFloor(floor);
}
$('egg-icons').addEventListener('pointerdown',beginDrag);document.addEventListener('pointermove',moveDrag);document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);
$('launch').addEventListener('click',()=>launchAtFloor(selectedFloor));$('reset').addEventListener('click',()=>startGame());
$('result-close').addEventListener('click',finishResult);$('result-continue').addEventListener('click',finishResult);
$('result-overlay').addEventListener('click',e=>{if(e.target===$('result-overlay'))finishResult();});
$('guess-toggle').addEventListener('click',()=>{$('guess-box').hidden=!$('guess-box').hidden;});
$('declare').addEventListener('click',()=>{if(!game)return;const value=Number($('answer').value);try{const r=declareCriticalFloor(game,value);const title=r.correct?'¡LO ENCONTRASTE!':'NO ERA ESE PISO';$('result-card').className=`result-card ${r.correct?'result-survived':'result-broken'}`;$('result-icon').textContent=r.correct?'🏆':'🥚💥';$('result-kicker').textContent=r.correct?'RETO COMPLETADO':'PARTIDA TERMINADA';$('result-title').textContent=title;const reveal=r.actualSafeFloor===100?'Ninguno de los 100 pisos rompe el huevo.':`El piso seguro más alto era ${r.actualSafeFloor}; el piso ${r.actualSafeFloor+1} es el primero que rompe el huevo.`;$('result-copy').textContent=`${r.reason} ${reveal} Lo resolviste en ${game.throws} lanzamiento${game.throws===1?'':'s'}.`;$('result-continue').textContent='Nueva partida';$('result-overlay').hidden=false;$('result-continue').onclick=()=>{ $('result-continue').onclick=null;finishResult();startGame(true);};$('result-close').hidden=true;draw();}catch(e){setMessage(e.message,'notice');}});
function renderStrategyChart(){const chart=$('strategy-chart');chart.innerHTML=STRATEGIES.map(s=>`<div class="strategy-bar-row"><span>${s.name}</span><div class="strategy-bar-track"><i style="width:${s.worstCase}%"></i></div><strong>${s.worstCase}</strong></div>`).join('');}
$('strategy-next').addEventListener('click',()=>{if(!strategyActive||strategyIndex>=strategyPlan.length)return;launchAtFloor(strategyPlan[strategyIndex].floor);});
function syncStrategyFloorMode(){const mode=$('strategy-floor-mode').value,manual=mode==='manual';$('strategy-floor-field').hidden=!manual;$('strategy-critical').disabled=!manual;$('strategy-floor-help').textContent=manual?'Indica el piso desde el que se romperá el huevo.':mode==='random'?'El simulador elegirá el piso automáticamente; no hace falta escribirlo.':'Se probará el escenario en que ningún piso rompe el huevo.';}
$('strategy-floor-mode').addEventListener('change',syncStrategyFloorMode);
$('strategy-start').addEventListener('click',()=>{if(game&&!game.finished&&(game.throws>0||strategyActive)&&!window.confirm('¿Iniciar esta simulación? Se reemplazará la partida actual.'))return;const mode=$('strategy-floor-mode').value;const raw=Number($('strategy-critical').value);if(mode==='manual'&&(!Number.isInteger(raw)||raw<1||raw>100)){$('strategy-critical').focus();$('strategy-status').textContent='Escribe un piso entre 1 y 100.';return;}const criticalFloor=mode==='random'?randomCriticalFloor():mode==='none'?null:raw;const id=$('strategy-choice').value;strategyPlan=strategySteps(id,criticalFloor);strategyIndex=0;strategyActive=true;game=createGame(criticalFloor);game.history=[];game.throws=0;game.eggs=2;game.lowestUnsafe=null;game.highestSafe=0;game.finished=false;selectedFloor=strategyPlan[0]?.floor??50;$('guess-box').hidden=true;$('result-overlay').hidden=true;$('result-close').hidden=false;$('result-continue').onclick=null;$('strategy-status').textContent=`Simulación lista: ${$('strategy-choice').selectedOptions[0].text}, piso crítico ${criticalFloor===null?'ninguno':mode==='random'?`${criticalFloor} (elegido al azar)`:criticalFloor}. Pulsa «Siguiente paso».`;setMessage('Modo simulación: avanza lanzamiento por lanzamiento.');draw();});
makeBuilding();renderStrategyChart();startGame(true);syncStrategyFloorMode();
