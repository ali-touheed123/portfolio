# 3D Skill Breaker & Catcher

A playable 3D-style Brick Breaker & Catcher arcade game built to match the reference screenshot's neon dark-grid layout, featuring a unified WebGL Three.js arena with all 24 supplied 3D technology capsule models ported faithfully, real-time physics, falling 3D collectibles, and synthesized Web Audio feedback.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and gameplay decisions were confirmed during clarification and establish the blueprint for implementation.

- **Confirmed Decision 1 — Wave Progression & Missing Assets**: Wave 1 reproduces the exact 14-capsule composition from the reference screenshot (`React`, `Next.js`, `Node.js`, `TypeScript`, `Tailwind CSS`, `Supabase`, `Python`, `PostgreSQL`, `AWS`, `Express`, `Python`, `Next.js`, `Node.js`, `Docker` — with `Docker` dropping as a collectible power-up capsule or triggered in play). Because no 3D asset files were supplied for `AWS` and `Express`, those two capsules retain the exact pill styling and display neutral, clearly labeled temporary 3D placeholder geometry rather than substituting unrelated models. Clearing Wave 1 advances into Wave 2+ to unlock and showcase all 24 supplied 3D skill models.
- **Confirmed Decision 2 — Unified WebGL 3D Integration**: All 24 supplied `.html` 3D assets are standalone Three.js scenes constructing double-sided physical 3D pill badges with extruded logos, neon rim tubes, studio lighting, and supersampled procedural canvas textures. Rather than embedding 24 separate WebGL iframes (which would hit browser context limits and isolate physics), all 24 Three.js model builders are ported faithfully into a unified WebGL scene with shared geometry/material/texture caching and true 360-degree rotation.
- **Confirmed Decision 3 — Boot State & Synthesized Audio**: The game boots into a `READY` state mirroring the reference layout so players can immediately click `[ LAUNCH ORB ]` (or press `Space`) to launch, with toggleable Web Audio API synthesized arcade sound effects for bounces, shatters, catches, multipliers, and Docker power-up activation.

---

## 1. Overview & Core Concept

- **What It Does**: Combines classic Brick Breaker arcade physics with an interactive 3D technology showcase. Players slide a glowing dual-tone 3D capsule paddle horizontally to deflect a neon cyan energy orb into floating 3D skill capsules. Hitting a capsule triggers 3D spin/shatter particle bursts, floating `+500` score popups, and drops a rotating 3D collectible skill capsule that can be caught on the paddle to register in the Captured Skills deck and build score multipliers.
- **Target Audience & Context**: Interactive portfolio centerpiece and retro-futuristic web arcade experience designed primarily for widescreen desktop play with responsive stacked fallback and touch/mouse/keyboard controls.
- **Key Value**: Transforms static skill badges into tactile, physically simulated 3D objects while preserving exact visual fidelity to the reference composition.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Ready State (Initial Load)**:
   - Displays the full-screen `#080812` dark grid interface with the signature glowing cyan-to-green curved corner conduit in the upper-left, soft radial blue/purple ambient glow, and drifting micro-particles.
   - Left column (`~34%` width) presents the `03. SKILLS` header stack and the dark glassmorphism Game Statistics Card showing active status, score, multiplier, captured skill badges, `[ LAUNCH ORB ]`, `[ RESET ARCADE ]`, and the `PADDLE POWER` status bar.
   - Right column (`~66%` width) renders the translucent framed 3D Game Arena with the Wave 1 skill capsules gently floating and rotating in 3D, the glowing orb resting ready above the cyan/purple 3D paddle, and subtle `"← MOUSE / TOUCH TO SLIDE →"` guidance.
