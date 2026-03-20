# Landing Page Interactive Enhancement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cinematic scroll animations, canvas waveform, typewriter terminal, 3D tilt cards, interactive before/after slider, magnetic CTA, and VHS easter egg to `codetape-landing-v2.html`.

**Architecture:** Single-file enhancement — all CSS and JS added inline to the existing HTML file. No external dependencies. Progressive enhancement: page remains fully readable without JS. Touch devices get simplified animations (no canvas, no tilt).

**Tech Stack:** Vanilla JS (ES2020+), CSS animations/transforms, Canvas 2D API, IntersectionObserver, pointer events.

---

### Task 1: Scroll Reveal System — CSS Foundation

**Files:**
- Modify: `codetape-landing-v2.html:8-296` (CSS section)

**Step 1: Add reveal animation CSS**

Insert before the `</style>` closing tag (line 296):

```css
/* SCROLL REVEAL */
.reveal{opacity:0;transform:translateY(40px);transition:opacity 0.6s ease,transform 0.6s ease}
.reveal.visible{opacity:1;transform:none}
.reveal-children>*{opacity:0;transform:translateY(30px);transition:opacity 0.5s ease,transform 0.5s ease}
.reveal-children.visible>*{opacity:1;transform:none}
.reveal-children.visible>*:nth-child(1){transition-delay:0s}
.reveal-children.visible>*:nth-child(2){transition-delay:0.08s}
.reveal-children.visible>*:nth-child(3){transition-delay:0.16s}
.reveal-children.visible>*:nth-child(4){transition-delay:0.24s}
.reveal-children.visible>*:nth-child(5){transition-delay:0.32s}
.reveal-children.visible>*:nth-child(6){transition-delay:0.4s}

/* DIVIDER TYPEWRITER */
.divider pre{display:inline-block;max-width:0;overflow:hidden;white-space:nowrap;transition:max-width 1.2s ease}
.divider.visible pre{max-width:800px}
```

**Step 2: Add `.reveal` and `.reveal-children` classes to HTML elements**

Add `class="reveal"` to these elements:
- `.problem-header` (line 365) → `<div class="problem-header reveal">`
- `.drift-display` (line 377) → `<div class="drift-display scanlines reveal">`
- `.problems-list` (line 420) → `<div class="problems-list reveal-children">`
- `#features .section-inner > div:first-child` (line 453) → add `reveal` class
- `.features-grid` (line 461) → `<div class="features-grid reveal-children">`
- `.how-header` (line 534) → `<div class="how-header reveal">`
- `.how .ascii-center` (line 539) → wrap in `<div class="reveal">` or add class
- `#demo h2 wrapper` (line 560) → add `reveal`
- `.terminal` (line 564) → `<div class="terminal reveal">`
- `.ba` (line 609) → `<div class="ba reveal">`
- `.cta` content elements — add `reveal`

Add `class="divider reveal"` to each `.divider` element (lines 359, 447, 528, 554, 644).

**Step 3: Add IntersectionObserver JS**

Insert in the `<script>` section (after existing JS, before `</script>`):

```javascript
// Scroll Reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal,.reveal-children,.divider').forEach(el => revealObserver.observe(el));
```

**Step 4: Remove old `fadein` animations from hero elements**

