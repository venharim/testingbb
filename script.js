// --- Setup State ---
let houseguests = [];
let week = 1;
let log = [];
let evictedPlayers = [];

window.onload = () => {
  const form = document.getElementById('custom-cast-form');
  for (let i = 0; i < 16; i++) {
    const div = document.createElement('div');
    div.innerHTML = `
      <label>Player ${i + 1} Name: <input type="text" name="name-${i}"></label>
      <label>Image URL: <input type="text" name="img-${i}"></label><br><br>
    `;
    form.appendChild(div);
  }

  document.getElementById('start-game').addEventListener('click', () => {
    const inputs = form.querySelectorAll('input');
    houseguests = [];
    for (let i = 0; i < inputs.length; i += 2) {
      const name = inputs[i].value.trim();
      const img = inputs[i + 1].value.trim();
      if (name && img) {
        houseguests.push({ name, img });
      }
    }

    if (houseguests.length < 4) {
      alert('Enter at least 4 players.');
      return;
    }

    document.getElementById('cast-setup').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    renderPlayers();
    nextWeek();
  });
};

function renderPlayers() {
  const container = document.getElementById('houseguests');
  container.innerHTML = '';
  houseguests.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <p>${p.name}</p>
    `;
    container.appendChild(card);
  });
}

function nextWeek() {
  if (houseguests.length <= 2) return declareWinner();

  const hoh = pickRandom(houseguests);
  const nominees = pickTwo(houseguests.filter(p => p !== hoh));
  const pov = pickRandom(houseguests);
  let vetoUsed = Math.random() < 0.5;

  if (vetoUsed && !nominees.includes(pov)) {
    const newNom = pickRandom(houseguests.filter(p => ![hoh, pov, ...nominees].includes(p)));
    if (newNom) nominees[0] = newNom;
  }

  const voters = houseguests.filter(p => ![...nominees, hoh].includes(p));
  const evicted = pickRandom(nominees);
  const voteLog = voters.map(v => `${v.name} → ${evicted.name}`);

  log.push({
    week,
    hoh: hoh.name,
    noms: nominees.map(n => n.name).join(' & '),
    pov: pov.name + (vetoUsed ? '*' : ''),
    evicted: evicted.name,
    votes: voteLog
  });

  evictedPlayers.push(evicted);
  houseguests = houseguests.filter(p => p !== evicted);
  week++;
  updateChart();
  renderPlayers();

  setTimeout(nextWeek, 1500);
}

function updateChart() {
  const tbody = document.querySelector('#voting-chart tbody');
  tbody.innerHTML = '';
  log.forEach(entry => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${entry.week}</td>
      <td>${entry.hoh}</td>
      <td>${entry.noms}</td>
      <td>${entry.pov}</td>
      <td>${entry.evicted}</td>
      <td>${entry.votes.join('<br>')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function declareWinner() {
  const [f1, f2] = houseguests;
  let juryVotes = [];
  for (let i = 0; i < 7; i++) {
    juryVotes.push(Math.random() < 0.5 ? f1.name : f2.name);
  }
  const f1Votes = juryVotes.filter(v => v === f1.name).length;
  const winner = f1Votes > 3 ? f1.name : f2.name;

  const status = document.getElementById('status-area');
  status.innerHTML = `
    <h2>Final Two: ${f1.name} vs ${f2.name}</h2>
    <p>Jury Votes: ${juryVotes.join(', ')}</p>
    <h2>🏆 Winner: ${winner}</h2>
  `;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo(arr) {
  let copy = [...arr];
  const first = pickRandom(copy);
  copy = copy.filter(p => p !== first);
  const second = pickRandom(copy);
  return [first, second];
}
