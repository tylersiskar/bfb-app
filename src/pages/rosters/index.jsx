import { useGetRostersQuery, useGetUsersQuery } from "../../api/api";
import { Content } from "../../components/layout";
import { find, groupBy, sortBy } from "lodash";
import { useGetPlayersAllQuery } from "../../api/bfbApi";
import { useSelector } from "react-redux";
import { selectLeagueYear } from "../../api/selectors/leagueSelectors";
import { useMemo, useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronUp } from "@mdi/js";
import PlayerList from "../../components/list-items/player-list";

const RosterCard = ({ team }) => {
  const [expanded, setExpanded] = useState(false);
  let keepers = team.players.slice(0, 8);
  let nonKeepers = team.players.slice(9, 16);
  let positionalGrouping = groupBy(keepers, "pos");
  return (
    <div
      className="p-3 mock-item"
      key={team.owner_id}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex w-100 justify-between">
        <p className="light bold pb-1">{team.team_name}</p>
        <Icon
          path={expanded ? mdiChevronUp : mdiChevronDown}
          color="white"
          size={1}
        />
      </div>
      {expanded ? (
        <PlayerList
          className="flex flex-column"
          hidePagination
          playerList={team.players}
        />
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

const Rosters = ({ ...props }) => {
  const { data: rosters, isLoading } = useGetRostersQuery();
  const { data: users } = useGetUsersQuery();
  const leagueYear = useSelector(selectLeagueYear);
  const { data: playersAll } = useGetPlayersAllQuery(leagueYear);
  let teamOwners = useMemo(() => {
    return rosters?.map((r) => {
      let sortedPlayers = sortBy(
        r.players
          .map((pId) => {
            let currentPlayer = find(playersAll, { id: pId });
            return {
              ...currentPlayer,
              name: currentPlayer?.full_name,
              pos: currentPlayer?.position,
              value: currentPlayer?.value,
            };
          })
          .filter((o) => !!o.name),
        "value"
      )
        .reverse()
        .map((player, i) => ({ ...player, status: i < 8 ? "Keeper" : "N/A" }));
      return {
        ...r,
        team_name: find(users, { user_id: r.owner_id })?.display_name,
        players: sortedPlayers,
      };
    });
  }, [rosters]);

  return (
    <Content dark isLoading={isLoading}>
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
