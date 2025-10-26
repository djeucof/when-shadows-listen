// When Shadows Listen - script.js
// Final version with Cross-Balance Progressive Hint, Shield/Counter, and Lore.
// LICENSED under Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
// Non-commercial use only. See the LICENSE file for full details.

const WIN_SECONDS = 60;
const START_ENERGY = 15;
const ENERGY_DECAY_PER_SEC = 1.0;
const ORB_RESPAWN_MS = 1000;
const IMMUNITY_COST_PER_SEC = 30;
const SHADOW_DAMAGE = 28;
const COUNTER_REWARD = 40;
const ENERGY_FOLLOW_MULTIPLIER = 0.01;
const COUNTER_REPEL_DISTANCE = 150;
const CROSS_BALANCE_BONUS = 5;
const MAX_HINT_ORBS = 4;
const POETIC_HINT =
  "The memory seeks its counterpoint. Find balance: gather from side to side.";

// ORB TYPES
const ORB_BLUE = "blue",
  ORB_GREEN = "green",
  ORB_RED = "red",
  ORB_WHITE = "white";
const ORB_ENERGY_BLUE = 3;
const ORB_ENERGY_RED = 4;
const ORB_ENERGY_WHITE = 15;

// ELEMENTS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: true });
const energyEl = document.getElementById("energy");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("message");
const balanceHintEl = document.getElementById("balance-hint");
const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const mouseToggle = document.getElementById("mouseToggle");
const restartBtn = document.getElementById("restart");
const introLegend = document.getElementById("intro-legend");
const introControls = document.getElementById("intro-controls");
document.getElementById("winSecondsText").textContent = WIN_SECONDS;

// SIZE
let W = innerWidth,
  H = innerHeight;
function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

// GAME STATE
let player = { x: W / 2, y: H / 2, r: 14, speed: 6.0 };
let shadow = { x: W / 2 + 160, y: H / 2 + 80, r: 26, speed: 0.6 };
let orbs = [],
  echoes = [];
let keys = {},
  mouse = { x: null, y: null },
  useMouse = false;
let energy = START_ENERGY,
  timeAlive = 0,
  running = false;
let collectedLore = parseInt(localStorage.getItem("whenShadowsLore") || "0");
let shadowContact = false;
let whiteOrbPulseTimer = 0;
let fadeAlpha = 0,
  losing = false;
let lastOrbSide = null;
let orbsCollectedInSession = 0;

// AUDIO
let audioCtx = null;
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playPing(freq = 880, dur = 0.08, vol = 0.06) {
  try {
    initAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    setTimeout(() => o.stop(), dur * 1000 + 50);
  } catch (e) {}
}

