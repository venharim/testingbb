let cast = [];
let evicted = [];
let currentEventIndex = 0;
let events = [];

document.addEventListener("DOMContentLoaded", () => {
  const castInputs = document.getElementById("cast-inputs");
  for (let i = 0; i < 16; i++) {
    castInputs.innerHTML += `
      <input type="text" placeholder="Name ${i + 1}" name="name-${i}" required>
      <input type="text" placeholder="Image URL ${i + 1}" name="img-${i}" required>
    `;
  }

  document.getElementById("cast-form").addEventListener("submit", startGame);
  document.getElementById("begin-week").addEventListener("click", startWeek);
  document.getElementById("next-event").addEventListener("click", nextEvent);
});

function startGame(e) {
  e.preventDefault();
  const inputs = document.querySelectorAll("#cast-form input");
  cast = [];
  for (let i = 0; i < inputs.length; i += 2) {
    const name = inputs[i].value.trim();
    const img = inputs[i + 1].value.trim();
    if (name && img) cast.push({ name, img });
  }
  if (cast.length < 4) return alert("Enter at least 4 houseguests.");
  document.getElementById("cast-entry").classList.remove("screen");
  document.getElementById("memory-wall").classList.add("active");
  renderWall();
}

function renderWall() {
  const container = document.getElementById("wall-container");
  container.innerHTML = "";
  cast.forEach(player => {
    const div = document.createElement("div");
    div.className = "wall-photo";
    div.innerHTML = `<img src="${player.img}"><p>${player.name}</p>`;
    container.appendChild(div);
  });
}

function startWeek() {
  document.getElementById("memory-wall").classList.remove("active");
  document.getElementById("game-events").classList.add("active");
  generateWeekEvents();
  currentEventIndex = 0;
  renderEvent();
}

function generateWeekEvents() {
  if (cast.length <= 2) return endGame();
  const hoh = pickRandom(cast);
  let noms = pickTwo(cast.filter(p => p !== hoh));
  const pov = pickRandom(cast);
  const vetoUsed = Math.random() < 0.5;
  if (vetoUsed && !noms.includes(pov)) {
    const replacement = pickRandom(cast.filter(p => ![hoh, pov, ...noms].includes(p)));
    if (replacement) noms[0] = replacement;
  }
  const evictedPlayer = pickRandom(noms);
  evicted.push(evictedPlayer);
  cast = cast.filter(p => p !== evictedPlayer);

  // Update wall
  renderWallEvictions();

  events = [
    `${hoh.name} wins Head of Household.`,
    `${hoh.name} nominates ${noms[0].name} and ${noms[1].name}.`,
    `${pov.name} wins the Power of Veto.`,
    vetoUsed
      ? `${pov.name} uses the veto. ${noms[0].name} is the replacement nominee.`
      : `${pov.name} does not use the veto.`,
    `Houseguests vote. ${evictedPlayer.name} is evicted.`
  ];
}

function renderWallEvictions() {
  const photos = document.querySelectorAll(".wall-photo");
  photos.forEach(photo => {
    const name = photo.querySelector("p").textContent;
    if (evicted.find(e => e.name === name)) {
      photo.classList.add("evicted");
    }
  });
}

function renderEvent() {
  const log = document.getElementById("event-log");
  log.innerHTML = `<p>${events[currentEventIndex]}</p>`;
}

function nextEvent() {
  currentEventIndex++;
  if (currentEventIndex < events.length) {
    renderEvent();
  } else {
    // Move to next week
    document.getElementById("game-events").classList.remove("active");
    document.getElementById("memory-wall").classList.add("active");
    document.getElementById("begin-week").textContent = `Begin Week ${evicted.length + 2}`;
  }
}

function endGame() {
  document.getElementById("event-log").innerHTML = "<h2>Game over! Final 2 reached.</h2>";
  document.getElementById("next-event").classList.add("hidden");
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo(arr) {
  const a = pickRandom(arr);
  let b;
  do {
    b = pickRandom(arr);
  } while (a === b);
  return [a, b];
}
