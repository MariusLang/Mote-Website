// @ts-nocheck
// The archipelago: one cel-shaded diorama per chapter of the page, set on a ring of floating islands.
// The page's scroll position becomes a float `f` (chapter index plus how far towards the next one) and the
// camera flies along the poses below. Every station animates from the clock `t` and, where it tells a small
// story, from `u`, how far its section has scrolled through the viewport.
import * as THREE from 'three';
import { makeKit } from './kit.js';
import { E, seg, lerp, clamp, rnd } from './ease.js';

export const PALETTE = {
	paper: '#FFF8EC', ink: '#133524', ink2: '#4A6655', sky: '#BFE3F5',
	base: '#1B5E3B', floor: '#FFF1D6', wall: '#5FA77C', wall2: '#A6CDB2',
	a: '#E8833A', b: '#3F7FB5', c: '#9B6FB8', hi: '#F2CC4B', rose: '#E58FA3', terra: '#D8644F',
	leaf: '#2F8F5B', grass: '#7CC48A', shade: '#0E3A26',
	silver: '#D7D9DC', graphite: '#3A3B3E', alu: '#D3D6DA', alu2: '#C2C6CB', black: '#0B0C0E',
};

const FOV = 24;
const SUN = new THREE.Vector3(0.38, 1, 0.62).normalize();
const RING = 64;
const COUNT = 7;

/** World placement of station `i`: on a ring, its front (+z) facing outwards. */
const stationAngle = (i) => (i / COUNT) * Math.PI * 2;

// Camera poses, one per page chapter. `at` and `az` are relative to the station; `side` puts the subject
// right (+1) or left (-1) of the text on wide screens.
const POSES = [
	{ s: 0, at: [-0.3, 2.4, 0.3], zoom: 10.5, az: 14, el: 9, side: 1 },
	{ s: 1, at: [0.9, 2.5, 0.2], zoom: 8.6, az: -20, el: 10, side: -1 },
	{ s: 2, at: [0, 2.2, 0.2], zoom: 11, az: 8, el: 12, side: 1 },
	{ s: 3, at: [0.1, 2.5, 0], zoom: 10.5, az: 14, el: 14, side: -1 },
	{ s: 4, at: [0.7, 2.1, 0.6], zoom: 10.4, az: -14, el: 10, side: 1 },
	{ s: 5, at: [0, 2.6, 0], zoom: 10.4, az: 18, el: 10, side: -1 },
	{ s: 6, at: [-0.6, 2, 0.4], zoom: 11.5, az: -14, el: 14, side: 1 },
	{ s: -1, at: [0, 0, 0], zoom: 150, az: 330, el: 48, side: 0 },
	{ s: 0, at: [-0.3, 2.4, 0.3], zoom: 15, az: 360 - 16, el: 8, side: 0, lift: 0.24, wrap: true },
];

// Mac screens are plain captures; iPhone and iPad come composited into Apple's product bezels.
const textureNames = ['mac-02-timeline', 'mac-05-review'];
const frontNames = ['iphone-01-capture', 'iphone-02-timeline', 'iphone-04-ask', 'iphone-05-detail', 'ipad-02-timeline', 'ipad-03-calendar'];

