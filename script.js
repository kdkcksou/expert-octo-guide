/* Ömer & Damla - script.js */

/* ✏️ BURAYI KENDİNE GÖRE DÜZENLE ✏️ */
const QUESTIONS = [
  {
    type: "text", text: "Ömer kaç yaşında?", placeholder: "Bir sayı yaz…", inputMode: "numeric",
    answers: ["20"],
    wrong: ["Yanlış hatırladın aşkım, tekrar dene! 🙈", "Yaşımı unuttun mu yoksa beni yaşlandırmaya mı çalışıyorsun? 😏"],
  },
  {
    type: "text", text: "Ömer'in burcu ne?", placeholder: "Burcumu yaz…",
    // ⚠️ Kendi burcunu yaz ("Balık" / "balik" fark etmez)
    answers: ["Balık"],
    wrong: ["Hımm, yıldızlar bu cevaba pek gülmedi… tekrar dene! ✨", "Yaklaştın ama hâlâ değil sevgilim, bir daha bak 🔮"],
  },
  {
    type: "choice", text: "Damla, Ömer'in gözünde ne ifade ediyor?",
    options: ["Güzel bir arkadaş", "Her şey", "Sadece sevgili", "Bilmem ki…"],
    correct: "Her şey",
    wrong: ["Bu kadar mı küçülttün beni? Bir daha düşün 🥺", "Kalbime dokunmadı bu cevap, tekrar dene aşkım 💔"],
  },
  {
    type: "choice", text: "İlk kavgamızda ne olmuştu?",
    // ⚠️ Seçenekleri ve doğru cevabı kendi hikâyenize göre değiştir
    options: ["Küstük ve hemen barışmadık", "Birbirimizi çok özleyip barıştık", "Hiç kavga etmedik ki!", "Beni affetmen çok zor oldu"],
    correct: "Birbirimizi çok özleyip barıştık",
    wrong: ["Bunu öyle hatırlamıyorum aşkım, bir daha düşün 😌", "Hafızan beni yanıltıyor, tekrar dene! 💭"],
  },
];

const SUCCESS = ["Aferin bana, çok doğru! 💗", "İşte benim hatırlayan sevgilim! ✨", "Biliyordum, sen beni bilirsin 🌹", "Kalbim eridi, devam! 🥰"];

const DODGE_TEXTS = ["Biraz daha düşüneyim", "Emin misin? 🥺", "Yapma ama…", "Yakalayabilirsen bas 😏", "Tamam, vazgeçtim 🙈"];

/* ===== Yardımcılar ===== */
const $ = (id) => document.getElementById(id);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const state = { index: 0, locked: false };
const screens = { intro: $("screen-intro"), quiz: $("screen-quiz"), letter: $("screen-letter") };
const card = $("card"), qBody = $("q-body"), feedback = $("feedback"), meter = $("meter");

function normalize(s) {
  return String(s).trim().toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("screen--active"));
  screens[name].classList.add("screen--active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setFeedback(msg, ok = false) {
  feedback.textContent = msg;
  feedback.classList.toggle("ok", ok);
  feedback.classList.add("show");
}
function setFill(n) { meter.style.setProperty("--fill", n); }

/* ===== Kalp efektleri (canvas) ===== */
const cv = $("fx"), ctx = cv.getContext("2d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COLORS = ["#f4b6c2", "#ffd7df", "#e8b4a0", "#d9798f"];
const parts = [];
let W = 0, H = 0;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function drawHeart(s) {
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(-s * 1.6, -s * 0.2, -s * 0.9, -s * 1.2, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.9, -s * 1.2, s * 1.6, -s * 0.2, 0, s);
  ctx.fill();
}

function ambient() {
  const vy = -(0.5 + Math.random() * 0.9);
  parts.push({ amb: true, x: Math.random() * W, y: H + 20, vx: 0, vy, s: 5 + Math.random() * 9, a: 0.25 + Math.random() * 0.45,
    rot: 0, vr: 0, age: 0, life: (H + 60) / -vy, ph: Math.random() * 300, c: pick(COLORS) });
}

function burst(x, y, n = 12, power = 1) {
  if (parts.length > 320) return;
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2, sp = (1.5 + Math.random() * 4) * power;
    parts.push({ amb: false, x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2, s: 5 + Math.random() * 9, a: 0.9,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.12, age: 0, life: 70 + Math.random() * 60, c: pick(COLORS) });
  }
}

let lastAmb = 0;
function frame(t) {
  ctx.clearRect(0, 0, W, H);
  if (!reduceMotion && !document.hidden && t - lastAmb > 650) { ambient(); lastAmb = t; }

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.age++;
    const k = p.age / p.life;
    if (k >= 1) { parts.splice(i, 1); continue; }
    let alpha;
    if (p.amb) {
      p.y += p.vy; p.x += Math.sin((p.age + p.ph) / 50) * 0.45;
      alpha = Math.sin(Math.PI * k) * p.a;
    } else {
      p.vy += 0.07; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      alpha = (1 - k) * p.a;
    }
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(alpha, 0);
    ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 12;
    drawHeart(p.s);
    ctx.restore();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Ekrana dokununca kalpler fışkırsın
addEventListener("pointerdown", (e) => {
  if (e.target.closest("input")) return;
  burst(e.clientX, e.clientY, 7, 0.7);
});

function bigBurst(count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => burst(W * (0.15 + Math.random() * 0.7), H * (0.2 + Math.random() * 0.5), 16, 1.3), i * 220);
  }
}

