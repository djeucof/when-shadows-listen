# 🧘‍♂️🌑✨ When Shadows Listen

> A spark moves.  
> The shadow listens.  
> Every breath, every light you collect — brings it closer.

**When Shadows Listen** is a minimalist action-arcade game built entirely in **HTML, CSS, and JavaScript**.  
You are a spark of consciousness wandering through the void, collecting echoes of lost memories —  
each one illuminating the darkness for a moment, but awakening it too.

**▶️ [PLAY DEMO HERE](https://djeucof.github.io/when-shadows-listen/)** (desktop version)
---

## 💭 Concept

A short interactive poem disguised as an arcade game.  
You are not meant to “win” — only to explore the rhythm between movement and stillness.

**Core metaphors:**
- **Light** — your consciousness, the act of awareness.  
- **Shadow** — entropy, the unconscious, the quiet listener.  
- **Energy** — focus and presence, constantly fading, yet renewable through balance.  
- **Orbs** — fragments of memory; each color affects both you and the darkness.

---

## ⚙️ Mechanics

| Action | Description |
|--------|-------------|
| **Move** | `WASD`, arrow keys, or mouse movement |
| **Shield** | Hold `Space` to become immune (drains energy) |
| **Goal** | Collect as much energy and memory as possible before the shadow reaches you |
| **Lose** | When your energy fades to zero, the void hums and the light goes out |

🌀 **Orb Types:**
- 🔵 *Blue – Memory* → +3 Energy  
- 🟢 *Green – Breath* → Temporary speed boost  
- 🔴 *Red – Passion* → +4 Energy, temporarily speeds up the shadow  
- ⚪ *White – Pure Memory* → Restores large energy, adds a poetic line to your Lore  

---

## 🎧 Audio & Atmosphere

Minimalist ambient feedback:
- Subtle synth “pings” on energy collection.  
- Soft hum when the shadow draws near.  
- Silence after loss — the void remembers your movement.  

Each line of poetry is drawn from **public domain texts** (Whitman, Dickinson, Blake, Emerson, Poe) and appears as an echo of your actions.

---

## 🧠 Technical Design

- **Pure Vanilla Stack** — no libraries, no dependencies.  
- **HTML5 Canvas Rendering** with dynamic gradients and glow.  
- **Delta-time Game Loop** using `requestAnimationFrame` ensures consistent physics on all frame rates.  
- **Persistent Lore** stored via `localStorage`.  
- **Responsive UI** with CSS transitions and soft light effects.

---

## ⚖️ Licensing

This project is licensed under the **[Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](./LICENSE)**.

You are free to view, modify, and share the code for **non-commercial** purposes only. Commercial use, reproduction, or sale is strictly prohibited.