export function createWorld(canvas, { mobile = false, reduced = false } = {}) {
	const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2);
	const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile || dpr < 2, powerPreference: 'high-performance' });
	renderer.setPixelRatio(dpr);
	renderer.setClearColor(0x000000, 0);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 900);
	const sun = new THREE.DirectionalLight(0xffffff, Math.PI);
	sun.castShadow = true;
	const shadowSize = mobile ? 1024 : 2048;
	sun.shadow.mapSize.set(shadowSize, shadowSize);
	sun.shadow.bias = -0.0005;
	sun.shadow.normalBias = 0.05;
	sun.shadow.camera.near = 1;
	sun.shadow.camera.far = 300;
	scene.add(sun, sun.target);

	const loader = new THREE.TextureLoader();
	const load = (url) => {
		const tex = loader.load(url);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
		return tex;
	};
	const textures = Object.fromEntries([
		...textureNames.map((name) => [name, load(`/shots/screen/${name}.webp`)]),
		...frontNames.map((name) => [`front:${name}`, load(`/shots/device/${name}.webp`)]),
	]);

	const k = makeKit(PALETTE, scene, { stripe: 11 * dpr, textures: (name) => textures[name] });
	const stations = [];
	const pokeables = [];

	const station = (i, build) => {
		const angle = stationAngle(i);
		const g = k.group(build, { at: [Math.sin(angle) * RING, 0, Math.cos(angle) * RING], ry: angle });
		stations[i] = g;
		return g;
	};

	// --- 0: hero, the glyph over a garden ---------------------------------------------------
	station(0, () => {
		k.island(14, 10);
		gardenEdge(k, 14, 10, 1, 9, false, [[-1.3, 4.3, -3.8, 0.8], [-4.2, -1.6, 0, 2.6]]);
		// the app itself is the hero: Mac with the timeline, iPhone with the capture screen
		const laptop = k.laptop({ at: [1.5, 0, -1.1], w: 4.8, screen: 'mac-02-timeline' });
		const phone = k.phone({ at: [-2.9, 0, 1.3], s: 2.1, ry: 0.28, screen: 'iphone-01-capture' });
		k.rug(5.6, 2.6, 'wall2', { at: [0.4, 0, 1.4] });
		const glyph = k.glyph('paper', { at: [-3.4, 5.4, -1.6], s: 1.9 });
		const sparks = [0, 1, 2].map((i) => k.sparkle({ at: [-3.4, 5.4, -1.6], s: 0.42 - i * 0.08, color: ['hi', 'a', 'paper'][i], shadow: false }));
		const dots = [0, 1, 2, 3].map((i) => k.orb(0.16, ['a', 'b', 'hi', 'rose'][i], { at: [0, 4.4, 0] }));
		return {
			glyph, sparks, dots, laptop, phone,
			sun: k.sun({ at: [-5.5, 7.5, -4.5], s: 0.9 }),
			cloud: k.cloud({ at: [4.5, 8, -4], s: 1.3 }),
			cloud2: k.cloud({ at: [-3, 9.6, -5], s: 0.9 }),
			leaves: k.flecks(mobile ? 8 : 18, ['leaf', 'hi', 'a', 'paper'], [13, 7, 8], { at: [0, 0.4, 0] }),
		};
	});

	// --- 1: capture, bubbles rising out of a phone --------------------------------------------
	station(1, () => {
		k.island(11, 8.5, { corner: 2.6 });
		gardenEdge(k, 11, 8.5, 2, 6, true, [[-0.2, 2.8, -0.8, 2.4], [-3.8, -1.4, -0.6, 1.4]]);
		k.bench({ at: [-2.6, 0, 0.4], ry: 0.35, color: 'terra' });
		const person = k.person({ at: [-2.6, 0.52, 0.45], sit: true, color: 'b', ry: 0.35 });
		const phone = k.phone({ at: [1.3, 0, 0.2], s: 2.3, ry: -0.16, screen: 'iphone-01-capture' });
		k.rug(3.4, 1.6, 'hi', { at: [1.2, 0, 1.5] });
		const texts = ['Fiber in the building?', 'Transfer the deposit', 'Must try pastéis de Belém!', 'Gestalt principles', 'Book the train to Porto'];
		const colors = ['wall2', 'paper', 'wall2', 'paper', 'wall2'];
		const bubbles = texts.map((text, i) => k.bubble(text, { at: [1.3, 5.5, 0.6], w: 2.4, color: colors[i] }));
		return { phone, bubbles, person };
	});

	// --- 2: every device, notes hopping between them ------------------------------------------
	station(2, () => {
		k.island(14, 8.5, { color: 'wall2' });
		// the Mac in the middle, iPad and iPhone in front of it
		k.rug(8, 4.4, 'b', { at: [0, 0, 0.2] });
		const laptop = k.laptop({ at: [0, 0, -1.3], w: 5.4, screen: 'mac-02-timeline' });
		k.mug({ at: [3.4, 0, -0.6], color: 'a', s: 1.6 });
		k.plant({ at: [-4.6, 0, -2.2], s: 1.2 });
		const tablet = k.tablet({ at: [-3.3, 0.25, 1.5], s: 0.92, ry: 0.3, rx: -0.08, screen: 'ipad-02-timeline' });
		k.box(2.4, 0.25, 0.85, 'ink2', { at: [-3.3, 0, 1.5], ry: 0.3 });
		const phone = k.phone({ at: [3.4, 0, 1.7], s: 1.35, ry: -0.3, screen: 'iphone-02-timeline' });
		const cloud = k.cloud({ at: [0, 8.2, -2.4], s: 1.8 });
		const hops = [0, 1, 2, 3].map((i) => k.note(['Seminar slides', 'Packing list', 'Viewing questions', 'Ideas for the talk'][i], ['b', 'a', 'leaf', 'c'][i], { w: 1.7, h: 0.5, s: 0.8 }));
		const trees = [k.pine({ at: [-6.2, 0, -3.2], h: 1.4 }), k.tree({ at: [6.2, 0, -2.8], h: 1.2, color: 'leaf' })];
		return { laptop, tablet, phone, cloud, hops, trees };
	});

	// --- 3: sorted, notes fall through the sparkle into topic chests ---------------------------
	station(3, () => {
		k.room(9.5, 7.5, 4.6, { floor: 'floor', wallL: 'hi', wallB: 'wall2' });
		k.windowPane(1.6, 1.3, { at: [3.5, 2.6, -3.75] });
		k.shelf({ at: [-3.9, 0, -3.3], w: 1.1 });
		k.desk(5.2, 3.2, 1.05, { at: [0.2, 0, -1.4], color: 'paper' });
		const review = k.laptop({ at: [0.2, 1.05, -1.4], w: 4.4, screen: 'mac-05-review' });

		const clock = k.clock({ at: [-4.73, 3.2, 0.8], ry: Math.PI / 2 });
		k.plant({ at: [3.9, 0, -2.9], s: 1.3 });
		const topics = [['HCI Seminar', 'b'], ['Lisbon Trip', 'a'], ['New Apartment', 'leaf']];
		const chests = topics.map(([text, color], i) => k.chest({ at: [(i - 1) * 2.6, 0, 2.0], w: 2.0, color, text }));
		const sparkle = k.sparkle({ at: [0.2, 5.6, -0.4], s: 0.75, shadow: false });
		const notes = [['Gestalt principles', 'b', 0], ['Must try pastéis!', 'a', 1], ['Ask about utilities', 'leaf', 2]].map(([text, color, target]) => {
			const n = k.note(text, color, { at: [0, 6, 0.6], w: 2, h: 0.56 });
			n.userData.target = target;
			return n;
		});
		chests.forEach((chest) => pokeables.push({ object: chest, poke: () => (chest.userData.pokedAt = performance.now() / 1000) }));
		return { chests, sparkle, notes, clock, review };
	});

	// --- 4: calendar, notes snap onto their events ---------------------------------------------
	station(4, () => {
		k.island(13, 8.5, { color: 'rose', soil: 'c' });
		const cal = k.group(() => {
			k.panel(5.4, 4.6, 0.32, 'paper', { r: 0.3 });
			k.panel(5.4, 0.95, 0.36, 'terra', { r: 0.3, at: [0, 3.65, 0.01] });
			k.label(3.2, 0.62, 'OCTOBER', { at: [0, 4.12, 0.2], bg: 'terra', fg: 'paper', size: 0.9, r: 0.05 });
			for (const x of [-1.6, 1.6]) k.torus(0.26, 0.07, 'ink2', { at: [x, 4.62, 0], ry: Math.PI / 2 });
			const tiles = [];
			for (let row = 0; row < 4; row++)
				for (let col = 0; col < 7; col++) {
					const hot = { '1,2': 'b', '2,4': 'a', '3,1': 'leaf', '0,5': 'c' }[`${row},${col}`];
					tiles.push(k.panel(0.6, 0.58, 0.1, hot ?? 'floor', { r: 0.1, at: [(col - 3) * 0.7, 2.75 - row * 0.72, 0.2] }));
				}
			return { tiles };
		}, { at: [-1.6, 0, -2], s: 0.85 });
		const pins = [['Seminar notes', 'b', 9], ['Train to Porto', 'a', 18], ['Viewing questions', 'leaf', 22]].map(([text, color, tile]) => {
			const n = k.note(text, color, { at: [0, 0, 0], w: 1.8, h: 0.5, s: 0.62 });
			n.userData.tile = tile;
			return n;
		});
		const tablet = k.tablet({ at: [1.4, 0.24, 0.9], s: 1.3, ry: -0.12, rx: -0.1, screen: 'ipad-03-calendar' });
		k.box(3.2, 0.24, 1.1, 'ink2', { at: [1.4, 0, 1.1], ry: -0.12 });
		const clock = k.clock({ at: [4.8, 2.3, -1], s: 1.2 });
		k.cyl(0.08, 2.3, 'ink2', { at: [4.8, 0, -1.1] });
		k.flower({ at: [3.6, 0, 2.6], color: 'hi' });
		k.flower({ at: [2.4, 0, 3], color: 'paper' });
		k.bush({ at: [-5.2, 0, -2.6] });
		return { cal, pins, clock, tablet };
	});

	// --- 5: ask, a lens sweeping over notes and an answer with sources ------------------------
	station(5, () => {
		k.island(12, 8.5, { color: 'c', soil: 'ink2' });
		k.rug(4.4, 2.6, 'hi', { at: [-1.4, 0, 1.2] });
		const phone = k.phone({ at: [2.2, 0, -0.2], s: 2.4, ry: -0.22, screen: 'iphone-04-ask' });
		const fan = ['Questions for the viewing', 'Fiber in the building?', 'Deposit due Friday'].map((text, i) =>
			k.note(text, ['leaf', 'b', 'a'][i], { at: [-2.4 + i * 0.25, 0.1 + i * 0.1, 1.6 - i * 0.8], rx: -Math.PI / 2, w: 2.6, h: 0.7, ry: 0.05 * i }),
		);
		const lens = k.magnifier({ at: [-1.8, 2.2, 1.3], s: 0.9, rx: -0.9 });
		const ask = k.bubble('What do I need for the viewing?', { at: [-1.9, 4.5, 0.4], w: 4.0, color: 'paper' });
		const spark = k.sparkle({ at: [-4.1, 5.35, 0.4], s: 0.6, color: 'hi', shadow: false });
		k.pine({ at: [-5.4, 0, -3], h: 1.3, color: 'leaf' });
		k.tree({ at: [5, 0, -2.8], h: 1.1, color: 'leaf' });
		return { phone, fan, lens, ask, spark };
	});

	// --- 6: private, everything stays home --------------------------------------------------------
	station(6, () => {
		k.island(13, 9, { color: 'grass' });
		gardenEdge(k, 13, 9, 7, 6, true, [[-3, 1.2, -2.6, 1.0], [0, 4.4, 0.4, 2.6]]);
		const house = k.house({ at: [-1, 0, -0.8], color: 'paper', roof: 'terra', door: 'b' });
		const lock = k.padlock({ at: [3.4, 0, 1.4], s: 1.3, ry: -0.3 });
		k.phone({ at: [0.9, 0, 1.6], s: 1.75, ry: -0.08, screen: 'iphone-05-detail' });
		const iCloud = k.cloud({ at: [-1, 5.6, -0.8], s: 1.9 });
		const homing = [0, 1, 2].map((i) => k.note(['Lisbon Trip', 'HCI Seminar', 'New Apartment'][i], ['a', 'b', 'leaf'][i], { w: 1.8, h: 0.5, s: 0.62 }));
		pokeables.push({ object: lock, poke: () => (lock.userData.pokedAt = performance.now() / 1000) });
		return { house, lock, iCloud, homing };
	});

	// --- sky inside the ring, out of the cameras' way ---------------------------------------------------------------
	const sky = k.group(() => {
		const clouds = [];
		for (let i = 0; i < (mobile ? 8 : 16); i++) {
			const a = (i / (mobile ? 8 : 16)) * Math.PI * 2 + 0.2;
			const r = RING * (0.45 + rnd(i * 7) * 0.35);
			clouds.push(k.cloud({ at: [Math.sin(a) * r, 7 + rnd(i * 3) * 10, Math.cos(a) * r], s: 1.4 + rnd(i) * 1.8 }));
		}
		const rocks = [];
		for (let i = 0; i < (mobile ? 6 : 14); i++) {
			const a = ((i + 0.5) / (mobile ? 6 : 14)) * Math.PI * 2;
			const r = RING * (0.3 + rnd(i * 11) * 0.42);
			rocks.push(k.group(() => {
				k.slab(1.6 + rnd(i) * 1.6, 1.4 + rnd(i + 1) * 1.4, 0.3, 'grass', { corner: 0.6 });
				k.slab(1.2 + rnd(i) * 1.2, 1 + rnd(i + 1) * 1.1, 0.5, 'base', { at: [0, -0.3, 0], corner: 0.45 });
				if (i % 2) k.tree({ h: 0.6 + rnd(i) * 0.4, color: i % 4 === 1 ? 'leaf' : 'wall' });
				else k.flower({ color: ['hi', 'a', 'rose'][i % 3], s: 1.6 });
			}, { at: [Math.sin(a) * r, -3 + rnd(i * 5) * 6, Math.cos(a) * r] }));
		}
		return { clouds, rocks };
	});

	k.freeze(scene);
	if (import.meta.env?.DEV) window.__scene = { scene, camera, THREE, overlaps };

	/** Dev check: props of a station whose boxes cut into each other (resting on something is fine). */
	function overlaps() {
		const found = [];
		stations.forEach((st, si) => {
			const props = st.children.filter((c) => !c.userData.ground && c.visible);
			// measure in the station's own frame: world boxes of a turned station would be inflated
			const { position, rotation } = st;
			const saved = [position.clone(), rotation.clone()];
			position.set(0, 0, 0);
			rotation.set(0, 0, 0);
			st.updateMatrixWorld(true);
			const boxes = props.map((c) => new THREE.Box3().setFromObject(c, true).expandByScalar(-0.04));
			position.copy(saved[0]);
			rotation.copy(saved[1]);
			st.updateMatrixWorld(true);
			for (let i = 0; i < props.length; i++)
				for (let j = i + 1; j < props.length; j++) {
					if (!boxes[i].intersectsBox(boxes[j])) continue;
					const x = boxes[i].clone().intersect(boxes[j]);
					const size = x.getSize(new THREE.Vector3());
					if (size.x * size.y * size.z < 0.002) continue;
					const name = (c) => `${c.type}@${c.position.toArray().map((n) => n.toFixed(1)).join(',')}`;
					found.push(`station ${si}: ${name(props[i])} x ${name(props[j])} vol ${(size.x * size.y * size.z).toFixed(3)}`);
				}
		});
		return found;
	}
	pokeables.push({ object: stations[0].userData.glyph, poke: () => (stations[0].userData.glyph.userData.pokedAt = performance.now() / 1000) });

	// --- camera ------------------------------------------------------------------------------------
	const stationBase = (s) => {
		if (s < 0) return { pos: new THREE.Vector3(), angle: 0 };
		return { pos: stations[s].position.clone(), angle: stationAngle(s) };
	};
	const poses = POSES.map((p) => {
		const { pos, angle } = stationBase(p.s);
		const at = new THREE.Vector3(...p.at).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).add(pos);
		const az = p.s < 0 || p.wrap ? p.az + (p.wrap ? 0 : 0) : (angle * 180) / Math.PI + p.az;
		return { ...p, at, az };
	});
	// keep the turn monotonic, so the camera circles the ring instead of spinning back
	for (let i = 1; i < poses.length; i++) while (poses[i].az < poses[i - 1].az - 10) poses[i].az += 360;

	let width = 1;
	let height = 1;
	const look = new THREE.Vector3();
	const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

	function placeCamera(f, t) {
		const i = clamp(Math.floor(f), 0, poses.length - 1);
		const j = Math.min(i + 1, poses.length - 1);
		const u = E.io(clamp(f - i));
		const p = poses[i];
		const q = poses[j];
		look.lerpVectors(p.at, q.at, u);
		const travel = p.at.distanceTo(q.at);
		const hop = Math.sin(Math.PI * u);
		const aspect = width / height;
		const portrait = aspect < 1.2 ? clamp(1 / aspect, 1, 2.4) : 1;
		let zoom = lerp(p.zoom, q.zoom, u) * portrait + hop * Math.min(travel * 0.45, 26);
		let az = lerp(p.az, q.az, u);
		let el = lerp(p.el, q.el, u) + hop * 14;
		if (!reduced) {
			az += Math.sin(t * 0.5) * 1.4 + pointer.sx * 6;
			el += pointer.sy * 4;
		}
		const azr = (az * Math.PI) / 180;
		const elr = (el * Math.PI) / 180;
		const distance = zoom / 2 / Math.tan((FOV * Math.PI) / 360);
		camera.position.set(look.x + distance * Math.cos(elr) * Math.sin(azr), look.y + distance * Math.sin(elr), look.z + distance * Math.cos(elr) * Math.cos(azr));
		camera.lookAt(look);
		// frame the subject beside the text: shift the view window instead of the camera
		const side = lerp(p.side, q.side, u);
		const wide = aspect >= 1.2;
		const ox = wide ? -side * 0.2 * width : 0;
		const lift = lerp(p.lift ?? 0, q.lift ?? 0, u);
		const oy = (wide ? lift : Math.max(lift, 0.17)) * height;
		camera.setViewOffset(width, height, ox, oy, width, height);
		camera.updateMatrixWorld();

		const reach = Math.max(10, zoom * 0.75);
		sun.target.position.copy(look);
		sun.position.copy(look).addScaledVector(SUN, 140);
		Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach });
		sun.shadow.camera.updateProjectionMatrix();
	}

	// --- per-station animation ----------------------------------------------------------------------
	const now = () => performance.now() / 1000;
	const poked = (o, d = 1.2) => (o.userData.pokedAt ? clamp((now() - o.userData.pokedAt) / d) : 1);

	function animate(t, locals, intro) {
		const L = (i) => (mobile || reduced ? (t * 0.12 + i * 0.3) % 1 : locals[i] ?? 0);

		// 0 hero
		{
			const s = stations[0].userData;
			const p = poked(s.glyph, 1.4);
			k.drop(s.glyph, seg(intro, 0.6, 1.6), 6);
			s.glyph.position.y += Math.sin(t * 1.1) * 0.18;
			k.pop(s.phone, seg(intro, 0.3, 1.0));
			s.phone.rotation.y = s.phone.userData.base.rotation.y + Math.sin(t * 0.6) * 0.05 + pointer.sx * 0.12;
			s.laptop.userData.lid.rotation.x = -0.12 - (1 - E.out(seg(intro, 0.1, 1.2))) * 1.3;
			s.glyph.rotation.y = Math.sin(t * 0.5) * 0.28 + pointer.sx * 0.45 + E.out(p) * Math.PI * 2 * (p < 1 ? 1 : 0);
			s.glyph.rotation.x = -pointer.sy * 0.18;
			s.glyph.rotation.z = Math.sin(t * 0.7) * 0.04;
			s.sparks.forEach((spark, i) => {
				const a = t * (0.7 + i * 0.25) + i * 2.1;
				spark.position.set(-3.4 + Math.cos(a) * (1.6 + i * 0.3), 5.6 + Math.sin(t * 1.3 + i) * 0.6, -1.6 + Math.sin(a) * 1);
				spark.rotation.z = t * (1 + i);
				spark.rotation.y = t * 0.8;
				k.pop(spark, seg(intro, 0.9 + i * 0.15, 1.5 + i * 0.15));
			});
			s.dots.forEach((dot, i) => {
				const a = -t * 0.45 + (i * Math.PI) / 2;
				dot.position.set(Math.cos(a) * 5.4, 4.2 + Math.sin(t * 0.9 + i * 1.7) * 1.2, Math.sin(a) * 2.6 - 1.2);
				k.pop(dot, seg(intro, 1.1 + i * 0.1, 1.6 + i * 0.1));
			});
			s.sun.userData.rays.rotation.z = t * 0.25;
			s.cloud.position.x = s.cloud.userData.base.position.x + Math.sin(t * 0.11) * 2;
			s.cloud2.position.x = s.cloud2.userData.base.position.x - Math.sin(t * 0.09 + 1) * 1.6;
			k.drift(s.leaves, t);
		}

		// 1 capture: bubbles rise from the phone, one after another
		{
			const s = stations[1].userData;
			const u = L(1);
			const n = s.bubbles.length;
			s.bubbles.forEach((b, i) => {
				const phase = (t * 0.11 + u * 0.9 + i / n) % 1;
				const base = b.userData.base.position;
				b.position.set(base.x + (i % 2 ? -1 : 1) * (0.6 + phase * 1.6) + Math.sin(phase * 5 + i) * 0.3, base.y + phase * 4.6, base.z + Math.cos(phase * 3 + i) * 0.3);
				b.rotation.z = Math.sin(phase * 6 + i) * 0.14;
				b.rotation.y = -0.4 + phase * 0.5;
				const life = Math.min(seg(phase, 0, 0.12), 1 - seg(phase, 0.8, 1));
				k.pop(b, life);
			});
			s.phone.rotation.z = Math.sin(t * 1.4) * 0.025;
			k.bob(s.person, t * 2.2, 0.03);
		}

		// 2 devices: notes hop phone -> cloud -> laptop -> tablet
		{
			const s = stations[2].userData;
			// above each device, with high arcs in between so nothing passes through a screen or the cloud
			const top = (o, y, z) => o.position.clone().add(new THREE.Vector3(0, y, z));
			const a = top(s.phone, 3.6, 0.6);
			const b = top(s.laptop, 4.4, 2.2);
			const c = top(s.tablet, 3.9, 0.7);
			const lift = (p, q) => p.clone().lerp(q, 0.5).add(new THREE.Vector3(0, 1.8, 0.4));
			const points = [a, lift(a, b), b, lift(b, c), c];
			const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);
			const u = L(2);
			s.hops.forEach((h, i) => {
				const phase = (t * 0.07 + u * 0.6 + i / s.hops.length) % 1;
				curve.getPointAt(phase, h.position);
				h.rotation.set(Math.sin(t + i) * 0.2, Math.sin(phase * 6) * 0.3, Math.sin(phase * 9 + i) * 0.15);
				k.pop(h, Math.min(seg(phase, 0, 0.06), 1 - seg(phase, 0.94, 1)));
			});
			s.cloud.position.y = s.cloud.userData.base.position.y + Math.sin(t * 0.8) * 0.25;
			s.cloud.scale.setScalar(s.cloud.userData.base.scale.x * (1 + Math.sin(t * 1.6) * 0.03));
		}

		// 3 sorted: each note falls to the sparkle, then flies into its chest
		{
			const s = stations[3].userData;
			const v = mobile || reduced ? (t * 0.3) % 3.6 : L(3) * 3.6;
			s.sparkle.rotation.z = t * 1.2;
			s.sparkle.rotation.y = Math.sin(t) * 0.5;
			let glow = 0;
			s.notes.forEach((n, i) => {
				const local = clamp(v - i * 1.1, 0, 1.2);
				const fall = seg(local, 0, 0.4);
				const fly = seg(local, 0.45, 0.95);
				const chest = s.chests[n.userData.target];
				const start = new THREE.Vector3(0.2, 8.4, -0.4);
				const mid = s.sparkle.position.clone();
				const end = chest.position.clone().add(new THREE.Vector3(0, 1.2, 0));
				if (fly <= 0) n.position.lerpVectors(start, mid, E.in(fall) * 0.98);
				else {
					n.position.lerpVectors(mid, end, E.io(fly));
					n.position.y += Math.sin(Math.PI * fly) * 1.6;
				}
				n.rotation.set(-0.2, 0, Math.sin(local * 8) * 0.12 * (1 - fly));
				const visible = local > 0 && fly < 1;
				n.visible = visible;
				n.scale.setScalar(visible ? Math.max(0.001, (1 - E.in(seg(fly, 0.75, 1))) * E.back(seg(local, 0, 0.12))) : 0.001);
				glow = Math.max(glow, Math.sin(Math.PI * seg(local, 0.3, 0.55)));
				const open = Math.sin(Math.PI * seg(fly, 0.4, 1.0)) ;
				const poke = 1 - poked(chest, 0.8);
				chest.userData.lid.rotation.x = -1.3 * Math.max(open, Math.sin(Math.PI * (1 - poke)) * (poke > 0 ? 1 : 0));
			});
			s.sparkle.scale.setScalar(s.sparkle.userData.base.scale.x * (1 + glow * 0.45 + Math.sin(t * 3) * 0.04));
			s.clock.userData.minute.rotation.z = -t * 0.6;
			s.clock.userData.hour.rotation.z = -1 - (t * 0.6) / 12;
		}

		// 4 calendar: notes fly in from the side and snap to their day
		{
			const s = stations[4].userData;
			const v = mobile || reduced ? (t * 0.25) % 3.4 : L(4) * 3.4;
			s.pins.forEach((pin, i) => {
				const tile = s.cal.userData.tiles[pin.userData.tile];
				const target = tile.getWorldPosition(new THREE.Vector3());
				stations[4].worldToLocal(target).add(new THREE.Vector3(0, 0.12, 0.3));
				const u = seg(v - i * 0.8, 0, 0.7);
				const from = new THREE.Vector3(-4 + i * 2.2, 5.5, 4.5);
				pin.position.lerpVectors(from, target, E.out(u));
				pin.position.y += Math.sin(Math.PI * u) * 1.2;
				pin.rotation.set(0, 0, (1 - u) * (i % 2 ? 0.8 : -0.8) + (u >= 1 ? Math.sin(t * 2 + i) * 0.04 : 0));
				k.pop(pin, seg(v - i * 0.8, 0, 0.2));
				const snap = seg(v - i * 0.8, 0.7, 0.95);
				tile.scale.setScalar(1 + Math.sin(Math.PI * snap) * 0.3);
			});
			s.clock.userData.minute.rotation.z = -t * 1.2;
			s.clock.userData.hour.rotation.z = -1 - t * 0.1;
		}

		// 5 ask: the lens sweeps the notes, the question floats, the phone answers
		{
			const s = stations[5].userData;
			const u = L(5);
			const sweep = Math.sin(t * 0.9 + u * 6);
			s.lens.position.set(-1.9 + sweep * 0.8, 2.5 + Math.cos(t * 1.8) * 0.15, 1.3 + Math.cos(t * 0.9 + u * 6) * 0.3);
			s.lens.rotation.z = sweep * 0.2;
			s.fan.forEach((note, i) => {
				const near = 1 - clamp(Math.abs(s.lens.position.x - note.position.x) / 1.2);
				note.position.y = note.userData.base.position.y + near * 0.35;
			});
			k.bob(s.ask, t, 0.15, 1.2);
			s.ask.rotation.z = Math.sin(t * 0.8) * 0.04;
			s.spark.rotation.z = t * 1.5;
			s.spark.scale.setScalar(s.spark.userData.base.scale.x * (1 + Math.sin(t * 4) * 0.12));
			s.phone.rotation.y = s.phone.userData.base.rotation.y + Math.sin(t * 0.6) * 0.06;
		}

		// 6 private: notes fly home, the lock snaps shut
		{
			const s = stations[6].userData;
			const u = L(6);
			const door = s.house.position.clone().add(new THREE.Vector3(0, 0.6, 1.5));
			s.homing.forEach((n, i) => {
				const phase = (t * 0.14 + i / 3) % 1;
				const a = i * 2.1 + phase * 1.5;
				const from = new THREE.Vector3(-2.6 + Math.cos(a) * 1.6, 4.2 + i * 0.5, 4 + Math.sin(a) * 0.8);
				n.position.lerpVectors(from, door, E.io(phase));
				n.position.y += Math.sin(Math.PI * phase) * 1.4;
				n.rotation.set(0, -0.3 + phase, Math.sin(phase * 8) * 0.2);
				k.pop(n, Math.min(seg(phase, 0, 0.1), 1 - seg(phase, 0.85, 1)));
			});
			const shut = mobile || reduced ? 1 - Math.max(0, Math.sin(t * 0.7)) ** 8 : E.back(seg(u, 0.25, 0.55));
			const poke = poked(s.lock, 1.2);
			const lift = poke < 1 ? Math.sin(Math.PI * poke) : 0;
			s.lock.userData.shackle.position.y = s.lock.userData.shackle.userData.base.position.y + (1 - shut) * 0.45 + lift * 0.45;
			s.lock.rotation.z = Math.sin(poke * Math.PI * 4) * 0.08 * (1 - poke);
			s.iCloud.position.x = s.iCloud.userData.base.position.x + Math.sin(t * 0.3) * 0.8;
		}

		// sky
		sky.userData.clouds.forEach((c, i) => {
			c.position.x = c.userData.base.position.x + Math.sin(t * 0.05 + i) * 3;
		});
		sky.userData.rocks.forEach((r, i) => {
			r.position.y = r.userData.base.position.y + Math.sin(t * 0.4 + i * 1.3) * 0.5;
			r.rotation.y = t * 0.05 * (i % 2 ? 1 : -1);
		});
	}

	// --- interaction ---------------------------------------------------------------------------
	const ray = new THREE.Raycaster();
	const ndc = new THREE.Vector2();
	function pick(clientX, clientY) {
		const rect = canvas.getBoundingClientRect();
		ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
		ray.setFromCamera(ndc, camera);
		for (const hit of ray.intersectObjects(pokeables.map((p) => p.object), true)) {
			const entry = pokeables.find((p) => {
				let o = hit.object;
				while (o) {
					if (o === p.object) return true;
					o = o.parent;
				}
				return false;
			});
			if (entry) return entry;
		}
		return null;
	}

	return {
		resize(w, h) {
			width = w;
			height = h;
			renderer.setSize(w, h, false);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		},
		pointer(x, y) {
			pointer.x = x;
			pointer.y = y;
		},
		/** Returns true when something was poked, so the caller can show a pointer cursor. */
		hover(clientX, clientY) {
			return !!pick(clientX, clientY);
		},
		poke(clientX, clientY) {
			const entry = pick(clientX, clientY);
			entry?.poke();
			return !!entry;
		},
		frame(t, f, locals, intro = 10) {
			pointer.sx += (pointer.x - pointer.sx) * 0.05;
			pointer.sy += (pointer.y - pointer.sy) * 0.05;
			placeCamera(f, t);
			animate(t, locals, intro);
			renderer.render(scene, camera);
		},
		dispose() {
			renderer.dispose();
			Object.values(textures).forEach((tex) => tex.dispose());
		},
	};
}

