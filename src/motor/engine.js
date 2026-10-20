export const FLOOR_COUNT = 100;
export function randomCriticalFloor(random = Math.random) {
  const value = random();
  if (typeof value !== 'number' || value < 0 || value >= 1) throw new RangeError('El generador debe devolver un número entre 0 y 1.');
  return Math.floor(value * FLOOR_COUNT) + 1;
}

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
