import { Position } from '../types/type';

export function deepClone<T>(obj: T): T {
  // return obj.map((row) => row.slice());
  return JSON.parse(JSON.stringify(obj));
}

export function isOutrange(position: Position, map: any[][]): boolean {
  const rowMax = map.length - 1;
  if (position.row < 0 || position.row > rowMax) {
    return true;
  }
  const columnMax = map[position.row].length - 1;
  if (position.col < 0 || position.col > columnMax) {
    return true;
  }
  return false;
}
