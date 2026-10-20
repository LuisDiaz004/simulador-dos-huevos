import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, throwEgg, declareCriticalFloor, runStrategy } from '../src/engine.js';
test('genera partidas con dos huevos y contador inicial',()=>{const g=createGame(72);assert.equal(g.eggs,2);assert.equal(g.throws,0);});
test('RN-03: se rompe en F o por encima y suma lanzamiento',()=>{const g=createGame(40);assert.equal(throwEgg(g,39).broke,false);assert.equal(throwEgg(g,40).broke,true);assert.equal(g.throws,2);assert.equal(g.eggs,1);});
test('RN-04 y RN-05: no permite lanzar sin huevos y cuenta lanzamientos',()=>{const g=createGame(1);throwEgg(g,1);throwEgg(g,2);assert.equal(g.eggs,0);assert.throws(()=>throwEgg(g,3),/No quedan/);});
test('RN-07: repetición avisa sin alterar el contador',()=>{const g=createGame(51);throwEgg(g,30);const r=throwEgg(g,30);assert.equal(r.repeated,true);assert.equal(g.throws,2);});
test('RN-08: declaración requiere demostrar S y S+1',()=>{const g=createGame(51);throwEgg(g,50);throwEgg(g,51);assert.equal(declareCriticalFloor(g,50).correct,true);});
test('estrategias siempre descubren F para todos los pisos y ninguno',()=>{for(const id of ['linear','midpoint','ten-jumps','optimal']) for(let f=1;f<=101;f++){const r=runStrategy(id,f===101?null:f);assert.equal(r.correct,true,`${id} F=${f}`);}});
test('máximos de RN-12 para Mitad, Saltos de 10 y Óptima',()=>{for(let f=1;f<=101;f++){const critical=f===101?null:f;assert.ok(runStrategy('midpoint',critical).throws<=50);assert.ok(runStrategy('ten-jumps',critical).throws<=19);assert.ok(runStrategy('optimal',critical).throws<=14);}});