// PUBLIC DOMAIN LINES (Expanded from Whitman, Blake, Dickinson)
const POETIC_LINES_MAP = {
  // WALT WHITMAN
  "I am large, I contain multitudes.": false,
  "I celebrate myself, and sing myself.": false,
  "I was the man, I suffer'd, I was there.": false,
  "I became a transparent eyeball.": false,
  "There is a solitude of space.": false,
  "O Captain! My Captain! our fearful trip is done.": false,
  "Do I contradict myself? Very well then I contradict myself.": false,
  "The world is a sea of vastness, unbounded.": false,
  "I exist as I am, that is enough.": false,
  "Behold, the sea itself!": false,
  "The noiseless patient spider.": false,
  "A perfect, gentle, noble walk.": false,
  "My spirit has pass'd in compassion and love.": false,
  "The play of shine and shade.": false,
  "Wounds and shelter, and the sun and rain.": false,
  "I sing the body electric.": false,
  "And the dark hush of the city.": false,
  "Unscrew the locks from the doors!": false,

  // WILLIAM BLAKE
  "To see a world in a grain of sand.": false,
  "And a heaven in a wild flower.": false,
  "Soul meets soul on lovers' lips.": false,
  "Tyger Tyger, burning bright.": false,
  "In the forests of the night.": false,
  "Love seeketh not itself to please.": false,
  "The mind is its own place.": false,
  "A cistern contain'd, a fountain overflow'd.": false,
  "The tear is an intellectual thing.": false,
  "When the stars threw down their spears.": false,
  "Infant sorrow, none could see.": false,
  "I must create a system, or be enslav'd by another's.": false,

  // EMILY DICKINSON
  "Because I could not stop for Death —": false,
  "He kindly stopped for me —": false,
  "Hope is the thing with feathers.": false,
  "That perches in the soul.": false,
  "I'm Nobody! Who are you?": false,
  "The Soul selects her own Society —": false,
  "Tell all the Truth but tell it slant —": false,
  "I measure every Grief I meet.": false,
  "A narrow Fellow in the Grass.": false,
  "The Brain is wider than the Sky.": false,
  "Forever is composed of Nows.": false,
  "I dwell in Possibility —": false,
  "Silence is all we dread.": false,

  // R.W. EMERSON
  "I am nothing; I see all.": false,
  "The eye was placed where all objects stream towards it.": false,
  "A gentle sound, a murmur.": false,
  "The path of the just is as the shining light.": false,
  "Trust thyself: every heart vibrates to that iron string.": false,
  "The great soul which animates all men.": false,
  "All nature is but art, unknown to thee.": false,

  // EDGAR ALLAN POE
  "And silence like a veil is drawn.": false,
  "An inexpressible thought.": false,
  "The heart of a mystery.": false,
  "A dream within a dream.": false,
  "All that we see or seem.": false,
  "Deep into that darkness peering.": false,

  // MORE ABSTRACT/STYLISTIC SHORTS
  "The rhythm of the turning year.": false,
  "A flicker in the memory.": false,
  "What whispers in the void?": false,
  "The core of the silent pulse.": false,
  "Where echoes fade to light.": false,
  "The weight of what is left unsaid.": false,
  "A momentary equilibrium.": false,
  "The vastness in a single drop.": false,
  "Unraveling the deep blue thread.": false,
  "Between the breath and the step.": false,
  "The current pulls you onward.": false,
  "The sound of the universe listening.": false,
  "Beyond the limits of the frame.": false,
  "A ghost of a feeling, ever present.": false,
  "The shape of a question without an answer.": false,
  "Held by the simple gravity of being.": false,
  "A quiet song in the deep places.": false,
  "When the light fails, the shadow speaks.": false,
  "The past is a foreign country.": false,
  "The wind remembers your name.": false,
  "The map is not the territory.": false,
  "The self is a labyrinth.": false,
  "One step, and the world shifts.": false,
  "The geometry of lost time.": false,

  "A whisper lost to the current.": false,
  "The dust remembers the path.": false,
  "Only the deep silence answers.": false,
  "The gravity of an unspoken truth.": false,
  "Between two breaths, the world pauses.": false,
  "Where the light bends, the shadow waits.": false,
  "The self is a vast, quiet ocean.": false,
  "A fracture in the glass of time.": false,
  "The memory is a kind of compass.": false,
  "Lost rhythm is found in movement.": false,
  "The core of the storm is stillness.": false,
  "A thought that circles forever.": false,
  "The architecture of fading light.": false,
  "A feeling without a name.": false,
  "The space between notes is the music.": false,
  "The shadow is a map of the light.": false,
  "The weight of potential energy.": false,
  "To be and not to be at once.": false,
  "An echo of a door never opened.": false,
  "The simplest thing is the hardest to hold.": false,
  "The wind writes on the empty page.": false,
  "A fragile equilibrium in the dark.": false,
  "The pulse is a measure of silence.": false,
  "Every moment is a single, perfect orbit.": false,
  "A truth held only by the spine.": false,
  "The quiet intensity of existence.": false,
  "The memory is a second skin.": false,
  "A journey to the center of the self.": false,
  "The horizon is always receding.": false,
  "The noise of the past is a constant hum.": false,
  "A pattern in the chaos of sparks.": false,
  "The self is a myth you choose to believe.": false,
  "The light is an invitation to the dark.": false,
  "A brief pause before the next turn.": false,
  "The vastness is an inner space.": false,
  "Held by the simple act of breathing.": false,
  "The ghost of a purpose, half-remembered.": false,
  "An unwritten sentence of grace.": false,
  "The cold beauty of zero.": false,
  "The current is always flowing inward.": false,
  "The quiet is a kind of knowing.": false,
  "The shape of the question changes.": false,
  "A reflection in still, dark water.": false,
  "The distance between here and now.": false,
  "A thought that outlives its thinker.": false,
  "The world is woven from attention.": false,
  "The mirror is not you, but a moment.": false,
  "An emptiness that is strangely full.": false,
  "The hidden geometry of the feeling.": false,
  "The turning point is always now.": false,
  "The cost of stillness is momentum.": false,
  "A loop of silence and sound.": false,
  "The edge of the known self.": false,
  "The answer is in the direction.": false,
  "The space between the question marks.": false,
  "A constant return to the origin.": false,
  "The secret is the visible layer.": false,
  "The uncoiling of a long thought.": false,
  "The rhythm of the heart's first beat.": false,
  "The shadow is the oldest clock.": false,
  "A thousand points of quiet light.": false,
  "The simple weight of being present.": false,
  "The sound of the universe settling.": false,
  "The memory is a gentle fiction.": false,
  "A brief flash of total clarity.": false,
  "The past is a phantom limb.": false,
  "The gravity of an empty place.": false,
  "The light of what you are not.": false,
  "A map drawn on water.": false,
  "The shape of a perfect circle.": false,
  "The slow decay of certainty.": false,
  "The language spoken by the spine.": false,
  "The pulse is a history of itself.": false,
  "A quiet rebellion against the end.": false,
  "The core of the self is untouched.": false,
  "A thought that finds its own light.": false,
  "The vast, empty room of knowing.": false,
  "The cost of the next step.": false,
  "The current seeks a perfect curve.": false,
  "The world is made of moments lost.": false,
  "A quiet song in the deep places.": false,
  "The path unwrites itself behind you.": false,
  "The moment before the echo starts.": false,
  "The silent agreement of the heart.": false,
  "A brief, perfect interruption.": false,
  "The truth is in the periphery.": false,
  "The rhythm of a turning key.": false,
  "The shadow of a future self.": false,
  "The sound of silence in a room.": false,
  "A loop of forgetting and finding.": false,
  "The gentle pressure of the outside.": false,
  "The memory of a hand on the back.": false,
  "The only thing is the flow.": false,
  "The quiet is the loudest sound.": false,
  "A fleeting thought that matters.": false,
  "The distance is a kind of promise.": false,
  "The core of the self is the void.": false,
  "A simple, heavy honesty.": false,
  "The light is the memory of fire.": false,
  "The unblinking eye of the present.": false,
};

