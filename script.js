// Default cast now only includes names. Image URLs will be entered by the user.
const defaultCast = [
  { name: "Janelle" },
  { name: "Dan" },
  { name: "Rachel" },
  { name: "Will" },
  { name: "Da'Vonne" },
  { name: "Derrick" },
  { name: "Britney" },
  { name: "Tyler" }
];

let houseguests = [];
let week = 1;
let log = [];
let evictedPlayers = [];

// --- Event Listeners ---

document.getElementById('edit-cast-btn').addEventListener('click', () => {
  const modal = document.getElementById('cast-setup');
  modal.classList.toggle('hidden');
  const form = document.getElementById('custom-cast-form');
  form.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    // The 'name' value is pre-filled, but 'img' is left blank for user input.
    form.innerHTML += `
      <label>Player ${i + 1} Name: <input type="text" name="name-${i}" value="${defaultCast[i]?.name || ''}"></label>
      <label>Image URL: <input type="text" name="img-${i}" value="${defaultCast[i]?.img || ''}" placeholder="Enter image URL"></label><br><br>
    `;
  }
});

document.getElementById('start-game').addEventListener('click', () => {
  const form = document.getElementById('custom-cast-form');
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
    alert('Enter at least 4 players with names and image URLs.');
    return;
  }

  document.getElementById('cast-setup').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');
  renderPlayers();
  setTimeout(nextWeek, 1000); // Start the first week after a brief delay
});


// --- Game Logic Functions ---

function nextWeek() {
  if (houseguests.length <= 2) {
    declareWinner();
    return;
  }

  // 1. HOH Competition
  const hoh = pickRandom(houseguests);

  // 2. Nomination Ceremony
  const nominees = pickTwo(houseguests.filter(p => p !== hoh));

  // 3. Power of Veto Competition
  const pov = pickRandom(houseguests);
  let vetoUsed = Math.random() < 0.5; // 50% chance the veto is used
  let finalNominees = [...nominees];

  // Veto Meeting Logic
  if (vetoUsed) {
    const savedPlayerPool = nominees.filter(n => n === pov || !houseguests.some(h => h === pov));
    if (savedPlayerPool.length > 0) {
        const savedPlayer = pickRandom(savedPlayerPool);
        const replacementPool = houseguests.filter(p => p !== hoh && p !== pov && !nominees.includes(p));

        if (replacementPool.length > 0) {
            const newNom = pickRandom(replacementPool);
            finalNominees = nominees.filter(p => p !== savedPlayer);
            finalNominees.push(newNom);
        } else {
            vetoUsed = false; // Cannot use veto, no valid replacement
        }
    } else {
        vetoUsed = false;
    }
  }

  // 4. Eviction Vote
  const voters = houseguests.filter(p => p !== hoh && !finalNominees.includes(p));
  const votes = { [finalNominees[0].name]: 0, [finalNominees[1].name]: 0 };
  const voteLog = [];

  voters.forEach(voter => {
    const voteTarget = pickRandom(finalNominees); // Each voter randomly picks a nominee
    votes[voteTarget.name]++;
    voteLog.push(`${voter.name} → ${voteTarget.name}`);
  });

  let evicted;
  if (votes[finalNominees[0].name] > votes[finalNominees[1].name]) {
    evicted = finalNominees[0];
  } else if (votes[finalNominees[1].name] > votes[finalNominees[0].name]) {
    evicted = finalNominees[1];
  } else {
    evicted = pickRandom(finalNominees); // HOH breaks the tie
  }

  // 5. Update Game State
  log.push({
    week,
    hoh: hoh.name,
    noms: finalNominees.map(n => n.name).join(' & '),
    pov: pov.name + (vetoUsed ? '*' : ''), // Add asterisk if veto was used
    evicted: evicted.name,
    votes: voteLog
  });

  evictedPlayers.push(evicted);
  houseguests = houseguests.filter(p => p !== evicted);
  week++;

  // 6. Render Updates
  updateChart();
  renderPlayers();

  setTimeout(nextWeek, 2000); // Pause between weeks
}

function declareWinner() {
  const [f1, f2] = houseguests;
  // Form the jury from the last 7 players evicted
  const jury = evictedPlayers.slice(-7);
  
  if (jury.length === 0) {
      document.getElementById('status-area').innerHTML = `<h2>Not enough players to form a jury!</h2>`;
      return;
  }

  const votes = { [f1.name]: 0, [f2.name]: 0 };
  const juryVoteLog = [];

  jury.forEach(juror => {
    const vote = Math.random() < 0.5 ? f1 : f2; // Random juror vote
    votes[vote.name]++;
    juryVoteLog.push(`${juror.name} → ${vote.name}`);
  });

  const winner = votes[f1.name] > votes[f2.name] ? f1 : f2;
  const runnerUp = winner === f1 ? f2 : f1;

  const status = document.getElementById('status-area');
  document.getElementById('houseguests').innerHTML = ''; // Clear final players
  status.innerHTML = `
    <h2>Final Two: ${f1.name} & ${f2.name}</h2>
    <p><b>Jury (${jury.length} members):</b> ${jury.map(p => p.name).join(', ')}</p>
    <p><b>Final Vote:</b> ${winner.name} wins ${votes[winner.name]}–${votes[runnerUp.name]}</p>
    <br>
    <h2>🏆 Winner: ${winner.name}</h2>
  `;
}

// --- Rendering & Utility Functions ---

function renderPlayers() {
  const container = document.getElementById('houseguests');
  container.innerHTML = '';
  houseguests.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150?text=Invalid+URL'; this.onerror=null;">
      <p>${p.name}</p>
    `;
    container.appendChild(card);
  });
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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo(arr) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}
