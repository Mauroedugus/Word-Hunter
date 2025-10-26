// utils.js
export const $ = id => document.getElementById(id);
export const qsa = sel => Array.from(document.querySelectorAll(sel));

export function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
