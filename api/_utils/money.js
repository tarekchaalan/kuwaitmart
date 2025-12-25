export function roundKWD(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? Number(n.toFixed(3)) : 0;
}


