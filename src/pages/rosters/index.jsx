import { useGetRostersQuery, useGetUsersQuery } from "../../api/api";
import { Content } from "../../components/layout";
import { find, groupBy, sortBy } from "lodash";
import {
  selectPlayersProjectedKeepers,
  useGetPlayersAllQuery,
} from "../../api/bfbApi";
import { useSelector } from "react-redux";
import { selectLeagueYear } from "../../api/selectors/leagueSelectors";
import { useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import PlayerList from "../../components/list-items/player-list";
import { createPortal } from "react-dom";
import { Button } from "../../components/buttons";

const RosterCard = ({ team }) => {
  const { data: rosters } = useGetRostersQuery();
  const { data: users } = useGetUsersQuery();
  const leagueYear = useSelector(selectLeagueYear);
  const { data: playersAll } = useGetPlayersAllQuery(leagueYear);
  const teamOwners = useSelector((state) =>
    selectPlayersProjectedKeepers(state, {
      playersAll,
      rosters,
      users,
    })
  );
  const [activePlayer, setActivePlayer] = useState(null);
  const [expanded, setExpanded] = useState(false);
  let keepers = team.projectedKeepers;
  let avgKeeperVal = team.projectedKeepers
    .reduce((acc, item, index, array) => {
      acc += item.value;
      if (index === array.length - 1) {
        return acc / array.length; // Calculate average on the last iteration
      }
      return acc;
    }, 0)
    .toFixed(0);

  let positionalGrouping = groupBy(keepers, "pos");
  return (
    <div className="p-3 mock-item" key={team.owner_id}>
      <div
        className="flex w-100 justify-between align-center"
        onClick={() => setExpanded(!expanded)}
      >
        <p className="light bold pb-1">{team.team_name}</p>
        {
          <div className="flex align-center">
            <h6 className="pr-1">Avg Keeper Val: {avgKeeperVal}</h6>
            <Icon
              path={expanded ? mdiChevronUp : mdiChevronDown}
              color="white"
              size={1}
            />
          </div>
        }
      </div>
      {expanded ? (
        <>
          <PlayerList
            className="flex flex-column"
            hidePagination
            playerList={team.players}
            onPlayerClick={(player) => {
              setActivePlayer(player);
            }}
          />

          {!!activePlayer &&
            createPortal(
              <div className="modal-overlay">
                <div className="modal bg-dark" style={{ paddingBottom: 12 }}>
                  <div
                    className="flex flex-column justify-between"
                    style={{ overflow: "auto" }}
                  >
                    <div>
                      <div className="flex justify-between align-center w-100  border-bottom">
                        <h3 className="pb-2" style={{ color: "white" }}>
                          {activePlayer.name}
                        </h3>
                        <h6 className="pb-1">
                          KTC Value: {activePlayer.value}
                        </h6>
                      </div>
                      <h5 className="pb-1 pt-1">Trade Candidate Teams</h5>
                      <div
                        className="flex flex-column"
                        style={{ overflow: "auto", height: 175 }}
                      >
                        {activePlayer.tradeCandidateTeams.map((ownerId) => {
                          let owner = find(teamOwners, { owner_id: ownerId });
                          let ownersKeepers = owner.projectedKeepers;
                          let positionalGrouping = groupBy(
                            ownersKeepers,
                            "pos"
                          );
                          let displayName = owner.team_name;
                          if (displayName) {
                            return (
                              <div className="flex align-end mb-2 justify-between">
                                <p className="pr-2 color-light" key={ownerId}>
                                  {displayName}
                                </p>
                                <div className="d-flex pt-1 ">
                                  {Object.keys(positionalGrouping)
                                    .sort()
                                    .map((pos, i) => (
                                      <div
                                        className={`${pos} p-1`}
                                        style={{
                                          borderRadius: 4,
                                          marginRight: 4,
                                        }}
                                        key={pos}
                                      >
                                        {" "}
                                        <p
                                          className={`bold dark md pr-${
                                            Object.keys(positionalGrouping)
                                              .length -
                                              1 ===
                                            i
                                              ? 0
                                              : 1
                                          }`}
                                        >{`${positionalGrouping[pos].length} ${pos} `}</p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    className="d-flex justify-end"
                    style={{
                      width: 100,
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                    }}
                  >
                    <Button
                      className="bg-gray button-sm flex justify-center align-center p-1 w-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setActivePlayer(null);
                      }}
                    >
                      <p className="sm dark bold">Close</p>
                    </Button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </>
      ) : (
        <div className="d-flex pt-1">
          {Object.keys(positionalGrouping)
            .sort()
            .map((pos, i) => (
              <div
                className={`${pos} p-1`}
                style={{ borderRadius: 4, marginRight: 4 }}
                key={pos}
              >
                {" "}
                <p
                  className={`bold dark md pr-${
                    Object.keys(positionalGrouping).length - 1 === i ? 0 : 1
                  }`}
                >{`${positionalGrouping[pos].length} ${pos} `}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const Rosters = (props) => {
  const { data: rosters, isLoading } = useGetRostersQuery();
  const { data: users } = useGetUsersQuery();
  const leagueYear = useSelector(selectLeagueYear);
  const { data: playersAll } = useGetPlayersAllQuery(leagueYear);
  const teamOwners = useSelector((state) =>
    selectPlayersProjectedKeepers(state, {
      playersAll,
      rosters,
      users,
    })
  );

  return (
    <Content dark isLoading={isLoading || !teamOwners}>
      <div className="home-body" style={{ padding: "0 16px" }}>
        <div className="flex flex-column">
          <h2>Projected Keepers</h2>
          <h6>Based on KTC</h6>
        </div>
        {teamOwners?.map((team, i) => {
          return <RosterCard team={team} key={i} />;
        })}
      </div>
    </Content>
  );
};

export default Rosters;
