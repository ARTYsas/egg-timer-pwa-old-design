const sizeSlider = document.getElementById("sizeSlider");
const cookSlider = document.getElementById("cookSlider");
const sizeLabel = document.getElementById("sizeLabel");
const cookLabel = document.getElementById("cookLabel");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const timerDisplay = document.getElementById("timer");
const progressCircle = document.querySelector("#circle-timer circle:last-child");

const radius = 90;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference}`;
progressCircle.style.strokeDashoffset = `${circumference}`;

let startTime = 0;
let duration = 0;
let animationFrame = null;
let timerRunning = false;

const cookTimes = [300, 390, 510];
const sizeMods = [-15, 0, 15];

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

function animate() {
  const now = performance.now();
  const elapsed = (now - startTime) / 1000;
  const remaining = Math.max(duration - elapsed, 0);

  const offset = circumference * (1 - remaining / duration);
  progressCircle.style.strokeDashoffset = offset;
  timerDisplay.textContent = remaining > 0 ? formatTime(remaining) : "Готово!";

  if (remaining > 0) {
    animationFrame = requestAnimationFrame(animate);
  } else {
    timerRunning = false;
    playSound();
  }
}

function startTimer() {
  cancelAnimationFrame(animationFrame);
  const cookTime = cookTimes[parseInt(cookSlider.value)];
  const sizeMod = sizeMods[parseInt(sizeSlider.value)];
  duration = cookTime + sizeMod;
  startTime = performance.now();
  timerRunning = true;
  animate();
}

function stopTimer() {
  cancelAnimationFrame(animationFrame);
  timerRunning = false;
  progressCircle.style.strokeDashoffset = circumference;
  timerDisplay.textContent = "00:00";
}

function playSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
  audio.play().catch(() => {});
}

function enableSmoothSnapSlider(sliderId, allowedSteps, duration = 200) {
  const slider = document.getElementById(sliderId);
  let isDragging = false;
  let dragStarted = false;
  let startX = 0;

  function handleStart(x) {
    isDragging = true;
    dragStarted = false;
    startX = x;
  }

  function handleMove(x) {
    if (!isDragging) return;
    const dx = Math.abs(x - startX);
    if (dx > 2) dragStarted = true;
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    const currentValue = parseFloat(slider.value);
    const nearest = allowedSteps.reduce((prev, curr) =>
      Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev
    );

    if (dragStarted) {
      animateSliderToValue(slider, currentValue, nearest, duration);
    } else {
      slider.value = nearest;
      slider.dispatchEvent(new Event("input"));
    }
  }

  // Pointer events (для десктопа)
  slider.addEventListener("pointerdown", (e) => handleStart(e.clientX));
  slider.addEventListener("pointermove", (e) => handleMove(e.clientX));
  slider.addEventListener("pointerup", handleEnd);

  // Touch events (для телефона)
  slider.addEventListener("touchstart", (e) => handleStart(e.touches[0].clientX));
  slider.addEventListener("touchmove", (e) => handleMove(e.touches[0].clientX));
  slider.addEventListener("touchend", handleEnd);
}

function animateSliderToValue(slider, from, to, duration) {
  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = from + (to - from) * easeInOut(progress);

    slider.value = value;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      slider.value = to;
      slider.dispatchEvent(new Event("input"));
    }
  }

  requestAnimationFrame(animate);
}

function easeInOut(t) {
  return 0.5 - Math.cos(t * Math.PI) / 2;
}
enableSmoothSnapSlider("sizeSlider", [0, 1, 2], 200);
enableSmoothSnapSlider("cookSlider", [0, 1, 2], 200);



sizeSlider.addEventListener("input", () => {
  sizeLabel.textContent = ["С0", "С1", "С2"][sizeSlider.value];
});

cookSlider.addEventListener("input", () => {
  cookLabel.textContent = ["Всмятку", "Мешочек", "Вкрутую"][cookSlider.value];
});

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((err) => {
      console.error("SW registration failed:", err);
    });
  });
}