The hero section should NOT use scroll reveal (it's above the fold). Keep the existing `animation:fadein` on hero elements. But remove `animation:fadein` from `.hero-ascii`, `.hero h1`, `.hero-sub`, `.install-row` CSS rules — we'll replace them with the split-letter animation in Task 3.

Actually — keep the existing hero fadein for now. We'll replace it in Task 3. Just ensure `.hero` elements do NOT get `.reveal` class.

**Step 5: Open in browser and verify**

Open `codetape-landing-v2.html` in browser. Scroll down. Each section should fade in from below as it enters viewport. Divider lines should expand from center.

**Step 6: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add scroll reveal system with IntersectionObserver"
```

---

### Task 2: Drift Meters — Animated Fill

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS sections)

**Step 1: Add drift animation CSS**

Insert in CSS section:

```css
/* DRIFT METER ANIMATION */
.drift-meter span{transition:background 0.3s ease;background:rgba(255,255,255,0.04)}
.drift-meter.animate span.on-g,.drift-meter.animate span.on-b,.drift-meter.animate span.on-a,.drift-meter.animate span.on-r{animation:barFill 0.3s ease both}
@keyframes barFill{from{opacity:0;transform:scaleY(0.3)}to{opacity:1;transform:scaleY(1)}}
.drift-glow{animation:driftGlow 1s ease 0.8s both}
@keyframes driftGlow{0%{box-shadow:none}50%{box-shadow:0 0 20px rgba(240,160,48,0.15)}100%{box-shadow:none}}
```

**Step 2: Rewrite drift meter JS to use IntersectionObserver**

Replace the existing `fillMeter` calls at bottom of `<script>` with:

```javascript
// Drift Meters — animated fill on scroll
function fillMeter(id, count, cls, baseDelay) {
  const el = document.getElementById(id);
  const total = 30;
  let html = '';
  for (let i = 0; i < total; i++) {
    const isOn = i < count;
    const delay = baseDelay + i * 0.025;
    html += isOn
      ? `<span class="on-${cls}" style="animation-delay:${delay.toFixed(3)}s"></span>`
      : '<span></span>';
  }
  el.innerHTML = html;
}

const driftEl = document.querySelector('.drift-display');
let driftFilled = false;
const driftObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !driftFilled) {
      driftFilled = true;
      fillMeter('dm-code', 28, 'g', 0);
      fillMeter('dm-git', 24, 'b', 0.15);
      fillMeter('dm-claude', 10, 'a', 0.3);
      fillMeter('dm-readme', 4, 'r', 0.45);
      fillMeter('dm-arch', 1, 'r', 0.6);
      fillMeter('dm-all', 27, 'g', 1.0);
      driftEl.classList.add('drift-glow');
      driftObserver.unobserve(driftEl);
    }
  });
}, { threshold: 0.3 });
driftObserver.observe(driftEl);
```

**Step 3: Verify in browser**

Scroll to drift meters section. Bars should fill left-to-right in sequence. The "WITH CODETAPE" row should fill last. The container should glow once after all bars fill.

**Step 4: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): animate drift meters on scroll with staggered fill"
```

---

### Task 3: Hero — Split-Letter Animation + Scroll Indicator

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS + HTML hero section)

**Step 1: Add split-letter CSS**

```css
/* HERO SPLIT LETTER */
.hero h1{opacity:1;animation:none}
.hero h1 .letter{display:inline-block;opacity:0;transform:translateY(20px);animation:letterIn 0.4s ease forwards}
@keyframes letterIn{to{opacity:1;transform:none}}
.hero h1 .letter-space{display:inline-block;width:0.3em}
.hero-sub{opacity:0;animation:fadein 0.6s ease forwards}
.install-row{opacity:0;animation:fadein 0.6s ease forwards}
/* SCROLL BOUNCE */
.scroll-hint{animation:bounce 2s ease-in-out infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
```

**Step 2: Add JS to split hero h1 into letter spans**

```javascript
// Hero split-letter animation
function splitLetters(el) {
  const html = el.innerHTML;
  // Process text nodes but preserve HTML tags like <br> and <span>
  let result = '';
  let inTag = false;
  let letterIndex = 0;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    if (ch === '<') { inTag = true; result += ch; continue; }
    if (ch === '>') { inTag = false; result += ch; continue; }
    if (inTag) { result += ch; continue; }
    if (ch === ' ' || ch === '\n') {
      result += '<span class="letter-space"> </span>';
    } else {
      const delay = (letterIndex * 0.03).toFixed(2);
      result += `<span class="letter" style="animation-delay:${delay}s">${ch}</span>`;
      letterIndex++;
    }
  }
  el.innerHTML = result;
}

const heroH1 = document.querySelector('.hero h1');
if (heroH1) {
  // Set subtitle and install delays based on letter count
  const letterCount = heroH1.textContent.replace(/\s/g, '').length;
  const subDelay = (letterCount * 0.03 + 0.3).toFixed(2);
  const installDelay = (letterCount * 0.03 + 0.5).toFixed(2);
  splitLetters(heroH1);
  const sub = document.querySelector('.hero-sub');
  const install = document.querySelector('.install-row');
  if (sub) sub.style.animationDelay = subDelay + 's';
  if (install) install.style.animationDelay = installDelay + 's';
}
```