// HELPERS
function rand(min, max) {
  return min + Math.random() * (max - min);
}
function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// SPAWN
function spawnOrb() {
  const p = Math.random();
  let color = ORB_BLUE;
  if (p < 0.8) color = ORB_BLUE;
  else if (p < 0.9) color = ORB_GREEN;
  else if (p < 0.98) color = ORB_RED;
  else color = ORB_WHITE;
  orbs.push({
    x: rand(60, W - 60),
    y: rand(60, H - 60),
    color,
    r: color === ORB_WHITE ? 12 : 8,
    glow: Math.random() * Math.PI * 2,
  });
}
function spawnEcho() {
  const availableLines = Object.keys(POETIC_LINES_MAP).filter(
    (line) => !POETIC_LINES_MAP[line]
  );
  if (availableLines.length === 0) return;
  const line =
    availableLines[Math.floor(Math.random() * availableLines.length)];
  echoes.push({
    x: rand(80, W - 80),
    y: rand(80, H - 80),
    r: 14,
    text: line,
    seen: false,
  });
}

// initial content
for (let i = 0; i < 6; i++) spawnOrb();
for (let i = 0; i < 3; i++) spawnEcho();

// INPUT
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") e.preventDefault();
});

window.addEventListener("keyup", (e) => {
  if (e.key === " ") {
    keys[" "] = false;
    if (shadowContact) {
      energy = Math.min(100, energy + COUNTER_REWARD);
      playPing(1300, 0.2, 0.12);

      // Counter Repel
      let dx = shadow.x - player.x,
        dy = shadow.y - player.y;
      let dlen = Math.hypot(dx, dy) || 1;

      shadow.x = player.x + (dx / dlen) * COUNTER_REPEL_DISTANCE;
      shadow.y = player.y + (dy / dlen) * COUNTER_REPEL_DISTANCE;
    }
  } else {
    keys[e.key] = false;
  }
});
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
canvas.addEventListener("pointerdown", () => {
  initAudio();
});

// START / RESTART
restartBtn.addEventListener("click", () => location.reload());

// FUNCTION: Resets core game elements
function resetGameElements() {
  // Reset core state
  running = true;
  timeAlive = 0;
  energy = START_ENERGY;
  losing = false;
  fadeAlpha = 0;
  whiteOrbPulseTimer = 0;
  lastOrbSide = null;
  orbsCollectedInSession = 0;
  balanceHintEl.textContent = "";
  balanceHintEl.style.opacity = "0";

  // Reset player/shadow position and speed
  player = { x: W / 2, y: H / 2, r: 14, speed: 6.0 };
  shadow = { x: W / 2 + 160, y: H / 2 + 80, r: 26, speed: 0.6 };

  // Clear and respawn elements
  orbs = [];
  echoes = [];
  for (let i = 0; i < 6; i++) spawnOrb();
  for (let i = 0; i < 3; i++) spawnEcho();
}

