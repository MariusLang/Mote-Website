// @ts-nocheck
// Scene kit: cel materials, rounded primitives and toy-like prefabs for the dioramas.
// Ported from the Chronicler shorts kit and extended with Mote's own props (devices, note cards,
// the speech-bubble glyph). Every solid sits with its base on y = 0 of its own origin, so `at` places its foot.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { E, seg, rnd } from './ease.js';

// Injected into three's Lambert shader: turns the light term into three flat cel tones.
// Shade is not darker but tinted towards the palette's shade colour, and the deepest tone is striped.
const CEL = `
  float celLight = dot(reflectedLight.directDiffuse, vec3(0.3333)) / max(dot(diffuseColor.rgb, vec3(0.3333)), 0.001);
  float celMid = 1.0 - smoothstep(0.56, 0.6, celLight);
  float celDark = 1.0 - smoothstep(0.3, 0.34, celLight);
  vec3 celTone = mix(diffuseColor.rgb, mix(diffuseColor.rgb, uShade, 0.16), celMid);
  celTone = mix(celTone, mix(diffuseColor.rgb, uShade, 0.36), celDark);
  vec3 outgoingLight = mix(celTone, diffuseColor.rgb, uFlat);
`;
const LIGHT_SUM = 'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;';

// The Mote glyph: a speech bubble with a punched-out dot (Design/MoteGlyph.svg).
const GLYPH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#fff" fill-rule="evenodd" d="
  M 372 232 H 652 A 172 172 0 0 1 824 404 V 556 A 172 172 0 0 1 652 728 H 452
  C 404 776 336 812 256 828 C 290 790 312 752 318 712 A 172 172 0 0 1 200 556 V 404 A 172 172 0 0 1 372 232 Z
  M 512 400 A 80 80 0 1 0 512 560 A 80 80 0 1 0 512 400 Z"/></svg>`;

let glyphShapes;
function moteShapes() {
  if (!glyphShapes) {
    const data = new SVGLoader().parse(GLYPH);
    glyphShapes = data.paths.flatMap((path) => path.toShapes(true));
  }
  return glyphShapes;
}

/** Rounded rectangle shape centred on the origin. */
function roundRect(w, h, r) {
  const s = new THREE.Shape();
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

/** ShapeGeometry with UVs mapped to 0..1 over its bounding box, so a texture fills it once. */
function shapePlane(shape, segments = 8) {
  const g = new THREE.ShapeGeometry(shape, segments);
  g.computeBoundingBox();
  const { min, max } = g.boundingBox;
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - min.x) / (max.x - min.x), (pos.getY(i) - min.y) / (max.y - min.y));
  return g;
}