/**
 * A loose row of trees and flowers along the back and sides of an island. Trees keep their distance from
 * each other and stay out of `keepOut` rectangles ([x0, x1, z0, z1]) where the station's props stand.
 */
function gardenEdge(k, w, d, seed, count = 9, sides = true, keepOut = []) {
	const makers = [
		(at, s) => k.tree({ at, h: s }),
		(at, s) => k.pine({ at, h: s }),
		(at, s) => k.tree({ at, h: s * 0.9, color: 'wall' }),
		(at) => k.bush({ at }),
	];
	const placed = [];
	const blocked = (x, z, r) => keepOut.some(([x0, x1, z0, z1]) => x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r);
	for (let i = 0; i < count; i++) {
		const u = rnd(seed * 50 + i);
		const back = i % 3 !== 2;
		if (!back && !sides) continue;
		const x = back ? (i / count - 0.5) * (w - 1.6) + (u - 0.5) : (i % 2 ? -1 : 1) * (w / 2 - 0.9);
		const z = back ? -d / 2 + 0.9 + u * 1.0 : (u - 0.6) * (d - 3);
		const s = 0.9 + 0.5 * rnd(seed + i * 3);
		const r = 0.75 * s;
		if (blocked(x, z, r) || placed.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < pr + r)) continue;
		placed.push([x, z, r]);
		makers[Math.floor(rnd(seed * 91 + i * 7) * makers.length)]([x, 0, z], s);
	}
	for (let i = 0; i < 7; i++) {
		const x = (rnd(seed * 13 + i) - 0.5) * (w - 1.5);
		const z = d / 2 - 0.8 - rnd(seed * 29 + i) * 1.4;
		if (!blocked(x, z, 0.15)) k.flower({ at: [x, 0, z], color: ['a', 'hi', 'paper', 'rose'][i % 4] });
	}
	for (let i = 0; i < 3; i++) {
		const x = (rnd(seed * 3 + i) - 0.5) * (w - 1);
		const z = d / 2 - 0.6 - rnd(seed + i) * 0.8;
		if (!blocked(x, z, 0.4)) k.rock({ at: [x, 0, z], r: 0.2 + 0.15 * rnd(i) });
	}
}