**Step 3: Add `scroll-hint` class to the scroll indicator**

Change the scroll hint `<pre>` (line 353) to:
```html
<div class="scroll-hint" style="margin-top:48px">
  <pre class="ascii ascii-dim" style="font-size:10px;text-align:center">
        ▼ scroll to learn more ▼
  ───────────────────────────────</pre>
</div>
```

**Step 4: Verify in browser**

Reload page. Hero headline letters should cascade in from bottom. Subtitle fades in after letters finish. Install box fades in after subtitle. Scroll arrow bounces.

**Step 5: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): hero split-letter cascade + scroll bounce indicator"
```

---

### Task 4: Canvas Audio Waveform Background

**Files:**
- Modify: `codetape-landing-v2.html` (HTML hero section + JS)

**Step 1: Add canvas element to hero**

Insert right after `<section class="hero">` (line 315):

```html
<canvas id="hero-canvas" style="position:absolute;inset:0;z-index:0;pointer-events:none"></canvas>
```

Ensure all hero content has `position:relative;z-index:1` — add to `.hero > *` or wrap content in a div.

**Step 2: Add canvas CSS**

```css
/* HERO CANVAS */
.hero{position:relative;overflow:hidden}
.hero>*:not(#hero-canvas){position:relative;z-index:1}
#hero-canvas{position:absolute;inset:0;z-index:0}
```

**Step 3: Add canvas waveform JS**

```javascript
// Hero canvas waveform
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mx = 0.5, my = 0.5;
  let w, h;
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  if (!isMobile) {
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width;
      my = (e.clientY - rect.top) / rect.height;
    });
  }

  let t = 0;
  function draw() {
    t += 0.008;
    ctx.clearRect(0, 0, w, h);

    // Draw 5 waveform lines
    for (let line = 0; line < 5; line++) {
      const yBase = h * (0.3 + line * 0.1);
      const amplitude = 20 + line * 8 + (isMobile ? 0 : (my - 0.5) * 30);
      const freq = 0.003 + line * 0.001;
      const phase = t + line * 0.8;
      const alpha = 0.04 + line * 0.015;

      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (let x = 0; x < w; x += 3) {
        const mouseInfluence = isMobile ? 0 : Math.exp(-Math.pow((x / w - mx) * 3, 2)) * 25;
        const y = yBase + Math.sin(x * freq + phase) * amplitude
                  + Math.sin(x * freq * 2.3 + phase * 1.5) * amplitude * 0.3
                  + mouseInfluence * Math.sin(x * 0.01 + t * 2);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(240,160,48,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  // Only run canvas on non-mobile
  if (!isMobile) {
    draw();
  }
})();
```

**Step 4: Verify in browser**

Reload page. Subtle amber waveform lines should flow behind the hero content. Moving mouse should slightly distort the waves near the cursor. On mobile/touch, canvas should not render (no performance hit).

**Step 5: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add canvas audio waveform to hero background"
```

---

### Task 5: Feature Cards — 3D Tilt + Glow Border

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS)

**Step 1: Add tilt + glow CSS**

```css
/* FEATURE CARD TILT */
.feat{transition:background 0.2s,transform 0.15s ease,box-shadow 0.2s;transform-style:preserve-3d;will-change:transform}
.feat::before{
  content:'';position:absolute;inset:0;border-radius:0;opacity:0;
  transition:opacity 0.3s;pointer-events:none;z-index:1;
  background:radial-gradient(400px circle at var(--glow-x,50%) var(--glow-y,50%),rgba(240,160,48,0.08),transparent 60%);
}
.feat:hover::before{opacity:1}
.feat:hover .ascii{color:var(--amber-dim)}
```

**Step 2: Add tilt JS**

```javascript
// Feature card 3D tilt
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isMobile) {
  document.querySelectorAll('.feat').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 16;
      const rotateY = (x - 0.5) * 16;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.setProperty('--glow-x', `${x * 100}%`);
      card.style.setProperty('--glow-y', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}
```

**Step 3: Verify in browser**

Hover over feature cards. They should tilt toward the cursor with a subtle amber glow following the mouse. On mouseleave, cards spring back flat.

**Step 4: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add 3D tilt + glow effect to feature cards"
```

---

### Task 6: Terminal Demo — Typewriter Effect

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS + HTML)

**Step 1: Add typewriter CSS**

```css
/* TYPEWRITER */
.term-cursor{display:inline-block;width:7px;height:14px;background:var(--amber);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.term-line{opacity:0;transition:opacity 0.15s}
.term-line.typed{opacity:1}
.term-line.highlight{animation:lineFlash 0.4s ease}
@keyframes lineFlash{0%{background:rgba(240,160,48,0.1)}100%{background:transparent}}
```

**Step 2: Restructure terminal body HTML**

Replace the current `.term-body` contents (lines 569-605) with an empty container:

```html
<div class="term-body" id="term-demo"></div>
```

**Step 3: Add typewriter JS**

```javascript
// Terminal typewriter
(function() {
  const container = document.getElementById('term-demo');
  if (!container) return;

  const lines = [
    { type: 'type', prefix: '<span class="tp">$ </span>', text: 'npx codetape init', speed: 35, cls: 'tc' },
    { type: 'pause', ms: 400 },
    { type: 'line', text: '<span class="td">  Scanning project...</span>', delay: 200 },
    { type: 'line', text: '<span class="tg">  \u2713</span> Detected: TypeScript + Next.js', delay: 150, highlight: true },
    { type: 'line', text: '<span class="tg">  \u2713</span> Found 23 components in src/', delay: 150, highlight: true },
    { type: 'line', text: '<span class="tg">  \u2713</span> Created .codetape/config.json', delay: 150, highlight: true },
    { type: 'line', text: '<span class="tg">  \u2713</span> Installed skill \u2192 .claude/skills/codetape/', delay: 150, highlight: true },
    { type: 'line', text: '<span class="tg">  \u2713</span> Added 7 commands \u2192 .claude/commands/', delay: 150, highlight: true },
    { type: 'line', text: '<span class="td">  Done! Try /trace after your next session.</span>', delay: 300 },
    { type: 'pause', ms: 300 },
    { type: 'line', text: '<span class="td">\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</span>', delay: 100 },
    { type: 'pause', ms: 400 },
    { type: 'type', prefix: '<span class="tp">claude\u25b8 </span>', text: '/trace', speed: 50, cls: 'tc' },
    { type: 'pause', ms: 500 },
    { type: 'line', text: '<span class="td">  Analysing 12 modified files...</span>', delay: 400 },
    { type: 'pause', ms: 300 },
    { type: 'line', text: '<span class="ta">  \u250c\u2500 Trace: stripe-preauth-flow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510</span>', delay: 60 },
    { type: 'line', text: '<span class="ta">  \u2502</span>                                        <span class="ta">\u2502</span>', delay: 40 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  Impact: <span class="tr">HIGH</span> \u2014 core payment changed    <span class="ta">\u2502</span>', delay: 60 },
    { type: 'line', text: '<span class="ta">  \u2502</span>                                        <span class="ta">\u2502</span>', delay: 40 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  <span class="tcy">\u25c9</span> PaymentService    <span class="td">refactored</span>       <span class="ta">\u2502</span>', delay: 80 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  <span class="tcy">\u25c9</span> StripeWebhook     <span class="tg">new</span>             <span class="ta">\u2502</span>', delay: 80 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  <span class="tcy">\u25c9</span> BookingFlow       <span class="td">modified</span>        <span class="ta">\u2502</span>', delay: 80 },
    { type: 'line', text: '<span class="ta">  \u2502</span>                                        <span class="ta">\u2502</span>', delay: 40 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  Decision: PaymentIntent API over       <span class="ta">\u2502</span>', delay: 60 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  Charges (SCA + delayed capture)        <span class="ta">\u2502</span>', delay: 60 },
    { type: 'line', text: '<span class="ta">  \u2502</span>                                        <span class="ta">\u2502</span>', delay: 40 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  TODO: preauth expiry handling          <span class="ta">\u2502</span>', delay: 60 },
    { type: 'line', text: '<span class="ta">  \u2502</span>  TODO: webhook integration test         <span class="ta">\u2502</span>', delay: 60 },
    { type: 'line', text: '<span class="ta">  \u2502</span>                                        <span class="ta">\u2502</span>', delay: 40 },
    { type: 'line', text: '<span class="ta">  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518</span>', delay: 60 },
    { type: 'pause', ms: 200 },
    { type: 'line', text: '<span class="tg">  \u2713</span> Saved \u2192 .codetape/traces/2026-03-20_stripe-preauth.md', delay: 150, highlight: true },
    { type: 'line', text: '<span class="tg">  \u2713</span> Updated component-map.json (3 components)', delay: 150, highlight: true },
    { type: 'line', text: '<span class="ta">  \u26a0</span> README.md#payment-flow is outdated \u2192 /trace-sync', delay: 200, highlight: true },
  ];

  let started = false;
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        runTypewriter(container, lines);
        termObserver.unobserve(container);
      }
    });
  }, { threshold: 0.3 });
  termObserver.observe(container);

  async function runTypewriter(el, lines) {
    for (const line of lines) {
      if (line.type === 'pause') {
        await sleep(line.ms);
      } else if (line.type === 'type') {
        const div = document.createElement('div');
        div.className = 'term-line typed';
        div.innerHTML = line.prefix;
        const textSpan = document.createElement('span');
        textSpan.className = line.cls || '';
        div.appendChild(textSpan);
        const cursor = document.createElement('span');
        cursor.className = 'term-cursor';
        div.appendChild(cursor);
        el.appendChild(div);
        for (const ch of line.text) {
          textSpan.textContent += ch;
          await sleep(line.speed);
        }
        cursor.remove();
        await sleep(200);
      } else if (line.type === 'line') {
        const div = document.createElement('div');
        div.className = 'term-line' + (line.highlight ? ' highlight' : '');
        div.innerHTML = line.text;
        el.appendChild(div);
        await sleep(20);
        div.classList.add('typed');
        await sleep(line.delay || 100);
      }
    }
    // Add final blinking cursor
    const cursorDiv = document.createElement('div');
    cursorDiv.className = 'term-line typed';
    cursorDiv.innerHTML = '<span class="tp">claude\u25b8 </span><span class="term-cursor"></span>';
    el.appendChild(cursorDiv);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
})();
```

**Step 4: Verify in browser**

Scroll to demo section. Terminal should start typing `npx codetape init` character by character, then reveal output lines, then type `/trace` and reveal the trace output. Blinking cursor at the end.

**Step 5: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add typewriter effect to terminal demo"
```

---

### Task 7: Before/After — Interactive Drag Slider

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS + HTML)