// Handler for the Begin button
startBtn.addEventListener("click", () => {
  const introH1 = intro.querySelector("h1");
  const storyEl = intro.querySelector(".story");

  const isRestartFromEndScreen = introControls.style.display === "none";

  if (isRestartFromEndScreen) {
    introH1.textContent = "When Shadows Listen";
    storyEl.innerHTML = `
            You are a spark of consciousness, lost in a world of shadows.<br />
            The shadows are not enemies — but they listen, they move when you do.<br />
            To survive, you must find rhythm between the memories, seeking light
            from side to side to maintain your inner balance.<br />
            Each memory strengthens your pulse, but the constant need for movement
            brings the darkness closer.
        `;
    storyEl.removeAttribute("style");

    introLegend.style.display = "block";
    introControls.style.display = "block";
  } else {
    useMouse = mouseToggle.checked;
    introLegend.style.display = "none";
    introControls.style.display = "none";
  }

  resetGameElements();
  messageEl.textContent = "";
  intro.style.display = "none";
  playPing(660, 0.08, 0.06);
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
});

// Show balance hint with fade-out effect at the bottom
function showBalanceHint(txt) {
  const DURATION_MS = 3500;

  balanceHintEl.textContent = txt;

  balanceHintEl.style.animation = "none";
  balanceHintEl.style.opacity = "1";

  setTimeout(() => {
    balanceHintEl.style.animation = `fade-out-balance ${
      DURATION_MS / 1000
    }s forwards`;
  }, 50);

  setTimeout(() => {
    if (balanceHintEl.textContent === txt) {
      balanceHintEl.textContent = "";
      balanceHintEl.style.animation = "none";
      balanceHintEl.style.opacity = "0";
    }
  }, DURATION_MS + 50);
}

