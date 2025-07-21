// --- Houseguest Data ---
let houseguests = [];
let week = 1;
let log = [];
let evictedPlayers = [];

// Initialize form
const form = document.getElementById('custom-cast-form');
for (let i = 0; i < 16; i++) {
  form.innerHTML += `
    <label>Player ${i+1} Name: <input type="text" name="name-${i}" required></label>
    <label>Image URL: <input type="text" name="img-${i}" required></label><br><br>
  `;
}

// Start Game
document.getElementById('start-game').addEventListener('click', () => {
  const inputs = form.querySelectorAll('input');
  houseguests = [];
  for (let i = 0; i < inputs.length; i += 2) {
    const name = inputs[i].value.trim();
    const img = inputs[i + 1].value.trim();
    if (name && img) houseguests.push({ name, img });
  }
  if (houseguests.length < 4) return alert('Enter at least 4 players.');
  document.getElementById('cast-setup').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');
  renderPlayers();
  nextWeek();
});

function renderPlayers() {
  const container = document.getElementById('houseguests');
  container.innerHTML = '';
  houseguests.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${p.img}" alt="${p.name}"><p>${p.name}</p>`;
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
  log.push({ week, hoh: hoh.name, noms: nominees.map(n => n.name), pov: pov.name, evicted: evicted.name, votes: voteLog });
  evictedPlayers.push(evicted);
  houseguests = houseguests.filter(p => p !== evicted);
  week++;
  renderPlayers();
  generateVotingChart(log);
  setTimeout(nextWeek, 1500);
}

function declareWinner() {
  const [f1, f2] = houseguests;
  let juryVotes = [];
  for (let i = 0; i < 7; i++) juryVotes.push(Math.random() < 0.5 ? f1.name : f2.name);
  const f1Votes = juryVotes.filter(v => v === f1.name).length;
  const winner = f1Votes > 3 ? f1.name : f2.name;
  document.getElementById('status-area').innerHTML = `<h2>Final Two: ${f1.name} vs ${f2.name}</h2><p>Jury Votes: ${juryVotes.join(', ')}</p><h2>🏆 Winner: ${winner}</h2>`;
  generateVotingChart(log, winner, f1.name === winner ? f2.name : f1.name);
}

function generateVotingChart(gameLog, winnerName = '', runnerUpName = '') {
  const header = document.getElementById('week-header');
  const tbody = document.getElementById('history-body');
  header.innerHTML = '<th>Houseguest</th>';
  for (let i = 1; i <= gameLog.length; i++) {
    const th = document.createElement('th');
    th.textContent = `Week ${i}`;
    header.appendChild(th);
  }
  const finaleTh = document.createElement('th');
  finaleTh.textContent = 'Finale';
  header.appendChild(finaleTh);

  const players = [...new Set(gameLog.flatMap(e => [e.hoh, ...e.noms, e.pov, e.evicted]))];
  tbody.innerHTML = '';
  players.forEach(player => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = player;
    tr.appendChild(td);
    gameLog.forEach(week => {
      const cell = document.createElement('td');
      let labels = [];
      if (week.hoh === player) {
        cell.classList.add('hoh');
        labels.push('HoH');
      }
      if (week.noms.includes(player)) {
        cell.classList.add('nom');
        labels.push('Nom');
      }
      if (week.evicted === player) {
        cell.classList.add('evicted');
        labels.push('Evicted');
      }
      cell.textContent = labels.join(' + ');
      tr.appendChild(cell);
    });
    const finale = document.createElement('td');
    if (player === winnerName) {
      finale.classList.add('winner');
      finale.textContent = 'Winner';
    } else if (player === runnerUpName) {
      finale.classList.add('runner-up');
      finale.textContent = 'Runner-up';
    }
    tr.appendChild(finale);
    tbody.appendChild(tr);
  });
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
