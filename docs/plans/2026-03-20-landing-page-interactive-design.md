# Landing Page Interactive Enhancement Design

**Date**: 2026-03-20
**Status**: Approved
**Approach**: Hybrid — Cinematic Scroll + Selective Canvas

## Goal

Enhance the existing Codetape landing page (`codetape-landing-v2.html`) with modern interactive effects while preserving the retro cassette tape identity. Zero external dependencies — all vanilla JS + CSS.

## Design Sections

### 1. Hero — Canvas Audio Waveform + Tape Reel Rotation

- Full-screen canvas background: soft audio waveform lines (amber), deform subtly following mouse position
- ASCII tape reels (`◎`) replaced with CSS rotating circles, spin based on scroll position
- Headline "Your code moves fast" uses split-letter animation (each letter fades up with 0.03s stagger)
- Subtitle and install box fade in with 0.2s sequential delay
- Install box hover: glow shadow + micro-vibration
- "Scroll to learn more" arrow: bounce animation
- Tech: Canvas with requestAnimationFrame (~60fps), mousemove throttled, CSS keyframes for letter animation

### 2. Scroll Reveal System (Page-wide)

- All section content starts at `opacity: 0` + `translateY(40px)`
- IntersectionObserver triggers stagger reveal (children 0.1s delay each)
- ASCII dividers: typewriter expand from center outward
- Section background transitions use subtle fade
- Tech: Single IntersectionObserver, `threshold: 0.15`, CSS class toggle (GPU-accelerated), `data-delay` attribute

### 3. Drift Meters — Dynamic Fill Animation

- Bars fill left-to-right when visible (0.02s per bar delay, random ±1 flicker)
- Right-side values use counter animation (e.g. `0d` → `~2mo`)
- "WITH CODETAPE" row appears last with flash/pulse highlight
- Drift-display outer frame does one amber glow pulse after fill completes
- Tech: CSS `@keyframes` + `animation-delay`, IntersectionObserver trigger (play once)

### 4. Feature Cards — 3D Tilt + Glow Border

- Hover: 3D tilt following mouse (max ±8deg, `perspective(600px)`)
- Border: amber gradient glow, light source follows mouse position via `::before` radial-gradient
- ASCII art inside cards transitions from dim to amber on hover
- Viewport entry: 6 cards stagger in (2-column alternating)
- Tech: `mousemove` relative coords → `rotateX/Y`, `mouseleave` smooth spring-back

### 5. Terminal Demo — Typewriter Effect

- Content types in line-by-line when visible
- Green `$` prompt appears first, then command types char-by-char (40ms/char)
- Output lines fade in quickly (simulating terminal speed)
- Highlight lines (`✓`) flash briefly
- Trace result box: draw-border animation (clockwise from top-left)
- Blinking cursor at end
- Tech: JS queue system `[{type, text, speed, delay}]`, only runs while in viewport

### 6. Before/After — Interactive Drag Slider

- Replace static side-by-side cards with draggable vertical divider
- Left = "WITHOUT" (red tint), Right = "WITH" (green tint)
- Drag handle: `◀ ▶` icon on divider line
- Content clipped based on divider position
- Initial position: 30% (biased to show the pain)
- Tech: CSS `clip-path` or overflow + width, touch + mouse drag, `pointer-events` management

### 7. CTA — Magnetic Button + Aurora Background

- Animated gradient mesh background (amber/purple aurora, slow drift)
- Primary CTA button: magnetic hover effect (button attracted toward mouse, ±6px)
- Button shimmer animation (light sweeps left to right)
- Grand reveal entrance animation on viewport entry
- Tech: CSS `@keyframes` moving layered `radial-gradient`, mousemove distance calc → translate, background-position animation

### 8. Easter Egg — VHS Rewind (Optional)

- Konami code (`↑↑↓↓←→←→BA`) triggers full-screen VHS rewind effect
- Screen distortion + fast rewind + static noise, 2 seconds
- Scrolls back to page top afterward
- Pure fun moment, no functional impact

## Constraints

- Zero external dependencies (no GSAP, no Lenis, no Three.js)
- Single HTML file (inline CSS + JS)
- Mobile responsive — disable canvas + tilt on touch devices, keep scroll reveals
- Performance budget: <16ms per frame on canvas, all animations GPU-accelerated
- Progressive enhancement: page is fully readable without JS

## Estimated Additions

- ~400 lines CSS (animations, new states, aurora, shimmer)
- ~300 lines JS (canvas, observers, typewriter, tilt, slider, magnetic, easter egg)