// CORE GAME LOOP (dt-safe)
let lastTime = performance.now();
function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!running) return;

  // movement (mouse or keyboard)
  if (useMouse && mouse.x !== null) {
    const dx = mouse.x - player.x,
      dy = mouse.y - player.y,
      d = Math.hypot(dx, dy) || 1;
    const move = Math.min(player.speed, d);
    player.x += (dx / d) * move;
    player.y += (dy / d) * move;
  } else {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
  }
  player.x = Math.max(10, Math.min(W - 10, player.x));
  player.y = Math.max(10, Math.min(H - 10, player.y));

  // passive energy decay & White Orb Pulse Timer
  energy -= ENERGY_DECAY_PER_SEC * dt;
  energy = Math.max(0, energy);
  if (whiteOrbPulseTimer > 0) {
    whiteOrbPulseTimer -= dt;
  }

  if (keys[" "] && energy > 0) {
    energy -= IMMUNITY_COST_PER_SEC * dt;
    energy = Math.max(0, energy);
  }

  // collect orbs
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i];
    const d = dist(player.x, player.y, o.x, o.y);
    if (d < player.r + o.r + 4) {
      let energyGained = 0;
      let isWhiteOrb = false;

      if (o.color === ORB_BLUE) {
        energyGained = ORB_ENERGY_BLUE;
        playPing(900, 0.06, 0.05);
      } else if (o.color === ORB_GREEN) {
        energyGained = ORB_ENERGY_BLUE * 1.5;
        player.speed = Math.min(7.5, player.speed + 0.2);
        playPing(1060, 0.06, 0.05);
      } else if (o.color === ORB_RED) {
        energyGained = ORB_ENERGY_RED;
        shadow.speed = Math.min(shadow.speed + 0.1, 2.0);
        playPing(740, 0.06, 0.06);
      } else if (o.color === ORB_WHITE) {
        energyGained = ORB_ENERGY_WHITE;
        collectedLore++;
        localStorage.setItem("whenShadowsLore", collectedLore);
        whiteOrbPulseTimer = 0.3;
        playPing(1600, 0.3, 0.18);
        isWhiteOrb = true;
      }

      if (o.color !== ORB_WHITE) {
        orbsCollectedInSession++;
      }

      // Cross-Balance
      const currentSide = o.x < W / 2 ? "left" : "right";

      if (lastOrbSide && lastOrbSide !== currentSide) {
        energyGained += CROSS_BALANCE_BONUS;
      } else if (lastOrbSide && lastOrbSide === currentSide) {
        if (!isWhiteOrb) {
          if (orbsCollectedInSession <= MAX_HINT_ORBS) {
            showBalanceHint(POETIC_HINT);
          } else {
            showBalanceHint("Balance: <->");
          }
        }
      } else {
        if (orbsCollectedInSession <= MAX_HINT_ORBS && !isWhiteOrb) {
          showBalanceHint(POETIC_HINT);
        }
      }

      lastOrbSide = currentSide;

      energy += energyGained;
      orbs.splice(i, 1);
      setTimeout(spawnOrb, ORB_RESPAWN_MS + Math.random() * 800);

      if (Math.random() < 0.15) {
        const line =
          Object.keys(POETIC_LINES_MAP)[
            Math.floor(Math.random() * Object.keys(POETIC_LINES_MAP).length)
          ];
        showFloatingText(line, player.x, player.y);
      }
    }
  }

  // collect echoes (Lore)
  for (let i = echoes.length - 1; i >= 0; i--) {
    const e = echoes[i];
    const d = dist(player.x, player.y, e.x, e.y);
    if (d < player.r + e.r + 6 && !e.seen) {
      e.seen = true;
      collectedLore++;
      POETIC_LINES_MAP[e.text] = true;
      localStorage.setItem("whenShadowsLore", collectedLore);
      showFloatingText(e.text, e.x, e.y, 2600);
      setTimeout(() => spawnEcho(), 3500 + Math.random() * 6000);
    }
  }

  let target = player;
  let dx = target.x - shadow.x,
    dy = target.y - shadow.y;
  let dlen = Math.hypot(dx, dy) || 1;
  let s = shadow.speed;

  s = s * (1 + energy * ENERGY_FOLLOW_MULTIPLIER);

  if (keys[" "] && energy > 0) {
    s = 0;
  }

  shadow.x += (dx / dlen) * s * dt * 60;
  shadow.y += (dy / dlen) * s * dt * 60;

  const ds = dist(player.x, player.y, shadow.x, shadow.y);
  const inContactRange = ds < player.r + shadow.r * 0.45;

  if (inContactRange) {
    if (keys[" "] && energy > 0) {
      energy -= IMMUNITY_COST_PER_SEC * dt;
      energy = Math.max(0, energy);
      shadowContact = true;
    } else {
      energy -= SHADOW_DAMAGE * dt;
      energy = Math.max(0, energy);
      shadowContact = true;
    }
  } else {
    if (!keys[" "]) {
      shadowContact = false;
    }
  }

  if (shadowContact) {
    energyEl.classList.add("danger-pulse");
  } else {
    energyEl.classList.remove("danger-pulse");
  }

  // win/lose
  timeAlive += dt;
  if (timeAlive >= WIN_SECONDS) {
    winSequence();
  } else if (energy <= 0) {
    loseSequence();
  }

  // update UI
  energyEl.textContent = Math.floor(energy);
  timeEl.textContent = timeAlive.toFixed(1);

  // draw
  drawFrame();

  // continue
  requestAnimationFrame(gameLoop);
}