**Step 1: Add slider CSS**

```css
/* BEFORE/AFTER SLIDER */
.ba-slider{position:relative;max-width:700px;margin:32px auto 0;background:var(--surface);border-radius:8px;overflow:hidden;border:1px solid rgba(240,160,48,0.08);user-select:none}
.ba-slider-layer{position:absolute;inset:0;padding:28px;font-family:var(--mono);font-size:11.5px;line-height:1.8;overflow:hidden}
.ba-slider-before{background:var(--surface);z-index:1;border-right:2px solid var(--amber)}
.ba-slider-after{position:relative;z-index:0;background:var(--bg)}
.ba-slider-handle{
  position:absolute;top:0;bottom:0;z-index:2;width:32px;cursor:ew-resize;
  display:flex;align-items:center;justify-content:center;transform:translateX(-50%);
}
.ba-slider-grip{
  width:24px;height:48px;background:var(--surface2);border:1px solid var(--amber);
  border-radius:4px;display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);font-size:10px;color:var(--amber);
  box-shadow:0 2px 10px rgba(0,0,0,0.3);
}
.ba-label{
  position:absolute;top:8px;font-family:var(--mono);font-size:9px;
  letter-spacing:1px;text-transform:uppercase;z-index:3;padding:2px 6px;border-radius:2px;
}
.ba-label-before{left:8px;color:var(--red);background:rgba(232,64,64,0.1)}
.ba-label-after{right:8px;color:var(--green);background:rgba(48,216,128,0.1)}
```

