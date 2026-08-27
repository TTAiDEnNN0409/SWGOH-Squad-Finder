// SWGOH Squad Finder V2
// Backend communication contract

const SWGOH_API = {
  baseUrl: "",

  async getRoster(allyCode) {
    const cleanCode = String(allyCode || "").replace(/\D/g, "");

    if (!cleanCode) {
      throw new Error("Invalid Ally Code.");
    }

    const response = await fetch(
      `${this.baseUrl}/api/roster/${cleanCode}`
    );

    if (!response.ok) {
      throw new Error(
        `Roster request failed: ${response.status}`
      );
    }

    return await response.json();
  }
};

function normalizeRoster(data) {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.roster)) {
    return data.roster;
  }

  if (Array.isArray(data.rosterUnit)) {
    return data.rosterUnit;
  }

  if (Array.isArray(data.characters)) {
    return data.characters;
  }

  return [];
}