export function makeKit(pal, root, { stripe = 13, textures } = {}) {
  const materials = new Map();
  let parent = root;

  const hex = (c) => pal[c] ?? c;

  /** Cel material. `flat` ignores light: screens, sky, the sun. */
  function mat(color, { flat = false, opacity = 1 } = {}) {
    const key = `${color}|${flat}|${opacity}`;
    if (materials.has(key)) return materials.get(key);
    const material = new THREE.MeshLambertMaterial({ color: hex(color), transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uShade = { value: new THREE.Color(hex('shade')) };
      shader.uniforms.uStripe = { value: stripe };
      shader.uniforms.uFlat = { value: flat ? 1 : 0 };
      shader.fragmentShader = 'uniform vec3 uShade;\nuniform float uStripe;\nuniform float uFlat;\n' + shader.fragmentShader.replace(LIGHT_SUM, CEL);
    };
    material.customProgramCacheKey = () => `cel${flat ? 1 : 0}`;
    materials.set(key, material);
    return material;
  }

  function place(object, o = {}) {
    if (o.at) object.position.set(...o.at);
    if (o.rx) object.rotation.x = o.rx;
    if (o.ry) object.rotation.y = o.ry;
    if (o.rz) object.rotation.z = o.rz;
    if (o.s) object.scale.setScalar(o.s);
    if (o.sc) object.scale.set(...o.sc);
    if (o.name) object.name = o.name;
    parent.add(object);
    return object;
  }

  function mesh(geometry, color, o = {}) {
    const m = new THREE.Mesh(geometry, o.map ?? mat(color, o));
    m.castShadow = !o.map && o.shadow !== false;
    m.receiveShadow = !o.map && o.receive !== false;
    return place(m, o);
  }

  /** Runs `fn` with a fresh group as the parent and returns the group. */
  function group(fn, o = {}) {
    const g = new THREE.Group();
    place(g, o);
    const before = parent;
    parent = g;
    const extra = fn?.(g);
    parent = before;
    if (extra) Object.assign(g.userData, extra);
    return g;
  }

  // Everything is a little rounded, like moulded toys.
  const box = (w, h, d, color, o = {}) => {
    const radius = Math.min(o.round ?? 0.07, Math.min(w, h, d) * 0.45);
    return mesh(new RoundedBoxGeometry(w, h, d, 3, radius).translate(0, h / 2, 0), color, o);
  };
  const cyl = (r, h, color, o = {}) => mesh(new THREE.CylinderGeometry(o.top ?? r, r, h, Math.max(o.seg ?? 28, 6)).translate(0, h / 2, 0), color, o);
  const cone = (r, h, color, o = {}) => mesh(new THREE.ConeGeometry(r, h, Math.max(o.seg ?? 24, 4)).translate(0, h / 2, 0), color, o);
  const orb = (r, color, o = {}) => mesh(new THREE.SphereGeometry(r, 32, 20).translate(0, r, 0), color, o);
  const torus = (r, tube, color, o = {}) => mesh(new THREE.TorusGeometry(r, tube, 14, 40, o.arc ?? Math.PI * 2), color, o);

  /** Slab with rounded corners, top at y = 0: floors, islands, rugs. */
  function slab(w, d, h, color, o = {}) {
    const geometry = new THREE.ExtrudeGeometry(roundRect(w, d, o.corner ?? 1.2), { depth: h, bevelEnabled: false, curveSegments: 10 });
    geometry.rotateX(Math.PI / 2);
    return mesh(geometry, color, o);
  }

  /** Upright rounded panel facing +z, centred on x, foot at y = 0. */
  function panel(w, h, d, color, o = {}) {
    const bevel = o.bevel ?? Math.min(0.04, d / 3);
    const geometry = new THREE.ExtrudeGeometry(roundRect(w - bevel * 2, h - bevel * 2, (o.r ?? 0.1) - bevel), {
      depth: d - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10,
    });
    geometry.translate(0, h / 2, -d / 2 + bevel);
    return mesh(geometry, color, o);
  }

  /**
   * Unlit material for screens. Sampling a finer mip level than three would pick keeps the UI text crisp
   * when a screen is seen small or at an angle.
   */
  function screenMaterial(map, extra = {}) {
    const material = new THREE.MeshBasicMaterial({ map, ...extra });
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv, -0.9 );
          diffuseColor *= sampledDiffuseColor;
        #endif`);
    };
    material.customProgramCacheKey = () => 'crisp-screen';
    return material;
  }

  /** Flat face with a texture (screenshots) or a canvas drawing, rounded corners optional. */
  function face(w, h, map, o = {}) {
    const material = screenMaterial(map, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const geometry = o.r ? shapePlane(roundRect(w, h, o.r)) : new THREE.PlaneGeometry(w, h);
    return mesh(geometry, null, { ...o, map: material });
  }

  /** Canvas-painted face: `draw(ctx, w, h)` paints it; `userData.redraw` repaints. */
  function sign(w, h, draw, o = {}) {
    const px = o.px ?? 256;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * px);
    canvas.height = Math.round(h * px);
    const ctx = canvas.getContext('2d');
    draw(ctx, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    const m = face(w, h, texture, o);
    m.userData.redraw = (again) => {
      again(ctx, canvas.width, canvas.height);
      texture.needsUpdate = true;
    };
    return m;
  }

  /** Lines of display type on a coloured card. */
  function label(w, h, lines, o = {}) {
    return sign(w, h, (ctx, cw, ch) => {
      ctx.fillStyle = hex(o.bg ?? 'paper');
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = hex(o.fg ?? 'ink');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const list = [].concat(lines);
      const size = (o.size ?? 0.62) * (ch / list.length);
      ctx.font = o.body ? `800 ${size * 0.8}px -apple-system, BlinkMacSystemFont, 'Bricolage Grotesque', sans-serif` : `800 ${size * 0.82}px -apple-system, BlinkMacSystemFont, 'Bricolage Grotesque', sans-serif`;
      list.forEach((line, i) => ctx.fillText(line, cw / 2, ((i + 0.54) * ch) / list.length, cw * 0.88));
    }, o);
  }

  const screen = (name) => textures?.(name);

  // --- Mote props ----------------------------------------------------------------------------

  /** The Mote speech bubble, extruded. Width about 1 at s = 1, centred on its own origin. */
  const glyph = (color = 'paper', o = {}) => {
    const geometry = new THREE.ExtrudeGeometry(moteShapes(), {
      depth: o.depth ?? 70, bevelEnabled: true, bevelThickness: 26, bevelSize: 22, bevelSegments: 5, curveSegments: 24,
    });
    geometry.center();
    // SVG y points down: turn it over instead of mirroring, so the faces keep their winding
    geometry.rotateX(Math.PI);
    geometry.scale(1 / 640, 1 / 640, 1 / 640);
    geometry.computeVertexNormals();
    return mesh(geometry, color, o);
  };

  /**
   * Device built around Apple's product bezel: the bezel with the screenshot composited in is the front face
   * (`front:<name>` texture), a rounded body of the same silhouette gives it depth, side buttons sit on the rim.
   */
  function device(w, h, radius, depth, metal, o, buttons) {
    return group(() => {
      panel(w, h, depth, metal, { r: radius, bevel: depth * 0.32 });
      const tex = screen(`front:${o.screen}`);
      const display = tex
        ? mesh(shapePlane(roundRect(w, h, radius), 12).translate(0, h / 2, depth / 2 + 0.003), null, {
            map: screenMaterial(tex, { transparent: true, alphaTest: 0.02 }),
          })
        : panel(w - 0.04, h - 0.04, 0.01, 'ink', { r: radius, at: [0, 0.02, depth / 2] });
      for (const [side, y, len] of buttons) box(0.03, len, depth * 0.45, metal, { at: [side * (w / 2 + 0.008), y, 0], round: 0.012 });
      return { display };
    }, o);
  }

  /** iPhone standing on its foot, screen facing +z. 1 wide, 2.1 tall at s = 1. */
  const phone = (o = {}) =>
    device(1.0, 2.096, 0.167, 0.11, o.color ?? 'silver', o, [[-1, 1.62, 0.2], [-1, 1.32, 0.26], [-1, 1.02, 0.26], [1, 1.36, 0.42]]);

  /** iPad standing up, screen facing +z (portrait). */
  const tablet = (o = {}) => device(2.3, 3.005, 0.135, 0.07, o.color ?? 'graphite', o, [[1, 2.6, 0.32]]);

  /** Laptop facing +z. `userData.lid` hinges around x. */
  const laptop = (o = {}) =>
    group(() => {
      const w = o.w ?? 3.1;
      const sh = (w - 0.16) / 1.553;
      box(w, 0.08, w * 0.68, o.color ?? 'alu', { round: 0.035 });
      slab(w * 0.86, w * 0.3, 0.005, 'black', { at: [0, 0.085, -w * 0.14], corner: 0.05, shadow: false });
      slab(w * 0.3, w * 0.16, 0.005, o.trim ?? 'alu2', { at: [0, 0.085, w * 0.18], corner: 0.05, shadow: false });
      const lid = group(() => {
        panel(w, sh + 0.16, 0.05, o.color ?? 'alu', { r: 0.1 });
        panel(w - 0.03, sh + 0.13, 0.012, 'black', { r: 0.09, at: [0, 0.015, 0.026], shadow: false });
        const tex = screen(o.screen);
        if (tex) face(w - 0.12, sh, tex, { at: [0, sh / 2 + 0.06, 0.034] });
        panel(0.32, 0.07, 0.006, 'black', { r: 0.03, at: [0, sh + 0.035, 0.035], shadow: false });
      }, { at: [0, 0.08, -w * 0.33], rx: -0.12 });
      return { lid };
    }, o);

  /** Note card: a paper slab with a coloured theme dot and a line of text. */
  const note = (text, color, o = {}) =>
    group(() => {
      const w = o.w ?? 1.9, h = o.h ?? 0.62;
      panel(w, h, 0.08, 'paper', { r: 0.14 });
      sign(w - 0.08, h - 0.08, (ctx, cw, ch) => {
        ctx.fillStyle = hex('paper');
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = hex(color);
        ctx.beginPath();
        ctx.arc(ch * 0.42, ch * 0.5, ch * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hex('ink');
        ctx.textBaseline = 'middle';
        ctx.font = `800 ${ch * 0.36}px -apple-system, BlinkMacSystemFont, 'Bricolage Grotesque', sans-serif`;
        ctx.fillText(text, ch * 0.75, ch * 0.53, cw - ch * 0.95);
      }, { at: [0, h / 2, 0.045], r: 0.1 });
    }, o);

  /** Message bubble: a rounded slab in a colour, as in Mote's capture screen. */
  const bubble = (text, o = {}) =>
    group(() => {
      const w = o.w ?? 1.8, h = 0.5;
      panel(w, h, 0.08, o.color ?? 'wall2', { r: 0.2 });
      label(w - 0.18, h - 0.14, text, { at: [0, h / 2, 0.045], bg: o.color ?? 'wall2', fg: 'ink', body: true, size: 0.86, px: 220 });
    }, o);

  /** Four-pointed sparkle, Apple Intelligence's mark in spirit. Faces +z. */
  const sparkle = (o = {}) => {
    const s = new THREE.Shape();
    const n = 4, outer = 0.5, inner = 0.13;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 ? inner : outer;
      i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const geometry = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2 });
    geometry.center();
    return mesh(geometry, o.color ?? 'hi', o);
  };

  // --- rooms and furniture --------------------------------------------------------------------

  /** Open diorama room: floor plus the two far walls, corner at -x / -z. */
  const room = (w, d, h, o = {}) =>
    group((g) => {
      g.userData.ground = true;
      slab(w + 2.2, d + 2.2, 0.5, o.base ?? 'base', { at: [-0.15, -0.3, -0.15], corner: 2.4 });
      box(w, 0.3, d, o.floor ?? 'floor', { at: [0, -0.3, 0], round: 0.02 });
      box(0.3, h + 0.3, d + 0.3, o.wallL ?? 'wall', { at: [-w / 2 - 0.15, -0.3, -0.15], round: 0.12 });
      box(w, h + 0.3, 0.3, o.wallB ?? 'wall2', { at: [0, -0.3, -d / 2 - 0.15], round: 0.12 });
    }, o);

  const windowPane = (w, h, o = {}) =>
    group(() => {
      box(w + 0.24, h + 0.24, 0.1, 'paper', { at: [0, -0.12, 0] });
      box(w, h, 0.06, o.sky ?? 'sky', { at: [0, 0, 0.05], flat: true });
      box(0.07, h, 0.05, 'paper', { at: [0, 0, 0.09] });
      box(w, 0.07, 0.05, 'paper', { at: [0, h / 2, 0.09] });
      box(w + 0.4, 0.08, 0.22, 'paper', { at: [0, -0.2, 0.1] });
    }, { ...o, ry: o.left ? Math.PI / 2 : 0 });

  const rug = (w, d, color, o) =>
    group((g) => {
      g.userData.ground = true;
      slab(w, d, 0.05, color, { at: [0, 0.05, 0], corner: 0.5, shadow: false });
      slab(w * 0.74, d * 0.68, 0.02, 'paper', { at: [0, 0.07, 0], corner: 0.35, shadow: false });
    }, o);

  const desk = (w = 2.6, d = 1.3, h = 1.05, o = {}) =>
    group(() => {
      box(w, 0.12, d, o.color ?? 'paper', { at: [0, h - 0.12, 0] });
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
        box(0.12, h - 0.12, 0.12, o.legs ?? 'ink2', { at: [sx * (w / 2 - 0.12), 0, sz * (d / 2 - 0.12)] });
    }, o);

  const chair = (o = {}) =>
    group(() => {
      box(0.7, 0.1, 0.7, o.color ?? 'a', { at: [0, 0.55, 0] });
      box(0.7, 0.8, 0.1, o.color ?? 'a', { at: [0, 0.65, 0.3] });
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) box(0.08, 0.55, 0.08, 'ink2', { at: [sx * 0.28, 0, sz * 0.28] });
    }, o);

  const lamp = (o = {}) =>
    group(() => {
      cyl(0.2, 0.05, 'ink2');
      cyl(0.035, 0.62, 'ink2');
      cone(0.3, 0.34, o.color ?? 'a', { at: [0, 0.56, 0], seg: 8 });
    }, o);

  const mug = (o = {}) =>
    group(() => {
      cyl(0.11, 0.2, o.color ?? 'a', { seg: 16 });
      cyl(0.085, 0.01, 'ink', { at: [0, 0.2, 0], seg: 16, flat: true });
    }, o);

  const plant = (o = {}) =>
    group(() => {
      cyl(0.2, 0.34, o.pot ?? 'paper', { top: 0.27, seg: 10 });
      for (let i = 0; i < 5; i++)
        cone(0.14, 0.75 + 0.2 * rnd(i), o.color ?? 'leaf', { at: [0, 0.3, 0], ry: i * 1.26, rz: 0.2 + 0.32 * rnd(i + 9), rx: 0.25, seg: 4 });
    }, o);

  const shelf = (o = {}) =>
    group(() => {
      const w = o.w ?? 1.6;
      box(w, 2.4, 0.5, 'ink2');
      const tints = ['a', 'hi', 'b', 'c', 'paper', 'leaf'];
      for (let row = 0; row < 3; row++) {
        box(w - 0.16, 0.66, 0.06, 'paper', { at: [0, 0.14 + row * 0.76, 0.24] });
        let x = -w / 2 + 0.16;
        for (let i = 0; x < w / 2 - 0.26; i++) {
          const bw = 0.09 + 0.07 * rnd(row * 31 + i);
          box(bw, 0.4 + 0.18 * rnd(row * 17 + i + 3), 0.3, tints[(row * 2 + i) % tints.length], { at: [x + bw / 2, 0.14 + row * 0.76, 0.3] });
          x += bw + 0.012;
        }
      }
    }, o);

  /** Wall clock facing +z. `userData.minute` and `userData.hour` rotate around z. */
  const clock = (o = {}) =>
    group(() => {
      cyl(0.52, 0.1, 'ink', { rx: Math.PI / 2, seg: 32 });
      cyl(0.44, 0.02, 'paper', { rx: Math.PI / 2, at: [0, 0, 0.1], seg: 32, flat: true });
      const hand = (len, wide, color) => group(() => box(wide, len, 0.03, color), { at: [0, 0, 0.14] });
      return { hour: hand(0.24, 0.07, 'ink'), minute: hand(0.36, 0.05, o.color ?? 'a') };
    }, o);

  const frame = (w, h, color, o) =>
    group(() => {
      box(w, h, 0.06, 'paper');
      box(w - 0.14, h - 0.14, 0.03, color, { at: [0, 0.07, 0.04] });
    }, o);

  /** Box with a hinged lid and a label on the front. `userData.lid` rotates around x. */
  const chest = (o = {}) =>
    group(() => {
      const w = o.w ?? 1.6;
      box(w, 0.8, 1, o.color ?? 'c');
      const lid = group(() => box(w + 0.08, 0.18, 1.08, o.lid ?? 'paper', { at: [0, 0, 0.5] }), { at: [0, 0.8, -0.5] });
      if (o.text) label(w - 0.2, 0.38, o.text, { at: [0, 0.4, 0.51], bg: 'paper', fg: 'ink', body: true, size: 0.8, r: 0.06 });
      return { lid };
    }, o);

  const house = (o = {}) =>
    group(() => {
      box(2.4, 1.8, 2.2, o.color ?? 'paper');
      const gable = new THREE.Shape();
      gable.moveTo(-1.5, 0);
      gable.lineTo(1.5, 0);
      gable.lineTo(0, 1.2);
      gable.closePath();
      const roof = new THREE.ExtrudeGeometry(gable, { depth: 2.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
      mesh(roof.translate(0, 1.8, -1.25), o.roof ?? 'a');
      box(0.7, 1.15, 0.08, o.door ?? 'b', { at: [0, 0, 1.1] });
      box(0.6, 0.55, 0.06, 'sky', { at: [-0.8, 0.85, 1.1], flat: true });
      box(0.6, 0.55, 0.06, 'sky', { at: [0.8, 0.85, 1.1], flat: true });
    }, o);

  /** Padlock facing +z. `userData.shackle` lifts to open. */
  const padlock = (o = {}) =>
    group(() => {
      panel(1.1, 0.95, 0.42, o.color ?? 'hi', { r: 0.18 });
      cyl(0.11, 0.06, 'ink', { at: [0, 0.48, 0.21], rx: Math.PI / 2, seg: 16 });
      box(0.07, 0.24, 0.06, 'ink', { at: [0, 0.22, 0.2] });
      const shackle = group(() => {
        torus(0.34, 0.08, 'ink2', { arc: Math.PI, at: [0, 0.3, 0] });
        cyl(0.08, 0.3, 'ink2', { at: [-0.34, 0, 0] });
        cyl(0.08, 0.3, 'ink2', { at: [0.34, 0, 0] });
      }, { at: [0, 0.85, 0] });
      return { shackle };
    }, o);

  const magnifier = (o = {}) =>
    group(() => {
      torus(0.7, 0.12, o.color ?? 'a', { at: [0, 0, 0] });
      cyl(0.66, 0.04, 'sky', { rx: Math.PI / 2, at: [0, 0, -0.02], opacity: 0.55, shadow: false, flat: true });
      box(0.22, 1.1, 0.22, 'ink2', { at: [0.62, -1.55, 0], rz: 0.75, round: 0.1 });
    }, o);

  // --- nature ---------------------------------------------------------------------------------

  /** Floating slab of land, top surface at y = 0. */
  const island = (w, d, o = {}) =>
    group((g) => {
      g.userData.ground = true;
      slab(w, d, 0.45, o.color ?? 'grass', { corner: o.corner ?? 2.2 });
      slab(w - 0.5, d - 0.5, 0.7, o.soil ?? 'base', { at: [0, -0.45, 0], corner: (o.corner ?? 2.2) - 0.2 });
    }, o);

  const tree = (o = {}) =>
    group(() => {
      const h = o.h ?? 1;
      cyl(0.13, 0.9 * h, 'ink2', { top: 0.09, seg: 6 });
      orb(0.62 * h, o.color ?? 'leaf', { at: [0, 0.6 * h, 0] });
      orb(0.42 * h, o.color ?? 'leaf', { at: [0.1, 1.35 * h, 0.05], ry: 1 });
    }, o);

  const pine = (o = {}) =>
    group(() => {
      const h = o.h ?? 1;
      cyl(0.1, 0.5 * h, 'ink2', { seg: 6 });
      cone(0.62 * h, 0.9 * h, o.color ?? 'leaf', { at: [0, 0.4 * h, 0], seg: 7 });
      cone(0.48 * h, 0.8 * h, o.color ?? 'leaf', { at: [0, 0.95 * h, 0], seg: 7, ry: 0.4 });
      cone(0.32 * h, 0.7 * h, o.color ?? 'leaf', { at: [0, 1.5 * h, 0], seg: 7, ry: 0.8 });
    }, o);

  const bush = (o = {}) => orb(o.r ?? 0.4, o.color ?? 'leaf', { ...o, sc: [1.3, 0.8, 1.1] });
  const rock = (o = {}) => orb(o.r ?? 0.3, o.color ?? 'paper', { ...o, sc: [1.3, 0.7, 1] });
  const flower = (o = {}) =>
    group(() => {
      cyl(0.02, 0.36, 'leaf', { seg: 6 });
      orb(0.1, o.color ?? 'a', { at: [0, 0.3, 0] });
    }, o);
  const sun = (o = {}) =>
    group(() => {
      orb(0.8, o.color ?? 'hi', { flat: true, shadow: false });
      const rays = group(() => {
        for (let i = 0; i < 10; i++)
          group(() => box(0.12, 0.42, 0.12, o.color ?? 'hi', { at: [0, 1.05, 0], flat: true, shadow: false }), { rz: (i * Math.PI) / 5 });
      }, { at: [0, 0.8, 0] });
      return { rays };
    }, o);
  const cloud = (o = {}) =>
    group(() => {
      for (const [x, y, r] of [[0, 0, 0.5], [0.6, 0.05, 0.38], [-0.55, 0, 0.34], [0.2, 0.3, 0.36]])
        orb(r, o.color ?? 'paper', { at: [x, y, 0], sc: [1, 0.8, 0.8], shadow: false });
    }, o);
  const bench = (o = {}) =>
    group(() => {
      box(1.8, 0.1, 0.55, o.color ?? 'a', { at: [0, 0.5, 0] });
      box(1.8, 0.5, 0.08, o.color ?? 'a', { at: [0, 0.7, -0.26] });
      box(0.1, 0.5, 0.5, 'ink2', { at: [-0.75, 0, 0] });
      box(0.1, 0.5, 0.5, 'ink2', { at: [0.75, 0, 0] });
    }, o);

  /** Peg figure. `sit` shortens it to chair height. */
  const person = (o = {}) =>
    group(() => {
      const h = o.sit ? 0.75 : 1.15;
      cyl(0.3, h, o.color ?? 'a', { top: 0.2, seg: 14 });
      orb(0.24, o.skin ?? 'paper', { at: [0, h + 0.02, 0] });
    }, o);

  /** Small flat scraps that float around a point: leaves, petals, paper confetti. */
  const flecks = (count, colors, spread, o = {}) =>
    group((g) => {
      g.userData.ground = true; // drifts through everything on purpose
      for (let i = 0; i < count; i++) {
        const fleck = box(0.16, 0.025, 0.11, colors[i % colors.length], { flat: true, shadow: false });
        fleck.userData.seed = [rnd(i * 3 + 1), rnd(i * 3 + 2), rnd(i * 3 + 3)];
      }
      g.userData.spread = spread;
    }, o);

  // --- animation helpers (all relative to the pose the object was built in) -----------------

  const base = (object) => object.userData.base;

  /** Captures the built pose of everything below `object`, so helpers can animate relative to it. */
  function freeze(object) {
    object.traverse((o) => {
      o.userData.base = { position: o.position.clone(), scale: o.scale.clone(), rotation: o.rotation.clone() };
    });
  }

  /** Grows the object in with a small overshoot for progress `u` (0..1). */
  function pop(object, u) {
    object.visible = u > 0.001;
    object.scale.copy(base(object).scale).multiplyScalar(Math.max(0.001, E.back(u)));
  }

  /** Falls from `height` above its pose and lands with a bounce for progress `u`. */
  function drop(object, u, height = 4) {
    object.visible = u > 0;
    object.position.y = base(object).position.y + height * (1 - E.bounce(u));
  }

  const bob = (object, t, amount = 0.08, speed = 1, phase = 0) => {
    object.position.y = base(object).position.y + amount * Math.sin(t * speed + phase);
  };

  /** Lets flecks drift in slow loops inside their spread box. */
  function drift(g, t, speed = 0.25) {
    const [sx, sy, sz] = g.userData.spread;
    for (const fleck of g.children) {
      const [a, b, c] = fleck.userData.seed;
      const fall = (b + t * speed * (0.5 + a * 0.6)) % 1;
      fleck.position.set((a - 0.5) * sx + Math.sin(t * 0.9 + c * 6.28) * 0.5, (1 - fall) * sy, (c - 0.5) * sz + Math.cos(t * 0.7 + a * 6.28) * 0.4);
      fleck.rotation.set(t * (0.6 + a), c * 6.28 + t * 0.5, t * (0.4 + b));
      fleck.scale.setScalar(Math.min(1, fall * 8, (1 - fall) * 8));
    }
  }

  return {
    THREE, E, seg, rnd, hex,
    mat, mesh, group, box, cyl, cone, orb, torus, slab, panel, face, sign, label,
    glyph, phone, tablet, laptop, note, bubble, sparkle,
    room, windowPane, rug, desk, chair, lamp, mug, plant, shelf, clock, frame, chest, house, padlock, magnifier,
    island, tree, pine, bush, rock, flower, sun, cloud, bench, person, flecks,
    freeze, pop, drop, bob, drift,
  };
}
