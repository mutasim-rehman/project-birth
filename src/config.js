/**
 * Journey configuration — Universe from Big Bang to Planets
 * + Black Hole as optional deep-dive
 */

// Main Universe Journey (11 stages)
export const UNIVERSE_JOURNEY = [
  { id: 'bigbang', name: 'Big Bang', era: 'Cosmic Dawn', desc: 'The singularity explodes. Space, time, and matter burst into existence from an infinitely dense point.', creator: 'bigbang' },
  { id: 'plasma', name: 'Plasma Era', era: 'Cosmic Dawn', desc: 'The universe is a blinding hot soup. Electrons and nuclei roam free. Light cannot travel far—scattered by charged particles.', creator: 'plasma' },
  { id: 'recombination', name: 'Recombination', era: 'Cosmic Dawn', desc: 'The universe cools enough for atoms to form. For the first time, light travels freely. The cosmic microwave background is born.', creator: 'recombination' },
  { id: 'darkages', name: 'Dark Ages', era: 'Cosmic Dawn', desc: 'Cooling and expansion. The cosmic web takes shape—filaments of dark matter where galaxies will one day form.', creator: 'darkages' },
  { id: 'firststars', name: 'First Stars', era: 'First Light', desc: 'Population III stars ignite. Massive, short-lived giants that seed the universe with heavier elements.', creator: 'firststars' },
  { id: 'galaxy', name: 'Galaxy Formation', era: 'First Light', desc: 'Gas collapses into spiral arms. Mergers shape structure. Our Milky Way begins to take form.', creator: 'galaxy' },
  { id: 'nebula', name: 'Solar Nebula', era: 'Solar System', desc: 'A cloud of gas and dust collapses. A spinning disk forms around a protostar. The stage is set.', creator: 'nebula' },
  { id: 'sun', name: 'Sun Ignition', era: 'Solar System', desc: 'Fusion begins. Hydrogen fuses into helium. Our star is born—the Sun.', creator: 'sun' },
  { id: 'planetesimals', name: 'Planetesimals', era: 'Solar System', desc: 'Dust clumps into rocks. Rocks collide and stick. Building blocks of planets emerge.', creator: 'planetesimals' },
  { id: 'planets', name: 'Planet Formation', era: 'Solar System', desc: 'Eight worlds take shape. Rocky inner planets. Gas and ice giants beyond. The solar system is complete.', creator: 'planets' },
];

// Black Hole Journey (5 stages) — optional deep-dive
export const BLACKHOLE_JOURNEY = [
  { id: 'nursery', name: 'Cosmic Nursery', desc: 'Primordial gas clouds collapse under gravity in the early universe.', creator: 'bh-nursery' },
  { id: 'seed', name: 'Seed Formation', desc: 'Matter concentrates at the center. The seed for something far greater.', creator: 'bh-seed' },
  { id: 'awakening', name: 'Awakening', desc: 'The first light escapes. An accretion disk forms. The event horizon takes shape.', creator: 'bh-awakening' },
  { id: 'active', name: 'Active Phase', desc: 'Full feeding mode. Relativistic jets. Gravitational lensing bends light.', creator: 'bh-active' },
  { id: 'quiescent', name: 'Quiescent', desc: 'Fuel depleted. The black hole rests—invisible but ruling through gravity alone.', creator: 'bh-quiescent' },
];
