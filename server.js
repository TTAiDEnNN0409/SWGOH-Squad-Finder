const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const COMLINK_URL = process.env.COMLINK_URL;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "SWGOH Squad Finder API"
  });
});

async function getPlayer(allyCode) {
  const response = await fetch(`${COMLINK_URL}/player`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access-key": ACCESS_KEY,
      "secret-key": SECRET_KEY
    },
    body: JSON.stringify({
      payload: {
        allyCode: Number(allyCode)
      }
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Comlink error ${response.status}: ${text}`
    );
  }

  return JSON.parse(text);
}

app.get("/api/roster/:allyCode", async (req, res) => {
  try {
    const allyCode = String(req.params.allyCode).replace(/\D/g, "");

    if (!allyCode) {
      return res.status(400).json({
        error: "Invalid Ally Code"
      });
    }

    const player = await getPlayer(allyCode);

    const roster = (player.rosterUnit || []).map(unit => ({
      id: unit.definitionId,
      level: unit.currentLevel || 0,
      stars: unit.currentRarity || 0,
      gear: unit.currentTier || 0,
      relic: unit.relic?.currentTier || 0,
      gp: unit.gp || 0
    }));

    res.json({
      allyCode,
      name: player.name || "Unknown",
      roster
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve SWGOH roster",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`SWGOH Squad Finder API running on port ${PORT}`);
});
