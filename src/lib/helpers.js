export const fmtKWD = (n) => `KWD ${Number(n).toFixed(3)}`;
export const computeDiscounted = (price, pct) => (pct > 0 ? price * (1 - pct/100) : price);