2. **Active Gameplay (`PLAYING` / `PAUSED`)**:
   - Launching fires the cyan energy orb upward with a luminous light trail. Moving the pointer, dragging touch, or pressing `ArrowLeft`/`ArrowRight` or `A`/`D` glides the paddle smoothly.
   - Orb impacts bounce with angle control based on paddle hit offset, spark cyan/purple particle bursts, spin or shatter targeted skill capsules, float `+500` score popups, and release falling 3D skill capsules with circular rotation arrows.
   - Catching a falling **Docker** 3D capsule triggers **Docker Paddle Power**: the 3D paddle widens smoothly, gains heightened bounce restitution and an electric cyan/blue aura, displays the `PADDLE_01 • DOCKER PADDLE` callout, and updates the Left Panel `PADDLE POWER:` footer.
   - Players can pause (`P` or `Esc`) or restart cleanly at any moment via `[ RESET ARCADE ]`.
3. **Wave Clear, Victory & Game Over**:
   - Missing the orb below the paddle drains a life/orb or transitions to `GAME OVER` when orbs are depleted, offering one-click restart without page reload.
   - Clearing Wave 1's 14 capsules launches Wave 2 featuring the remaining supplied 3D models (`MySQL`, `GSAP & Lenis`, `Motion`, `WebGL`, `Matter.js`, `Vercel`, `React Query`, `n8n`, `Zustand`, `Playwright`, `R3F`, `Shader`, `Vite`, `GitHub`, `Three.js`) until full `VICTORY` is achieved.

### Visual Identity & Theme

- **Aesthetic Direction**: High-craft cyber-arcade glassmorphism matching the reference screenshot verbatim—crisp deep-space obsidian surfaces pierced by calibrated cyan, electric blue, emerald, and violet neon rim lighting.
- **Color Palette & Mood**:
  - Background (`#080812`) with subtle violet radial bloom (`#1A0F2E` / `#2E1065` at low opacity) and 1px coordinate grid lines (`rgba(139, 92, 246, 0.08)`).
  - Structural Panels: Translucent dark slate (`rgba(13, 16, 33, 0.72)`) with subtle blue-gray hairlines (`rgba(148, 163, 184, 0.22)`), backdrop blur, and inner highlights.
  - Focal Accents: Electric cyan (`#22D3EE`) for primary CTA (`[ LAUNCH ORB ]`), orb core, and paddle left rim; neon violet (`#C026D3` / `#A855F7`) for handwritten display accent and paddle right rim; emerald (`#22C55E`) for active arcade telemetry; per-skill capsule rim colors (cyan, blue, green, purple, teal).
- **Typography & Hierarchy**:
  - Clean geometric sans (`Plus Jakarta Sans` / `Space Grotesk`) for `"Skills I Developed"`, capsule labels, and arcade headers.
  - Expressive purple brush script (`Pacifico` / `Caveat` brush weight) with soft violet text-glow for `"The Previous Years"`.
  - Monospace / tabular numerals (`JetBrains Mono` / `Space Mono` with `tabular-nums`) for `34,100` score readout, `5x` multiplier, `CAPTURED: X / 14`, and `PADDLE_01` callouts so digits never jitter during rapid score updates.
- **Component Styling & Spatial Composition**:
  - Asymmetric 34% / 66% desktop split inside a single full-viewport frame (`100dvh`, zero unintended scrollbars), collapsing cleanly into a compact top HUD + playable canvas on narrower screens.
  - Consistent 3D capsule silhouette: rounded pill body with dark brushed/specular front/back faces, glowing colored `TubeGeometry` rim, and the technology's authentic extruded 3D emblem centered/left-aligned inside the WebGL scene alongside crisp floating capsule labels.

### Interactive Feedback & Motion

