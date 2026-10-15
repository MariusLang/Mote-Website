// @ts-nocheck
// Pure timing helpers, shared by the browser engine and the Node scripts.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
/** Progress of `t` through [a, b], clamped to 0..1. */
export const seg = (t, a, b) => clamp((t - a) / (b - a));

export const E = {
  lin: (u) => u,
  io: (u) => 0.5 - 0.5 * Math.cos(Math.PI * u),
  in: (u) => u * u * u,
  out: (u) => 1 - Math.pow(1 - u, 3),
  back: (u) => {
    const c = 1.9;
    return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
  },
  bounce: (u) => {
    const n = 7.5625;
    const d = 2.75;
    if (u < 1 / d) return n * u * u;
    if (u < 2 / d) return n * (u -= 1.5 / d) * u + 0.75;
    if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + 0.9375;
    return n * (u -= 2.625 / d) * u + 0.984375;
  },
};

/** Deterministic pseudo random number in 0..1 for an integer seed. */
export const rnd = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Times of the hard cuts in a camera track, used for wipes and whooshes. */
export const cutTimes = (cam) => cam.filter((key) => key[2] === "cut").map((key) => key[0]);
