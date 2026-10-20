import { createGame, declareCriticalFloor, throwEgg } from './engine.js';
const $=id=>document.getElementById(id);
let game=null, selectedFloor=50, round=0, toastTimer;
function makeBuilding(){
  const tower=$('tower'); tower.innerHTML='';
  for(let f=100;f>=1;f--){
    const cell=document.createElement('button'); cell.type='button'; cell.className='floor'; cell.dataset.floor=f;
    cell.setAttribute('aria-label',`Piso ${f}`); cell.title=`Seleccionar piso ${f}`;
    cell.innerHTML=`<span class="floor-number">${f}</span><span class="windows"><i></i><i></i></span><span class="egg-marker" aria-hidden="true">🥚</span>`;
    cell.addEventListener('click',()=>{if(!game||game.finished)return;selectedFloor=f;draw();if(game.history.some(x=>x.floor===f))showToast('Ya conoces el resultado de este piso.');});
    tower.append(cell);
  }
}
function setMessage(text,kind=''){ $('message').textContent=text; $('message').className=`message ${kind}`; }
function draw(){
  $('throws').textContent=game?.throws??0; $('selected-floor').textContent=selectedFloor;
  const eggs=game?.eggs??2; $('egg-icons').innerHTML=Array.from({length:2},(_,i)=>`<span class="egg-icon ${i>=eggs?'used':''}" aria-hidden="true">🥚</span>`).join('');
  $('egg-icons').setAttribute('aria-label',`${eggs} huevos disponibles`);
  $('launch').disabled=!game||game.finished||game.eggs===0;
  const safeCount=game?.history.filter(x=>!x.broke).length??0;
  $('progress-label').textContent=`${safeCount} / 100`; $('progress-bar').style.width=`${safeCount}%`;
  $('progress-copy').textContent=game?.eggs===0?'Sin huevos: declara tu respuesta.':safeCount?`Ya confirmaste ${safeCount} piso${safeCount===1?'':'s'} seguro${safeCount===1?'':'s'}.`:'Cada lanzamiento te acerca a la respuesta.';
  document.querySelectorAll('.floor').forEach(cell=>{
    const f=Number(cell.dataset.floor), result=game?.history.find(x=>x.floor===f);
    cell.classList.toggle('selected',f===selectedFloor); cell.classList.toggle('safe',Boolean(result&&!result.broke)); cell.classList.toggle('broken',Boolean(result?.broke)); cell.classList.toggle('egg-used',Boolean(result));
    cell.classList.toggle('is-unknown',!result); cell.disabled=!game||game.finished;
    const windows=cell.querySelector('.windows'); windows.classList.toggle('falling',Boolean(result&&f===selectedFloor));
  });
}
function showToast(text){const toast=$('toast');toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2100);}
function startGame(){round++;game=createGame();selectedFloor=50;$('round-label').textContent=`#${String(round).padStart(2,'0')}`;$('guess-box').hidden=true;setMessage('Toca una ventana del edificio para colocar el huevo.');draw();}
$('launch').addEventListener('click',()=>{
  if(!game)return;
  try{
    const r=throwEgg(game,selectedFloor);draw();
    const cell=document.querySelector(`.floor[data-floor="${selectedFloor}"]`);cell?.classList.remove('drop-animation');void cell?.offsetWidth;cell?.classList.add('drop-animation');
    if(r.repeated){setMessage(`El piso ${selectedFloor} ya fue probado. ¡No gastes un huevo aquí!`,'notice');showToast('Piso ya comprobado.');}
    else if(r.broke){setMessage(`¡CRASH! El huevo se rompió en el piso ${selectedFloor}.`,'broken');showToast('¡CRASH! Huevo roto 💥');}
    else{setMessage(`¡A salvo! El huevo sobrevivió al piso ${selectedFloor}.`,'safe');showToast('¡El huevo sobrevivió! ✨');}
    if(game.eggs===0){game.finished=true;$('launch').disabled=true;setMessage('Te quedaste sin huevos. Haz tu apuesta final.','notice');$('guess-box').hidden=false;}
  }catch(e){setMessage(e.message,'notice');}
  draw();
});
$('reset').addEventListener('click',startGame);
$('guess-toggle').addEventListener('click',()=>{$('guess-box').hidden=!$('guess-box').hidden;});
$('declare').addEventListener('click',()=>{if(!game)return;const value=Number($('answer').value);const r=declareCriticalFloor(game,value);if(r.correct){setMessage(`¡Lo encontraste! El piso ${value+1} es el primero que rompe el huevo.`,'safe');game.finished=true;showToast('¡Respuesta correcta! 🎉');}else{setMessage(r.reason,'notice');showToast('Todavía no. ¡Sigue pensando!');}draw();});
makeBuilding();startGame();
