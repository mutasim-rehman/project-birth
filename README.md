# Cosmic Journey

A 3D web simulation tracing the birth of the universe—from the Big Bang to the formation of our solar system—with an optional deep-dive into supermassive black hole formation.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Main Journey: Universe (11 stages)

1. **Big Bang** — The singularity explodes
2. **Plasma Era** — Hot opaque soup, light cannot escape
3. **Recombination** — First light, atoms form, CMB
4. **Dark Ages** — Cosmic web, first structures
5. **First Stars** — Population III, reionization
6. **Galaxy Formation** — Spiral arms, mergers
7. **Solar Nebula** — Protostellar disk
8. **Sun Ignition** — Fusion begins
9. **Planetesimals** — Rocks clumping
10. **Planet Formation** — All eight planets

## Black Hole Deep-Dive (optional)

Click the **Black Hole** button (top-right) to enter a 5-stage simulation of supermassive black hole formation:

1. Cosmic Nursery → 2. Seed Formation → 3. Awakening → 4. Active Phase → 5. Quiescent

Click again to return to the main universe journey.

## Controls

- **Prev / Next** — Step through stages
- **Play** — Auto-advance
- **Timeline dots** — Jump to any stage
- **Cinematic / Free Look** — Lock camera or orbit with mouse
- **Black Hole** — Toggle black hole experience

## Tech

- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)
