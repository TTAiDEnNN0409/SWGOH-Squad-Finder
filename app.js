// SWGOH Squad Finder V2
// Frontend application logic

const API_BASE = "";

const DEMO_ROSTER = [
  { name: "Commander Luke Skywalker", relic: 7, gear: 13, stars: 7 },
  { name: "Han Solo", relic: 7, gear: 13, stars: 7 },
  { name: "Chewbacca", relic: 7, gear: 13, stars: 7 },
  { name: "Threepio & Chewie", relic: 7, gear: 13, stars: 7 },
  { name: "C-3PO", relic: 5, gear: 13, stars: 7 },

  { name: "Jedi Knight Revan", relic: 7, gear: 13, stars: 7 },
  { name: "Jolee Bindo", relic: 5, gear: 13, stars: 7 },
  { name: "Bastila Shan", relic: 5, gear: 13, stars: 7 },
  { name: "Grand Master Yoda", relic: 5, gear: 13, stars: 7 },
  { name: "General Kenobi", relic: 5, gear: 13, stars: 7 },

  { name: "Darth Revan", relic: 7, gear: 13, stars: 7 },
  { name: "Darth Malak", relic: 7, gear: 13, stars: 7 },
  { name: "Bastila Shan (Fallen)", relic: 5, gear: 13, stars: 7 },
  { name: "HK-47", relic: 5, gear: 13, stars: 7 },
  { name: "Sith Empire Trooper", relic: 5, gear: 13, stars: 7 },

  { name: "Padmé Amidala", relic: 5, gear: 13, stars: 7 },
  { name: "General Anakin Skywalker", relic: 7, gear: 13, stars: 7 },
  { name: "Ahsoka Tano", relic: 5, gear: 13, stars: 7 },
  { name: "Grand Master Kenobi", relic: 7, gear: 13, stars: 7 },
  { name: "Shaak Ti", relic: 5, gear: 13, stars: 7 }
];

const SQUADS = [
  {
    name: "Commander Luke Skywalker",
    members: [
      "Commander Luke Skywalker",
      "Han Solo",
      "Chewbacca",
      "Threepio & Chewie",
      "C-3PO"
    ]
  },
  {
    name: "Jedi Knight Revan",
    members: [
      "Jedi Knight Revan",
      "Jolee Bindo",
      "Bastila Shan",
      "Grand Master Yoda",
      "General Kenobi"
    ]
  },
  {
    name: "Darth Revan",
    members: [
      "Darth Revan",
      "Darth Malak",
      "Bastila Shan (Fallen)",
      "HK-47",
      "Sith Empire Trooper"
    ]
  },
  {
    name: "Padmé Galactic Republic",
    members: [
      "Padmé Amidala",
      "General Anakin Skywalker",
      "Ahsoka Tano",
      "Grand Master Kenobi",
      "Shaak Ti"
    ]
  }
];

function findElement(...selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

function normalizeAllyCode(value) {
  return String(value || "").replace(/\D/g, "");
}

function setStatus(message, type = "") {
  const status = findElement(
    "#status",
    "#importStatus",
    ".status",
    "[data-status]"
  );

  if (!status) return;

  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function getRosterNames(roster) {
  return new Set(
    roster
      .map(character => character.name)
      .filter(Boolean)
      .map(name => name.toLowerCase())
  );
}

function calculateSquadScore(squad, roster) {
  const owned = getRosterNames(roster);

  const available = squad.members.filter(member =>
    owned.has(member.toLowerCase())
  );

  return {
    available,
    missing: squad.members.filter(
      member => !owned.has(member.toLowerCase())
    ),
    score: Math.round((available.length / squad.members.length) * 100)
  };
}

function generateRecommendations(roster) {
  return SQUADS
    .map(squad => ({
      ...squad,
      ...calculateSquadScore(squad, roster)
    }))
    .sort((a, b) => b.score - a.score);
}

function renderRecommendations(recommendations) {
  const container = findElement(
    "#recommendations",
    "#squadResults",
    ".recommendations",
    "[data-recommendations]"
  );

  if (!container) return;

  container.innerHTML = "";

  recommendations.forEach(squad => {
    const card = document.createElement("div");
    card.className = "squad-card";

    const members = squad.members
      .map(member => {
        const owned = squad.available.includes(member);
        return `<li class="${owned ? "owned" : "missing"}">
          ${owned ? "✓" : "○"} ${member}
        </li>`;
      })
      .join("");

    card.innerHTML = `
      <h3>${squad.name}</h3>
      <div class="squad-score">${squad.score}% available</div>
      <ul>${members}</ul>
      ${
        squad.missing.length
          ? `<p>Missing: ${squad.missing.join(", ")}</p>`
          : `<p>✓ You can build this squad!</p>`
      }
    `;

    container.appendChild(card);
  });
}

function renderStats(roster) {
  const statsContainer = findElement(
    "#stats",
    "#rosterStats",
    ".stats",
    "[data-stats]"
  );

  if (!statsContainer) return;

  const characterCount = roster.length;
  const sevenStar = roster.filter(c => Number(c.stars) >= 7).length;
  const relics = roster.filter(c => Number(c.relic) > 0).length;

  statsContainer.innerHTML = `
    <div>
      <strong>${characterCount}</strong>
      <span>Characters</span>
    </div>
    <div>
      <strong>${sevenStar}</strong>
      <span>7★ Characters</span>
    </div>
    <div>
      <strong>${relics}</strong>
      <span>Relic Characters</span>
    </div>
  `;
}

function showRoster(roster) {
  renderStats(roster);

  const recommendations = generateRecommendations(roster);
  renderRecommendations(recommendations);

  setStatus(
    `Loaded ${roster.length} characters. Recommendations generated.`,
    "success"
  );
}

async function loadRoster() {
  const input = findElement(
    "#allyCode",
    "#allycode",
    "#allyCodeInput",
    "input[name='allyCode']"
  );

  const allyCode = normalizeAllyCode(input?.value);

  if (!allyCode) {
    setStatus("Please enter an Ally Code.", "error");
    return;
  }

  setStatus("Loading roster...", "loading");

  try {
    const response = await fetch(
      `${API_BASE}/api/roster/${allyCode}`
    );

    if (!response.ok) {
      throw new Error("Roster API returned an error.");
    }

    const data = await response.json();

    const roster =
      data.roster ||
      data.rosterUnit ||
      data.characters ||
      [];

    if (!Array.isArray(roster) || roster.length === 0) {
      throw new Error("No roster data was returned.");
    }

    showRoster(roster);
  } catch (error) {
    console.error(error);

    setStatus(
      "The live roster service isn't connected yet. You can use Demo Mode for now.",
      "error"
    );
  }
}

function loadDemo() {
  showRoster(DEMO_ROSTER);
  setStatus(
    "Demo roster loaded. These recommendations are examples.",
    "success"
  );
}

function setup() {
  const loadButton = findElement(
    "#loadRoster",
    "#importRoster",
    "#searchButton",
    "#searchBtn",
    "[data-action='load']"
  );

  const demoButton = findElement(
    "#demo",
    "#demoMode",
    "#demoButton",
    "[data-action='demo']"
  );

  if (loadButton) {
    loadButton.addEventListener("click", loadRoster);
  }

  if (demoButton) {
    demoButton.addEventListener("click", loadDemo);
  }

  const input = findElement(
    "#allyCode",
    "#allycode",
    "#allyCodeInput",
    "input[name='allyCode']"
  );

  if (input) {
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        loadRoster();
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}
