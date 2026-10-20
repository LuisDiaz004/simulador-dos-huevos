import { createGame, throwEgg, FLOOR_COUNT } from '../motor/engine.js';

export const STRATEGIES = Object.freeze([
  { id: 'linear', name: 'Lineal', worstCase: 100 },
  { id: 'midpoint', name: 'Mitad', worstCase: 50 },
  { id: 'ten-jumps', name: 'Saltos de 10', worstCase: 19 },
  { id: 'optimal', name: 'Óptima', worstCase: 14 },
]);

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

