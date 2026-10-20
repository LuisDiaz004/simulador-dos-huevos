export const FLOOR_COUNT = 100;
export function randomCriticalFloor(random = Math.random) {
  const value = random();
  if (typeof value !== 'number' || value < 0 || value >= 1) throw new RangeError('El generador debe devolver un número entre 0 y 1.');
  return Math.floor(value * FLOOR_COUNT) + 1;
}
export const STRATEGIES = Object.freeze([
  { id: 'linear', name: 'Lineal', worstCase: 100 },
  { id: 'midpoint', name: 'Mitad', worstCase: 50 },
  { id: 'ten-jumps', name: 'Saltos de 10', worstCase: 19 },
  { id: 'optimal', name: 'Óptima', worstCase: 14 },
]);
export function createGame(criticalFloor = Math.floor(Math.random() * 100) + 1) {
  if (criticalFloor !== null && (!Number.isInteger(criticalFloor) || criticalFloor < 1 || criticalFloor > FLOOR_COUNT)) throw new RangeError('F debe estar entre 1 y 100, o ser null.');
  return { criticalFloor, eggs: 2, throws: 0, lowestUnsafe: null, highestSafe: 0, finished: false, history: [] };
}
export function throwEgg(game, floor) {
  if (game.finished) throw new Error('La partida terminó.');
  if (game.eggs <= 0) throw new Error('No quedan huevos.');
  if (!Number.isInteger(floor) || floor < 1 || floor > FLOOR_COUNT) throw new RangeError('El piso debe estar entre 1 y 100.');
  const known = game.history.find(x => x.floor === floor);
  if (known) return { ...known, repeated: true, game };
  const broke = game.criticalFloor !== null && floor >= game.criticalFloor;
  game.throws++;
  if (broke) { game.eggs--; game.lowestUnsafe = game.lowestUnsafe === null ? floor : Math.min(game.lowestUnsafe, floor); }
  else game.highestSafe = Math.max(game.highestSafe, floor);
  const result = { floor, broke, repeated: false };
  game.history.push(result);
  return { ...result, game };
}
export function declareCriticalFloor(game, safeFloor) {
  if (!Number.isInteger(safeFloor) || safeFloor < 0 || safeFloor > FLOOR_COUNT) throw new RangeError('S debe estar entre 0 y 100.');
  const proven = game.highestSafe >= safeFloor && (safeFloor === FLOOR_COUNT || game.lowestUnsafe !== null && game.lowestUnsafe <= safeFloor + 1);
  const actual = game.criticalFloor === null ? safeFloor === FLOOR_COUNT : safeFloor === game.criticalFloor - 1;
  const correct = (safeFloor === FLOOR_COUNT ? (game.criticalFloor === null || game.criticalFloor === FLOOR_COUNT + 1) : actual) && proven;
  game.finished = true;
  return { correct, proven, actualSafeFloor: game.criticalFloor === null ? FLOOR_COUNT : game.criticalFloor - 1,
    reason: correct ? '¡Correcto! Declaración demostrada.' : proven ? 'La respuesta no coincide con el piso crítico.' : 'La respuesta no estaba demostrada con los lanzamientos realizados.' };
}
export function optimalFloors(maxFloor = FLOOR_COUNT) {
  const floors = []; let floor = 0, step = 14;
  while (step > 0 && floor < maxFloor) { floor = Math.min(maxFloor, floor + step); floors.push(floor); step--; }
  return floors;
}
export function runStrategy(id, criticalFloor) {
  const game = createGame(criticalFloor); let tested = new Set();
  const test = floor => { if (tested.has(floor) || game.finished) return; const result = throwEgg(game, floor); tested.add(floor); return result; };
  if (id === 'linear') { for(let f=1;f<=100 && game.lowestUnsafe===null;f++) test(f); }
  else if (id === 'ten-jumps') { for(let f=10;f<=100 && game.lowestUnsafe===null;f+=10) test(f); if(game.lowestUnsafe!==null && game.eggs>0) for(let f=game.highestSafe+1;f<game.lowestUnsafe;f++) test(f); if(game.lowestUnsafe===null && criticalFloor===null){ test(100); } }
  else if (id === 'optimal') { for(const f of optimalFloors()) { const r=test(f); if(!r || !r.broke) continue; if(game.eggs>0) for(let x=game.highestSafe+1;x<f;x++) { const q=test(x); if(q?.broke) break; } break; } if(game.lowestUnsafe===null && criticalFloor===null && game.highestSafe<100) test(100); }
  else if (id === 'midpoint') { const first=test(50); if(first?.broke && game.eggs>0) { for(let f=1;f<50;f++){const q=test(f); if(q?.broke) break;} } else if(first && !first.broke) { for(const f of optimalFloors(100).filter(x=>x>50)){ const r=test(f); if(r?.broke){ if(game.eggs>0) for(let x=game.highestSafe+1;x<f;x++) { const q=test(x); if(q?.broke) break; } break; } } if(game.lowestUnsafe===null && criticalFloor===null && game.highestSafe<100)test(100); } }
  else throw new Error(`Estrategia desconocida: ${id}`);
  return { criticalFloor, throws: game.throws, eggs: game.eggs, highestSafe: game.highestSafe, lowestUnsafe: game.lowestUnsafe, correct: criticalFloor === null ? game.highestSafe === 100 : game.lowestUnsafe === criticalFloor && game.highestSafe === criticalFloor - 1, game };
}

// Devuelve cada lanzamiento de una estrategia en orden, para reproducirla paso a paso.
export function strategySteps(id, criticalFloor) {
  const result = runStrategy(id, criticalFloor);
  return result.game.history.map(item => ({ ...item }));
}