**Step 2: Replace before/after HTML**

Replace the `.ba` div (lines 609-639) with:

```html
<div class="ba reveal">
  <div style="text-align:center">
    <pre class="ascii ascii-dim ascii-sm" style="margin-bottom:20px">
        ┌──────────────┐          ┌──────────────┐
        │    WITHOUT   │  ◀ drag ▶  │     WITH     │
        │   codetape   │          │   codetape   │
        └──────────────┘          └──────────────┘</pre>
  </div>
  <div class="ba-slider" id="ba-slider" style="height:260px">
    <span class="ba-label ba-label-before">without</span>
    <span class="ba-label ba-label-after">with</span>
    <div class="ba-slider-after" style="padding:28px">
<pre class="ascii" style="font-size:11px;line-height:1.75"><span class="ascii-green">  ✓</span> <span class="ascii-mid">Trace: "pre-auth for SCA"</span>
<span class="ascii-green">  ✓</span> <span class="ascii-mid">Decision: why pre-auth > charge</span>
<span class="ascii-green">  ✓</span> <span class="ascii-mid">Component map auto-updated</span>
<span class="ascii-green">  ✓</span> <span class="ascii-mid">README synced in one command</span>
<span class="ascii-green">  ✓</span> <span class="ascii-mid">CLAUDE.md knows current arch</span>
<span class="ascii-green">  ✓</span> <span class="ascii-mid">New dev reads ARCHITECTURE.md</span>
<span class="ascii-green">
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</span></pre>
    </div>
    <div class="ba-slider-before ba-slider-layer" id="ba-before">
<pre class="ascii" style="font-size:11px;line-height:1.75"><span class="ascii-red">  ╳</span> <span class="ascii-mid">commit: "update payment"</span>
<span class="ascii-red">  ╳</span> <span class="ascii-mid">commit: "fix stripe stuff"</span>
<span class="ascii-red">  ╳</span> <span class="ascii-mid">commit: "wip"</span>
<span class="ascii-red">  ╳</span> <span class="ascii-mid">README says "instant charge"</span>
<span class="ascii-red">  ╳</span> <span class="ascii-mid">CLAUDE.md describes old arch</span>
<span class="ascii-red">  ╳</span> <span class="ascii-mid">New dev: "how does this work?"</span>
<span class="ascii-dim">
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░</span></pre>
    </div>
    <div class="ba-slider-handle" id="ba-handle">
      <div class="ba-slider-grip">◀▶</div>
    </div>
  </div>
</div>
```

