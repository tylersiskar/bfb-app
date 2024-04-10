import { Button } from "../buttons";
import playersArr from "../../sleeper/playersArray.json";
import { useSelector } from "react-redux";
import { selectDraftedPlayers } from "../../api/draftSlice";
import { find } from "lodash";

const PlayerList = ({
  players = [
    {
      first_name: "Malik",
      last_name: "Nabers",
      position: "WR",
      team: "BUF",
    },
    {
      first_name: "Marvin",
      last_name: "Harrison Jr.",
      position: "WR",
      team: "ARI",
    },
    {
      first_name: "Trey",
      last_name: "Benson",
      position: "RB",
      team: "NE",
    },
    {
      first_name: "Caleb",
      last_name: "Williams",
      position: "QB",
      team: "CHI",
    },
    {
      first_name: "Brock",
      last_name: "Bowers",
      position: "TE",
      team: "NYJ",
    },
    {
      first_name: "Rome",
      last_name: "Odunze",
      position: "WR",
      team: "NYG",
    },
    {
      first_name: "Brian",
      last_name: "Thomas Jr.",
      position: "WR",
      team: "TEN",
    },
  ],
  scrollHeight = "50vh",
  onDraft,
}) => {
  const draftedPlayers = useSelector(selectDraftedPlayers);
  let filteredPlayers = players.filter(
    (player) =>
      !find(draftedPlayers, {
        first_name: player.first_name,
        last_name: player.last_name,
      })
  );

  return (
    <>
      <div
        className="p-2 align-center"
        style={{
          display: "grid",
          gridTemplateColumns: "0.5fr 1fr 0.5fr 0.5fr",
          gap: 8,
        }}
      >
        <div />
        <div className="flex justify-start">
          <p className="light bold sm">Player</p>
        </div>
        <div className="flex justify-start">
          {" "}
          <p className="light bold sm">Pos Rk</p>
        </div>
        <div className="flex justify-start">
          {" "}
          <p className="light bold sm">PPG</p>
        </div>
      </div>
      <div
        style={{
          overflow: "auto",
          height: `calc(${scrollHeight} - 120px)`,
        }}
      >
        {filteredPlayers?.map((player) => (
          <div
            className="p-2 align-center"
            style={{
              display: "grid",
              gridTemplateColumns: "0.5fr 1fr 0.5fr 0.5fr",
              gap: 8,
            }}
            key={`${player.first_name}_${player.last_name}`}
          >
            <Button
              style={{ borderColor: "#54d846", height: 32 }}
              className="bg-lime p-1"
              onClick={() => onDraft(player)}
            >
              <p className="sm dark bold">DRAFT</p>
            </Button>
            <div className="flex justify-start">
              <div className="flex flex-column justify-center align-start">
                <p className="x-sm light bold">{player.first_name}</p>
                <p className="sm light bold">{player.last_name}</p>
                <p className="x-sm light">
                  {player.position} - {player.team}
                </p>
              </div>
            </div>
            <p className="light">N/A</p>
            <p className="light">N/A</p>
          </div>
        ))}
      </div>
    </>
  );
};
export default PlayerList;
