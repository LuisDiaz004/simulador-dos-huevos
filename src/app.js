import { createGame, declareCriticalFloor, throwEgg } from './engine.js';
const $=id=>document.getElementById(id);
let game=null, selectedFloor=50, round=0, toastTimer, animating=false, dragActive=false, dragPointer=null;
function makeBuilding(){
  const tower=$('tower');tower.innerHTML='';
  for(let f=100;f>=1;f--){
    const cell=document.createElement('button');cell.type='button';cell.className='floor';cell.dataset.floor=f;
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
  $('launch').disabled=!game||game.finished||game.eggs===0||animating;
  const safeCount=game?.history.filter(x=>!x.broke).length??0;
  $('progress-label').textContent=`${safeCount} / 100`;$('progress-bar').style.width=`${safeCount}%`;
  $('progress-copy').textContent=game?.eggs===0?'Sin huevos: haz tu apuesta final.':safeCount?`Ya confirmaste ${safeCount} piso${safeCount===1?'':'s'} seguro${safeCount===1?'':'s'}.`:'Cada lanzamiento te acerca a la respuesta.';
  document.querySelectorAll('.floor').forEach(cell=>{
    const f=Number(cell.dataset.floor),result=game?.history.find(x=>x.floor===f);
    cell.classList.toggle('selected',f===selectedFloor);cell.classList.toggle('safe',Boolean(result&&!result.broke));cell.classList.toggle('broken',Boolean(result?.broke));cell.classList.toggle('egg-used',Boolean(result));
    cell.classList.toggle('drop-target',dragActive);cell.disabled=!game||game.finished||animating;
  });
}
function showToast(text){const toast=$('toast');toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2000);}
function startGame(){round++;game=createGame();selectedFloor=50;animating=false;$('round-label').textContent=`#${String(round).padStart(2,'0')}`;$('guess-box').hidden=true;$('result-overlay').hidden=true;setMessage('Arrastra un huevo hasta una ventana para probar ese piso.');draw();}
function showResult(broke,floor,repeated){
  const overlay=$('result-overlay'),card=$('result-card');
  card.className=`result-card ${broke?'result-broken':'result-survived'}`;
  $('result-icon').textContent=repeated?'⚠️':broke?'🥚💥':'🥚✨';
  $('result-kicker').textContent=repeated?'PISO YA PROBADO':broke?'IMPACTO':'CAÍDA COMPLETADA';
  $('result-title').textContent=repeated?'¡YA CONOCÍAMOS EL RESULTADO!':broke?'¡SE ROMPIÓ!':'¡SOBREVIVIÓ!';
  $('result-copy').textContent=repeated?`El piso ${floor} ya había sido probado. La repetición cuenta como lanzamiento, pero no consume otro huevo.`:broke?`El huevo cayó desde el piso ${floor} y se hizo añicos al llegar al suelo.`:`El huevo cayó desde el piso ${floor} y llegó entero al suelo.`;
  $('result-continue').textContent=game.eggs===0?'Ver mi partida':'Continuar';overlay.hidden=false;$('result-continue').focus();
}
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
  selectedFloor=floor;animating=true;draw();
  let result;
  try{result=throwEgg(game,floor);}catch(e){animating=false;setMessage(e.message,'notice');draw();return;}
  await animateFall(floor,result.broke);
  animating=false;draw();
  if(result.repeated){setMessage(`El piso ${floor} ya fue probado. La repetición cuenta como lanzamiento.`,'notice');showToast('Piso ya comprobado.');}
  else if(result.broke){setMessage(`¡CRASH! El huevo se rompió en el piso ${floor}.`,'broken');}
  else{setMessage(`¡A salvo! El huevo sobrevivió al piso ${floor}.`,'safe');}
  showResult(result.broke,floor,result.repeated);
}
function finishResult(){
  $('result-overlay').hidden=true;
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
$('launch').addEventListener('click',()=>launchAtFloor(selectedFloor));$('reset').addEventListener('click',startGame);
$('result-close').addEventListener('click',finishResult);$('result-continue').addEventListener('click',finishResult);
$('result-overlay').addEventListener('click',e=>{if(e.target===$('result-overlay'))finishResult();});
$('guess-toggle').addEventListener('click',()=>{$('guess-box').hidden=!$('guess-box').hidden;});
$('declare').addEventListener('click',()=>{if(!game)return;const value=Number($('answer').value);const r=declareCriticalFloor(game,value);if(r.correct){setMessage(`¡Lo encontraste! El piso ${value+1} es el primero que rompe el huevo.`,'safe');game.finished=true;showToast('¡Respuesta correcta! 🎉');}else{setMessage(r.reason,'notice');showToast('Todavía no. ¡Sigue pensando!');}draw();});
makeBuilding();startGame();
