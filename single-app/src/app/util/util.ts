export function deepClone<T>(obj: T): T {
  // return obj.map((row) => row.slice());
  return JSON.parse(JSON.stringify(obj));
}
