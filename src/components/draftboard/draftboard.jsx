import find from "lodash/find";
import DraftSlotCard from "./draft-slot-card";
import "./draftboard.scss";

const Draftboard = ({
  onSelectPick,
  selectedPick,
  draftedPlayers,
  draftOrderWithTrades,
  rounds = 8,
  width,
}) => {
  let isHome = rounds === 1;
  let drafted = isHome ? [] : draftedPlayers;
  return (
    <div className={width ? "draftboard w-100" : "draftboard"}>
      {draftOrderWithTrades.map((round, roundIdx) => {
        if (roundIdx > rounds - 1) return;
        return (
          <div
            className="flex flex-column bg-dark"
            key={roundIdx}
            id={`round_${roundIdx + 1}`}
          >
            <p className="sm color-light pb-1">Round {roundIdx + 1}</p>
            <div className={isHome ? "round" + " round-home" : "round"}>
              {round.map((pick, pickIdx) => {
                let draftedPlayer = find(drafted, {
                  pick: pick.pick,
                  round: pick.round,
                });
                return (
                  <DraftSlotCard
                    key={pick.pick}
                    onSelect={(pick) =>
                      onSelectPick && onSelectPick(pick, roundIdx, pickIdx)
                    }
                    selectedPick={selectedPick}
                    draftSlot={{
                      ...pick,
                      player: draftedPlayer,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Draftboard;