**Step 3: Add slider JS**

```javascript
// Before/After slider
(function() {
  const slider = document.getElementById('ba-slider');
  const handle = document.getElementById('ba-handle');
  const before = document.getElementById('ba-before');
  if (!slider || !handle || !before) return;

  let dragging = false;
  let pos = 0.35; // start at 35%

  function setPos(p) {
    pos = Math.max(0.05, Math.min(0.95, p));
    const pct = pos * 100;
    before.style.width = pct + '%';
    handle.style.left = pct + '%';
  }
  setPos(pos);

  function getX(e) {
    const touch = e.touches ? e.touches[0] : e;
    const rect = slider.getBoundingClientRect();
    return (touch.clientX - rect.left) / rect.width;
  }

  handle.addEventListener('mousedown', () => dragging = true);
  handle.addEventListener('touchstart', () => dragging = true, { passive: true });
  window.addEventListener('mousemove', (e) => { if (dragging) setPos(getX(e)); });
  window.addEventListener('touchmove', (e) => { if (dragging) setPos(getX(e)); }, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);
  slider.addEventListener('click', (e) => setPos(getX(e)));
})();
```

**Step 4: Verify in browser**

Scroll to before/after section. Drag the handle left/right. Left side (red/without) and right side (green/with) should clip based on handle position. Starting position should be ~35% showing mostly the "with" side.