- Continuous idle 3D oscillation and 360-degree inspection rotation on skill models; intense celebratory 360-degree spin bursts on orb impact and during descent as falling collectibles.
- Additive-blended spark particles, shatter fragments, orb motion trail, and rising `+500` popups synchronized with synthesized Web Audio chimes (with mute toggle in the arena header).
- Smooth paddle width interpolation and electric cyan-purple aura pulses when Docker Paddle Power activates.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Porting 24 HTML Three.js Assets into Unified Native TypeScript Model Factories**
  - *Chosen Approach*: Extract the exact procedural geometry (`ExtrudeGeometry`, `TubeGeometry`, `SVGLoader` paths, custom GLSL shaders for `Shader`, canvas bump/color maps, and `MeshPhysicalMaterial` definitions) from all 24 HTML files into a modular cached registry and loader pipeline.
  - *Why*: Avoids browser WebGL context exhaustion (typically capped at 8–16 simultaneous contexts), enables true shared studio environment lighting (`PMREMGenerator`), allows falling 3D collectibles and the energy orb to interact in the same 3D coordinate space at 60 FPS, and honors the strict requirement to use the exact supplied 3D models rather than 2D icons.
  - *Alternatives Considered*: Embedding 24 `<iframe>` elements or offscreen canvases. Rejected due to severe GPU memory overhead, context loss crashes, and inability to seamlessly drop rotating 3D capsules across the arena.

- **Decision 2 — Physics Loop Decoupled from React State**
  - *Chosen Approach*: Run deterministic 60Hz-stepped arcade physics (orb velocity, swept circle-vs-rounded-capsule collisions, paddle spin English, falling collectible gravity, particle pools) inside mutable refs driven by `requestAnimationFrame`, syncing HUD snapshots (`score`, `multiplier`, `capturedSkills`, `gameState`, `paddlePower`) to React only when discrete gameplay events occur.
  - *Why*: Zero garbage-collection spikes or React re-render stutters during rapid multi-hit combos, maintaining buttery WebGL frame pacing and responsive paddle tracking.
  - *Alternatives Considered*: Storing orb coordinates and particles in React state each frame. Rejected due to severe frame-rate degradation.

- **Decision 3 — Software-WebGL & Context-Loss Resilience**
  - *Chosen Approach*: Configure `EffectComposer` bloom gracefully with automatic fallback detection for software WebGL renderers, attach `webglcontextlost` / `webglcontextrestored` listeners, cap device pixel ratio (`<= 2`), and pre-cache shared geometries and textures across waves.
  - *Why*: Ensures smooth playback on both hardware GPUs and headless/virtualized preview environments without black screens or memory leaks across resets.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION SHELL & BACKGROUND                    │
│  Dark #080812 Grid · Upper-Left Cyan/Green Conduit · Ambient Glows        │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────────┐
│   LEFT PANEL (~34% Desktop)   │       │   RIGHT PANEL (~66% Desktop)      │
│   Skills Info & Arcade HUD    │       │   3D Arcade Arena Viewport        │
│                               │       │                                   │
│ • "03. SKILLS" Header Stack   │       │ • Arena Header + Sound/Pause Bar  │
│ • Glassmorphism Stats Card    │       │ • Unified WebGL Three.js Scene:   │
│   - ARCADE MODE Status Dot    │       │   ├─ Studio IBL + Neon Lighting   │
│   - SCORE & MULTIPLIER Arc    │       │   ├─ 3D Capsule Bricks (360° Spin)│
│   - CAPTURED Counter & Badges │       │   ├─ Neutral 3D Placeholders      │
│   - [ LAUNCH ORB ] Button     │◄─────►│   │  (AWS & Express missing flags)│
│   - [ RESET ARCADE ] Button   │State  │   ├─ Neon Energy Orb + Trail      │
│   - PADDLE POWER Footer       │Sync   │   ├─ Shatter & Spark Particle Pool│
│                               │       │   ├─ Falling 3D Skill Drops       │
│                               │       │   └─ Dual-Tone 3D Capsule Paddle  │
└───────────────┬───────────────┘       └───────────────┬───────────────────┘
                │                                       │
                └───────────────┬───────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    GAME ENGINE, AUDIO & 3D ASSET PIPELINE                 │
