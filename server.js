from flask import Flask, jsonify
from swgoh_comlink import SwgohComlink
import os

app = Flask(__name__)

COMLINK_URL = os.environ.get("COMLINK_URL")
ACCESS_KEY = os.environ.get("ACCESS_KEY")
SECRET_KEY = os.environ.get("SECRET_KEY")

comlink = SwgohComlink(
    url=COMLINK_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY
)

@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "service": "SWGOH Squad Finder API"
    })

@app.route("/api/roster/<ally_code>")
def roster(ally_code):
    try:
        ally_code = "".join(
            character for character in ally_code
            if character.isdigit()
        )

        if len(ally_code) != 9:
            return jsonify({
                "error": "Ally Code must contain 9 digits."
            }), 400

        player = comlink.get_player(
            allycode=int(ally_code)
        )

        roster_units = player.get("rosterUnit", [])

        roster = []

        for unit in roster_units:
            roster.append({
                "id": unit.get("definitionId", ""),
                "level": unit.get("currentLevel", 0),
                "stars": unit.get("currentRarity", 0),
                "gear": unit.get("currentTier", 0),
                "relic": unit.get("relic", {}).get("currentTier", 0)
            })

        return jsonify({
            "allyCode": ally_code,
            "name": player.get("name", "Unknown"),
            "roster": roster
        })

    except Exception as error:
        print("Comlink request failed:", repr(error))

        return jsonify({
            "error": "Unable to retrieve SWGOH roster",
            "message": str(error)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)