**Step 5: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add interactive before/after drag slider"
```

---

### Task 8: CTA — Magnetic Button + Aurora Background

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS)

**Step 1: Add aurora + magnetic CSS**

```css
/* CTA AURORA */
.cta{position:relative;overflow:hidden}
.cta::before{
  content:'';position:absolute;inset:-50%;z-index:0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(240,160,48,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(120,80,200,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(240,160,48,0.04) 0%, transparent 50%);
  animation:aurora 12s ease-in-out infinite alternate;
}
@keyframes aurora{
  0%{transform:translate(0,0) rotate(0deg)}
  33%{transform:translate(30px,-20px) rotate(1deg)}
  66%{transform:translate(-20px,15px) rotate(-1deg)}
  100%{transform:translate(10px,-10px) rotate(0.5deg)}
}
.cta>*{position:relative;z-index:1}

/* MAGNETIC BUTTON */
.btn-p{transition:all 0.2s ease;position:relative;overflow:hidden}
.btn-p::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%);
  transform:translateX(-100%);
  animation:shimmer 3s ease-in-out infinite;
}
@keyframes shimmer{0%,100%{transform:translateX(-100%)}50%{transform:translateX(100%)}}
```

**Step 2: Add magnetic button JS**

```javascript
// Magnetic CTA button
if (!isMobile) {
  document.querySelectorAll('.btn-p').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.3}px) translateY(-1px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}
```

**Step 3: Verify in browser**

Scroll to CTA section. Background should show slow-moving aurora gradient. Primary button should have a shimmer sweep and follow the mouse slightly when hovered.

**Step 4: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add aurora background + magnetic button to CTA"
```

---

### Task 9: Install Box — Glow Hover + Haptic Feedback

**Files:**
- Modify: `codetape-landing-v2.html` (CSS)

**Step 1: Enhance install box hover CSS**

Update existing `.install-box` styles:

```css
.install-box{
  background:var(--surface);border:1px solid rgba(240,160,48,0.12);
  border-radius:4px;padding:12px 20px;cursor:pointer;
  transition:all 0.2s,box-shadow 0.3s;
  font-family:var(--mono);font-size:13px;display:flex;align-items:center;gap:10px;
  position:relative;
}
.install-box:hover{
  border-color:rgba(240,160,48,0.4);background:var(--surface2);
  box-shadow:0 0 20px rgba(240,160,48,0.1),0 0 40px rgba(240,160,48,0.05);
  transform:translateY(-1px);
}
.install-box:active{transform:scale(0.98) translateY(0)}
```

**Step 2: Verify hover looks good**