│                                                                           │
│  ┌──────────────────────┐   ┌───────────────────────┐   ┌──────────────┐  │
│  │ Physics & State Loop │   │ Asset Registry &      │   │ Web Audio    │  │
│  │ (RAF Mutable Engine) │──►│ 3D Model Factory      │──►│ Synth Engine │  │
│  │ • READY / PLAYING /  │   │ • 24 Ported Three.js  │   │ • Bounce     │  │
│  │   PAUSED / WAVE_CLEAR│   │   Badge Builders      │   │ • Shatter    │  │
│  │   GAME_OVER / VICTORY│   │ • Geometry/Texture    │   │ • Catch      │  │
│  │ • Combo Multiplier   │   │   LRU/Map Caching     │   │ • Docker Pwr │  │
│  │ • Docker Power Timer │   │ • Missing Asset Guard │   │ • Wave Clear │  │
│  └──────────────────────┘   └───────────────────────┘   └──────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Skill Asset Descriptor (`SkillAssetDefinition`)**: Maps each technology ID to its display name, neon capsule accent color, wave assignment (`Wave 1` vs `Wave 2`), asset availability status (`available` vs `missing_placeholder`), and procedural Three.js model builder key. Explicit registry entries identify `AWS` and `Express` as missing external 3D model files so they render neutral placeholder geometry with clear attribution.
- **Brick Capsule Entity (`BrickEntity`)**: Tracks grid slot, world coordinates, bounding capsule dimensions, hit points / shatter animation progress, current 3D spin velocity impulse, and attached skill descriptor.
- **Falling Collectible Entity (`FallingDropEntity`)**: Spawned when a capsule breaks or is hit; stores world position, downward velocity, continuous 360-degree spin angles, power-up tag (`docker_expand` for Docker), and attached 3D model instance.
- **Orb & Paddle Entities (`OrbEntity`, `PaddleEntity`)**: Continuous 2D-plane coordinates mapped directly into 3D arena space (`Z = 0`), velocity vector, trail ring buffer, paddle target X, current smoothed X, base vs Docker-expanded width, bounce multiplier, and active power-up remaining duration.
- **HUD Snapshot State (`GameHudState`)**: Discrete React state updated on score/combo/capture/state transitions (`status`, `wave`, `score`, `multiplier`, `comboStreak`, `capturedCount`, `totalTargetCount`, `capturedSkillIds`, `lives`, `dockerPowerActive`, `dockerPowerRemaining`, `soundEnabled`).

### Interactive Component & State Mapping

- **Primary Controls (`[ LAUNCH ORB ]`, `[ RESET ARCADE ]`, Sound Toggle, Pause/Resume)**:
  - Clicking `[ LAUNCH ORB ]` (or pressing `Space`) transitions `READY -> PLAYING` and imparts initial launch velocity to the orb, or advances `WAVE_CLEAR -> PLAYING` for Wave 2. During active play, it acts as a pause/resume toggle or wave-launch control without ambiguity.
  - Clicking `[ RESET ARCADE ]` disposes transient drops/particles, restores Wave 1's 14 capsules, resets score/multiplier/captured badges, clears Docker power-up state, and returns cleanly to `READY`.
- **Paddle Input Surface (Pointer, Touch, Keyboard)**:
  - Pointer move and touch drag convert normalized arena X coordinates into clamped paddle target bounds; `ArrowLeft`/`ArrowRight` and `A`/`D` drive smooth frame-rate-independent velocity so keyboard and mouse/touch seamlessly coexist.
- **Collision & Collection Handlers**:
  - *Orb ↔ Brick*: Reflects orb normal, spawns neon sparks + floating `+500` popup, increments multiplier streak, triggers 3D capsule shatter fragments & spin impulse, and spawns a falling 3D rotating skill capsule.
  - *Paddle ↔ Falling Drop*: Captures the skill into the Left Panel badge grid, awards bonus points scaled by multiplier, triggers capture chime/burst, and if the drop is `Docker`, activates Docker Paddle Power (`+45%` width, `+20%` bounce speed boost, glowing cyan/blue rim, `PADDLE_01 • DOCKER PADDLE` callout).
  - *Missed Orb*: Decrements remaining orb count; if `0`, transitions to `GAME_OVER` overlay with final score breakdown and single-click retry.
