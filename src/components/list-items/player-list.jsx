import { Button } from "../buttons";
import playersArr from "../../sleeper/playersArray.json";
import { useSelector } from "react-redux";
import { selectActiveSlot, selectDraftedPlayers } from "../../api/draftSlice";
import { find } from "lodash";

const PlayerList = ({
  players = [],
  scrollHeight = "60dvh",
  onDraft,
  page,
  setPage,
}) => {
  const activeSlot = useSelector(selectActiveSlot);
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
          height: `calc(${scrollHeight} - 136px)`,
        }}
      >
        {filteredPlayers?.map((player) => (
          <div
            className="p-1 align-center"
            style={{
              display: "grid",
              gridTemplateColumns: "0.5fr 1fr 0.5fr 0.5fr",
              gap: 8,
            }}
            key={`${player.first_name}_${player.last_name}`}
          >
            <Button
              style={{
                borderColor:
                  !activeSlot || Object.keys(activeSlot).length === 0
                    ? "rgb(206, 206, 206)"
                    : "#54d846",
                height: 32,
              }}
              className={
                !activeSlot || Object.keys(activeSlot).length === 0
                  ? "bg-gray p-1"
                  : "bg-lime p-1"
              }
              onClick={() =>
                !(!activeSlot || Object.keys(activeSlot).length === 0) &&
                onDraft(player)
              }
              disabled={!activeSlot || Object.keys(activeSlot).length === 0}
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
            <p className="light">{player.pos_rank_half_ppr}</p>
            <p className="light">{parseFloat(player.ppg).toFixed(2)}</p>
          </div>
        ))}
        <div className="flex align-center justify-center w-100 p-2">
          <div style={{ width: 50 }}>
            <Button
              className="button-sm"
              active
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </Button>
          </div>
          <p className="light" style={{ margin: "0 8px" }}>
            Page: {page}
          </p>
          <div style={{ width: 50 }}>
            <Button
              className="button-sm"
              active
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
export default PlayerList;
