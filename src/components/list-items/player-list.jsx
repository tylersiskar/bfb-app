import { Button } from "../buttons";
import { useSelector } from "react-redux";
import { selectActiveSlot } from "../../api/draftSlice";
import { useEffect, useState } from "react";

const PlayerList = ({
  scrollHeight = `calc(40svh - 136px)`,
  onDraft,
  hidePagination,
  actionColumn,
  playerList,
  playerValueIsFetching,
  isRoster,
}) => {
  const activeSlot = useSelector(selectActiveSlot);
  // const [finalArray, setFinalArray] = useState(
  // );
  const [page, setPage] = useState(0);

  // useEffect(() => {
  //   if (!isRoster) setFinalArray(_convertToPaginatedArray(playerList));
  // }, [playerList]);

  const _convertToPaginatedArray = (arr) => {
    if (!arr || arr.length === 0) return [];
    let finalArr = [];
    const chunkSize = 25;
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      finalArr.push(chunk);
    }
    return finalArr;
  };

  const splitFullName = (player) => {
    return { ...player, pos: player.position };
    // return {
    //   first_name: player["PLAYER NAME"].split(" ")[0],
    //   last_name: player["PLAYER NAME"].split(" ").splice(1, 1).join(" "),
    //   pos: player.POS,
    //   team: player.TEAM,
    // };
  };

  let finalArray = _convertToPaginatedArray(playerList);
  let activePlayerList = isRoster ? playerList : finalArray[page];

  return (
    <>
      <div
        className="p-1 align-center"
        style={{
          display: "grid",
          gridTemplateColumns: "0.5fr 1fr 0.5fr 0.5fr 0.5fr",
          gap: 8,
        }}
      >
        <div className="flex justify-start">
          <p className="light bold sm">Status</p>
        </div>
        <div className="flex justify-start">
          <p className="light bold sm">Player</p>
        </div>
        <div className="flex justify-start">
          {" "}
          <p className="light bold sm">Pos</p>
        </div>
        <div className="flex justify-start">
          {" "}
          <p className="light bold sm">Team</p>
        </div>
        {!isRoster && (
          <div className="flex flex-column justify-start align-start">
            {" "}
            <p className="light bold sm">Value</p>
          </div>
        )}
      </div>
      <div
        style={{
          overflow: "auto",
          height: scrollHeight,
          transition: "height 0.350s ease",
        }}
      >
        {activePlayerList?.map((playerObj) => {
          let player = isRoster ? playerObj : splitFullName(playerObj);
          let isDisabled =
            !activeSlot ||
            Object.keys(activeSlot).length === 0 ||
            playerValueIsFetching;
          return (
            <div
              className="p-1 align-center"
              style={{
                display: "grid",
                gridTemplateColumns: "0.5fr 1fr 0.5fr 0.5fr 0.5fr",
                gap: 8,
              }}
              key={`${player.first_name}_${player.last_name}`}
            >
              {onDraft ? (
                <Button
                  style={{
                    borderColor: isDisabled ? "rgb(206, 206, 206)" : "#54d846",
                    height: 32,
                  }}
                  className={isDisabled ? "bg-gray p-1" : "bg-lime p-1"}
                  onClick={() => !isDisabled && onDraft(player)}
                  disabled={isDisabled}
                >
                  <p className="sm dark bold">DRAFT</p>
                </Button>
              ) : actionColumn ? (
                actionColumn(player)
              ) : (
                <div />
              )}
              <div className="flex justify-start align-center">
                <div className="flex flex-column justify-center align-start">
                  <p className="sm light">{player.first_name}</p>
                  <p className="sm light bold">{player.last_name}</p>
                  {/* <p className="x-sm light">
                    {player.pos} - {player.team}
                  </p> */}
                </div>
              </div>
              <p className="md light flex justify-start">
                {player.pos ?? player.position}
              </p>
              <p className="md light flex justify-start">{player.team}</p>
              {/* <p className="light">{parseFloat(player.ppg).toFixed(2)}</p> */}
              {!isRoster && (
                <p className="md light flex justify-start">
                  {playerObj["Normalized Rank"] ?? playerObj["value"]}
                </p>
              )}
            </div>
          );
        })}
        {!hidePagination && (
          <div className="flex align-center justify-center w-100 p-2">
            <div style={{ width: 50 }}>
              <Button
                className="button-sm"
                active
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Prev
              </Button>
            </div>
            <p className="light" style={{ margin: "0 8px" }}>
              Page: {page + 1}
            </p>
            <div style={{ width: 50 }}>
              <Button
                className="button-sm"
                active
                onClick={() => setPage(page + 1)}
                disabled={page === finalArray.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default PlayerList;
