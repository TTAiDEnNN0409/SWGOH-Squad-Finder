const API_URL = "https://swgoh-squad-finder-api.onrender.com";

async function loadRealRoster(allyCode) {
  const response = await fetch(
    `${API_URL}/api/roster/${allyCode}`
  );

  if (!response.ok) {
    throw new Error("Could not load SWGOH roster.");
  }

  return await response.json();
}

const teams = [
  {
    name: "Empire Control",
    leader: "Emperor Palpatine",
    chars: [
      "Emperor Palpatine",
      "Darth Vader",
      "Mara Jade",
      "Grand Admiral Thrawn",
      "Royal Guard"
    ],
    score: 94,
    modes: ["gac", "tw"],
    reason: "Strong control and turn-meter manipulation."
  },
  {
    name: "Jedi Revan",
    leader: "Jedi Knight Revan",
    chars: [
      "Jedi Knight Revan",
      "Bastila Shan",
      "Jolee Bindo",
      "Grand Master Yoda",
      "General Kenobi"
    ],
    score: 91,
    modes: ["gac", "pve"],
    reason: "Reliable Jedi team with healing and assists."
  },
  {
    name: "Palpatine Empire",
    leader: "Emperor Palpatine",
    chars: [
      "Emperor Palpatine",
      "Darth Vader",
      "Grand Admiral Thrawn",
      "Mara Jade",
      "Stormtrooper"
    ],
    score: 88,
    modes: ["gac", "pve"],
    reason: "Flexible Empire team."
  },
  {
    name: "Phoenix",
    leader: "Hera Syndulla",
    chars: [
      "Hera Syndulla",
      "Captain Rex",
      "Kanan Jarrus",
      "Zeb Orrelios",
      "Chopper"
    ],
    score: 86,
    modes: ["pve", "tw"],
    reason: "Strong Phoenix synergy."
  }
];

const demoRoster = [
  "Darth Vader",
  "Emperor Palpatine",
  "Mara Jade",
  "Grand Admiral Thrawn",
  "Royal Guard",
  "Jedi Knight Revan",
  "Bastila Shan",
  "Jolee Bindo",
  "Grand Master Yoda",
  "General Kenobi"
];

let roster = [];

function normalize(name) {
  return name.trim().toLowerCase();
}

function analyze() {
  const filter = document.getElementById("filter").value;

  const availableTeams = teams.filter(team => {
    return filter === "all" || team.modes.includes(filter);
  });

  const results = availableTeams.map(team => {
    const owned = team.chars.filter(character =>
      roster.map(normalize).includes(normalize(character))
    );

    const missing = team.chars.filter(character =>
      !roster.map(normalize).includes(normalize(character))
    );

    return {
      ...team,
      owned,
      missing,
      percent: Math.round((owned.length / team.chars.length) * 100)
    };
  });

  results.sort((a, b) => b.percent - a.percent);

  const complete = results.filter(team => team.percent === 100);
  const almost = results.filter(
    team => team.percent >= 60 && team.percent < 100
  );

  displayTeams("squadGrid", complete);
  displayTeams("almostGrid", almost);

  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
}

function displayTeams(elementId, teamsToDisplay) {
  const container = document.getElementById(elementId);

  if (teamsToDisplay.length === 0) {
    container.innerHTML =
      '<div class="panel"><p>No teams found.</p></div>';
    return;
  }

  container.innerHTML = teamsToDisplay.map(team => `
    <div class="card">
      <div class="card-top">
        <div>
          <p class="eyebrow">${team.leader}</p>
          <h3>${team.name}</h3>
        </div>
        <div class="score">${team.percent}%</div>
      </div>

      <div class="bar">
        <i style="width:${team.percent}%"></i>
      </div>

      <div class="chars">
        ${team.chars.map(character => `
          <span class="chip">${character}</span>
        `).join("")}
      </div>

      ${
        team.missing.length
          ? `<p class="missing">Missing: ${team.missing.join(", ")}</p>`
          : `<p class="meta">All 5 characters owned ✓</p>`
      }

      <p class="meta">${team.reason}</p>
    </div>
  `).join("");
}

function loadDemo() {
  roster = [...demoRoster];

  analyze();

  alert("Demo roster loaded!");
}

function analyzeManualRoster() {
  const text = document.getElementById("rosterInput").value;

  roster = text
    .split("\n")
    .map(line => line.split(",")[0].trim())
    .filter(Boolean);

  analyze();
}

function clearRoster() {
  document.getElementById("rosterInput").value = "";

  roster = [];

  document.getElementById("results").classList.add("hidden");
  document.getElementById("emptyState").classList.remove("hidden");
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => {

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    document.querySelectorAll(".view").forEach(view => {
      view.classList.remove("active");
    });

    button.classList.add("active");

    document
      .getElementById(button.dataset.view)
      .classList.add("active");
  });
});

document.getElementById("demoBtn").addEventListener(
  "click",
  loadDemo
);

document.getElementById("saveRoster").addEventListener(
  "click",
  analyzeManualRoster
);

document.getElementById("clearRoster").addEventListener(
  "click",
  clearRoster
);

document.getElementById("filter").addEventListener(
  "change",
  analyze
);

document.getElementById("loadAllyCode").addEventListener(
  "click",
  async () => {
    const input = document.getElementById("allyCodeInput");
    const status = document.getElementById("rosterStatus");

    const allyCode = input.value.replace(/\D/g, "");

    if (!allyCode) {
      status.textContent = "Please enter your Ally Code.";
      return;
    }

    status.textContent = "Loading your SWGOH roster...";

    try {
      const data = await loadRealRoster(allyCode);

      roster = data.roster.map(character => character.id);

      status.textContent =
        `Loaded ${roster.length} characters from ${data.name}'s roster.`;

      analyze();

    } catch (error) {
      console.error(error);

      status.textContent =
        "Could not load your roster. Check your Ally Code and try again.";
    }
  }
);