**Step 3: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): enhance install box hover with glow + press feedback"
```

---

### Task 10: VHS Easter Egg

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS)

**Step 1: Add VHS CSS**

```css
/* VHS EASTER EGG */
.vhs-overlay{
  position:fixed;inset:0;z-index:10000;pointer-events:none;opacity:0;
  background:var(--bg);
  transition:opacity 0.3s;
}
.vhs-overlay.active{opacity:1;pointer-events:all}
.vhs-overlay.active::before{
  content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(
    0deg,
    transparent,transparent 2px,
    rgba(255,255,255,0.03) 2px,rgba(255,255,255,0.03) 4px
  );
  animation:vhsScan 0.1s linear infinite;
}
@keyframes vhsScan{0%{transform:translateY(0)}100%{transform:translateY(4px)}}
.vhs-overlay .vhs-text{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  font-family:var(--mono);font-size:24px;color:var(--amber);
  text-shadow:2px 0 var(--red),-2px 0 var(--cyan);
  animation:vhsGlitch 0.15s ease infinite;
}
@keyframes vhsGlitch{
  0%{transform:translate(-50%,-50%)}
  25%{transform:translate(-49%,-51%)}
  50%{transform:translate(-51%,-50%)}
  75%{transform:translate(-50%,-49%)}
}
.vhs-noise{
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity:0.15;mix-blend-mode:overlay;
}
```

**Step 2: Add VHS HTML (at end of body, before `</body>`)**

```html
<div class="vhs-overlay" id="vhs"><div class="vhs-noise"></div><div class="vhs-text">◀◀ REWIND ◀◀</div></div>
```

**Step 3: Add Konami code JS**

```javascript
// VHS Easter Egg — Konami Code
(function() {
  const code = [38,38,40,40,37,39,37,39,66,65]; // ↑↑↓↓←→←→BA
  let pos = 0;
  const vhs = document.getElementById('vhs');
  if (!vhs) return;

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === code[pos]) {
      pos++;
      if (pos === code.length) {
        pos = 0;
        vhs.classList.add('active');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
          setTimeout(() => vhs.classList.remove('active'), 600);
        }, 1800);
      }
    } else {
      pos = 0;
    }
  });
})();
```

**Step 4: Verify in browser**

Press ↑↑↓↓←→←→BA. VHS rewind effect should cover the screen for ~2 seconds with scanlines, noise, and "REWIND" text, then scroll to top and fade out.

**Step 5: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): add VHS rewind easter egg (Konami code)"
```

---

### Task 11: Mobile Responsive + Performance Polish

**Files:**
- Modify: `codetape-landing-v2.html` (CSS + JS)

**Step 1: Update responsive CSS**

Add/update media queries:

```css
@media(max-width:768px){
  .hero-ascii{transform:scale(0.6);transform-origin:center}
  .features-grid{grid-template-columns:1fr}
  .ba-slider{height:240px}
  .ascii{font-size:10px}
  .drift-meter span{width:6px;height:10px}
  nav .nav-links a:not(.nav-cta){display:none}
  .footer-inner{flex-direction:column;gap:12px}
  .feat{transform:none!important}
  .feat::before{display:none}
  .btn-p{transform:none!important}
}
@media(max-width:480px){
  .hero-ascii{transform:scale(0.42)}
  .problem-item{flex-direction:column;gap:4px}
  .ba-slider{height:220px}
}
```

**Step 2: Ensure `isMobile` is declared once globally**

Move `const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;` to top of script block, remove any duplicates.

**Step 3: Add `prefers-reduced-motion` support**

```css
@media(prefers-reduced-motion:reduce){
  *{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
  .hero h1 .letter{opacity:1;transform:none;animation:none}
  .reveal,.reveal-children>*{opacity:1;transform:none;transition:none}
}
```

**Step 4: Full browser test**

- Desktop: all animations, canvas, tilt, slider, magnetic, easter egg
- Mobile viewport (devtools): no canvas, no tilt, simpler transitions, slider still works with touch
- Reduced motion: all animations disabled, content visible immediately

**Step 5: Commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): mobile responsive polish + reduced-motion support"
```

---

### Task 12: Final Integration + Smoke Test

**Files:**
- Modify: `codetape-landing-v2.html` (any final fixes)

**Step 1: Full page scroll test**

Open page, scroll top to bottom. Verify:
- [ ] Hero: letters cascade, waveform visible (desktop), subtitle/install fade in
- [ ] Dividers: typewriter expand
- [ ] Problem section: reveals on scroll
- [ ] Drift meters: bars fill with animation
- [ ] Features: cards stagger in, 3D tilt on hover
- [ ] How it works: reveals on scroll
- [ ] Terminal: typewriter types content
- [ ] Before/After: slider draggable
- [ ] CTA: aurora background, magnetic button, shimmer
- [ ] Footer: visible
- [ ] Easter egg: Konami code works

**Step 2: Check for JS errors**

Open browser console. Verify zero errors on page load and during all interactions.

**Step 3: Final commit**

```bash
git add codetape-landing-v2.html
git commit -m "feat(landing): complete interactive enhancement — v3"
```
