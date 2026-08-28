const express = require("express");
const ComlinkStub = require("@swgoh-utils/comlink");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const comlink = new ComlinkStub({
  url: process.env.COMLINK_URL,
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "SWGOH Squad Finder API"
  });
});

app.get("/api/roster/:allyCode", async (req, res) => {
  try {
    const allyCode = req.params.allyCode.replace(/\D/g, "");

    if (allyCode.length !== 9) {
      return res.status(400).json({
        error: "Ally Code must contain 9 digits."
      });
    }

    console.log(`Requesting roster for Ally Code ${allyCode}`);

    const player = await comlink.getPlayer({
      allyCode: Number(allyCode)
    });

    const roster = (player.rosterUnit || []).map(unit => ({
      id: unit.definitionId,
      level: unit.currentLevel || 0,
      stars: unit.currentRarity || 0,
      gear: unit.currentTier || 0,
      relic: unit.relic?.currentTier || 0
    }));

    res.json({
      allyCode,
      name: player.name || "Unknown",
      roster
    });

  } catch (error) {
    console.error("Comlink request failed:", error);

    res.status(500).json({
      error: "Unable to retrieve SWGOH roster",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`SWGOH Squad Finder API running on port ${PORT}`);
});