// DRAW FRAME
function drawFrame() {
  ctx.clearRect(0, 0, W, H);
  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#071028");
  bg.addColorStop(1, "#000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // player aura
  const isPulsingLore = whiteOrbPulseTimer > 0;

  let glowR = 90 + (energy / 100) * 120;
  if (isPulsingLore) {
    glowR = Math.min(glowR * 2.2, 350);
  }

  const grad = ctx.createRadialGradient(
    player.x,
    player.y,
    0,
    player.x,
    player.y,
    glowR
  );

  if (isPulsingLore) {
    grad.addColorStop(0, `rgba(255,255,255,${0.7 + energy / 500})`);
  } else if (keys[" "] && energy > 0) {
    grad.addColorStop(0, `rgba(255,190,255,${0.38 + energy / 500})`);
  } else {
    grad.addColorStop(0, `rgba(120,255,220,${0.28 + energy / 500})`);
  }

  grad.addColorStop(0.6, `rgba(8,10,12,${0.14 + (1 - energy / 100) * 0.35})`);
  grad.addColorStop(1, "rgba(0,0,0,0.98)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // orbs
  orbs.forEach((o) => {
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 360 + o.glow);
    const rad = o.r * (1 + 0.15 * pulse);
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rad * 3);

    if (o.color === ORB_BLUE) {
      g.addColorStop(0, `rgba(0,200,255,${0.95 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
    } else if (o.color === ORB_GREEN) {
      g.addColorStop(0, `rgba(100,255,100,${0.95 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
    } else if (o.color === ORB_RED) {
      g.addColorStop(0, `rgba(255,100,100,${0.95 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      g.addColorStop(0, `rgba(255,255,255,${0.98 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(o.x, o.y, rad * 1.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // echoes (faint)
  echoes.forEach((e) => {
    if (e.seen) return;
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,245,200,0.6)";
    ctx.arc(e.x, e.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // shadow (halo + core)
  const sg = ctx.createRadialGradient(
    shadow.x,
    shadow.y,
    0,
    shadow.x,
    shadow.y,
    shadow.r * 4
  );
  sg.addColorStop(0, "rgba(0,0,0,0)");
  sg.addColorStop(0.4, "rgba(0,0,0,0.5)");
  sg.addColorStop(1, "rgba(0,0,0,0.98)");
  ctx.beginPath();
  ctx.fillStyle = sg;
  ctx.arc(shadow.x, shadow.y, shadow.r * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.99)";
  ctx.arc(shadow.x, shadow.y, shadow.r, 0, Math.PI * 2);
  ctx.fill();

  // player core

  const isBlinkingRed =
    shadowContact && Math.floor(performance.now() / 150) % 2 === 0;

  const coreColor = isPulsingLore
    ? `rgba(255, 223, 0, 0.99)`
    : isBlinkingRed
    ? `rgba(255, 80, 80, 0.98)`
    : `rgba(200,255,240,0.98)`;

  const glowColor = isPulsingLore
    ? "#ffdf00"
    : shadowContact
    ? "#ff4d4d"
    : "#6ff0e0";

  ctx.beginPath();
  ctx.fillStyle = coreColor;
  ctx.shadowBlur = 18;
  ctx.shadowColor = glowColor;
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // fade overlay if losing
  if (losing) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// floating message (top center)
function showFloatingText(txt, x, y, ms = 1200) {
  messageEl.textContent = txt;
  setTimeout(() => {
    if (messageEl.textContent === txt) messageEl.textContent = "";
  }, ms);
}

// WIN / LOSE
function winSequence() {
  running = false;
  playPing(1200, 0.8, 0.08);
  const title = "You Win!";
  messageEl.textContent = title;
  setTimeout(() => {
    showEndOverlay(title);
  }, 900);
}

function loseSequence() {
  running = false;
  losing = true;
  // fade to black
  let t = 0;
  const fadeDur = 1.6;
  const anim = setInterval(() => {
    t += 0.04;
    fadeAlpha = Math.min(1, t / fadeDur);
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
    if (fadeAlpha >= 1) {
      clearInterval(anim);
      const title = "Game Over!";
      messageEl.textContent = title;
      setTimeout(() => {
        showEndOverlay(title);
      }, 900);
    }
  }, 40);
}

// END overlay -> show intro with message
function showEndOverlay(text) {
  const introEl = document.getElementById("intro");
  const introH1 = introEl.querySelector("h1");
  const storyEl = introEl.querySelector(".story");

  const collectedLines = Object.keys(POETIC_LINES_MAP).filter(
    (line) => POETIC_LINES_MAP[line]
  );
  let collectedText =
    collectedLines.length > 0
      ? collectedLines.map((line) => `• ${line}`).join("<br>")
      : "No new echoes found in this session.";

  introH1.textContent = text;

  introLegend.style.display = "none";
  introControls.style.display = "none";

  storyEl.innerHTML = `
    <p style="font-size: 20px;">This is what you collected:</p> 
    <div style="font-size:16px; margin-bottom: 20px; color: #aeffe0;">${collectedText}</div>
    <p style="font-size: 18px; margin-top: 10px;">press Begin to try again.</p>
  `;

  storyEl.style.border = "2px solid var(--accent)";
  storyEl.style.padding = "30px";
  storyEl.style.borderRadius = "35px";
  storyEl.style.background = "rgba(0, 50, 50, 0.2)";
  storyEl.style.maxWidth = "800px";

  introEl.style.display = "flex";
}

// audio unlock courtesy
window.addEventListener("pointerdown", () => initAudio(), { once: true });