/* ===== Quiz ===== */
function renderQuestion() {
  const q = QUESTIONS[state.index];
  state.locked = false;
  feedback.classList.remove("show", "ok");
  $("q-number").textContent = `Soru ${state.index + 1} / ${QUESTIONS.length}`;
  $("q-text").textContent = q.text;
  qBody.innerHTML = "";

  if (q.type === "text") {
    const input = document.createElement("input");
    input.type = "text"; input.className = "input";
    input.placeholder = q.placeholder || "Cevabını yaz…";
    input.autocomplete = "off"; input.autocapitalize = "off"; input.spellcheck = false;
    if (q.inputMode) input.inputMode = q.inputMode;

    const btn = document.createElement("button");
    btn.className = "btn"; btn.type = "button"; btn.textContent = "Cevapla";

    const submit = () => {
      if (state.locked) return;
      const v = normalize(input.value);
      if (!v) return setFeedback("Önce bir cevap yazmalısın tatlım 🌸");
      handleResult(q.answers.some((a) => normalize(a) === v), q, btn);
    };
    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    qBody.append(input, btn);
    if (matchMedia("(hover: hover)").matches) setTimeout(() => input.focus(), 350);
  } else {
    q.options.forEach((opt) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "option"; b.textContent = opt;
      b.addEventListener("click", () => {
        if (state.locked) return;
        const ok = opt === q.correct;
        b.classList.add(ok ? "is-correct" : "is-wrong");
        if (!ok) setTimeout(() => b.classList.remove("is-wrong"), 700);
        handleResult(ok, q, b);
      });
      qBody.appendChild(b);
    });
  }
}

function handleResult(ok, q, el) {
  if (!ok) {
    setFeedback(pick(q.wrong));
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    return;
  }
  state.locked = true;
  setFeedback(pick(SUCCESS), true);
  setFill((state.index + 1) / QUESTIONS.length);
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 14, 1);
  setTimeout(nextQuestion, 1200);
}

function nextQuestion() {
  card.classList.add("is-leaving");
  setTimeout(() => {
    state.index++;
    card.classList.remove("is-leaving");
    if (state.index >= QUESTIONS.length) return revealLetter();
    card.classList.add("is-entering");
    renderQuestion();
    setTimeout(() => card.classList.remove("is-entering"), 650);
  }, 400);
}

/* ===== Mektup ===== */
function revealLetter() {
  showScreen("letter");
  meter.classList.add("is-full");
  const letter = $("letter");
  Array.from(letter.children).forEach((el, i) => { el.style.animationDelay = `${0.3 + i * 0.6}s`; });
  letter.classList.add("reveal");
  bigBurst(6);
}

/* ===== "Beni affeder misin?" ===== */
const noBtn = $("btn-no"), yesBtn = $("btn-yes"), ask = $("ask");
let dodges = 0, giveUp = false;

function dodge(e) {
  if (giveUp) return;
  e.preventDefault();
  dodges++;
  if (dodges >= DODGE_TEXTS.length) {
    giveUp = true;
    noBtn.className = "btn"; noBtn.style.cssText = "";
    noBtn.textContent = "Tamam, affettim 💗";
    return;
  }
  noBtn.textContent = DODGE_TEXTS[dodges];
  noBtn.classList.add("is-dodging");
  const maxX = ask.clientWidth - noBtn.offsetWidth;
  const maxY = ask.clientHeight - noBtn.offsetHeight;
  noBtn.style.left = Math.max(0, Math.random() * maxX) + "px";
  noBtn.style.top = Math.max(0, Math.random() * maxY) + "px";
}
noBtn.addEventListener("pointerenter", dodge);
noBtn.addEventListener("pointerdown", dodge);

function forgiven() {
  ask.innerHTML = `<p class="ask__done">Seni çok seviyorum, Damla 💗</p>
                   <p class="ask__sub">Bugünden sonra daha dikkatli olacağım, söz. 🌹</p>`;
  bigBurst(10);
  let n = 0;
  const id = setInterval(() => { bigBurst(2); if (++n > 6) clearInterval(id); }, 900);
}
yesBtn.addEventListener("click", forgiven);
noBtn.addEventListener("click", () => { if (giveUp) forgiven(); });

/* ===== Başlat ===== */
$("btn-start").addEventListener("click", () => {
  meter.classList.add("is-small");
  showScreen("quiz");
  card.classList.add("is-entering");
  renderQuestion();
  setTimeout(() => card.classList.remove("is-entering"), 650);
});
