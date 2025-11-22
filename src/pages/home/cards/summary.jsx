import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetUsersQuery } from "../../../api/api";
import { Avatar } from "../../../components/images";
import find from "lodash/find";
import "./cards.scss";
import { useGetStatsQuery, useGetPlayersAllQuery } from "../../../api/bfbApi";
import { IconButton } from "../../../components/buttons";
import { mdiRefresh } from "@mdi/js";

const SummaryCard = ({
  title,
  href,
  rosters,
  year,
  onActionClick,
  actionIsLoading,
}) => {
  const { data: stats } = useGetStatsQuery({ year }, { skip: !year });
  const { data: usersObj } = useGetUsersQuery();
  const { data: players, isLoading } = useGetPlayersAllQuery(
    { year },
    {
      skip: !year,
    }
  );
  const [data, setData] = useState();

  useEffect(() => {
    if (!rosters || !stats || isLoading || !usersObj) return;
    let testData = {};
    rosters.forEach((roster) => {
      roster.players?.forEach((player) => {
        let currentPlayer = find(players, { id: player });
        let playerStats = find(stats, { id: player });
        if (currentPlayer) {
          let obj = {
            name: `${currentPlayer.first_name.slice(0, 1)}. ${
              currentPlayer.last_name
            }`,
            team: currentPlayer.team,
            ppg: playerStats
              ? (playerStats.pts_half_ppr / playerStats.gms_active).toFixed(2)
              : "N/A",
            rank: playerStats?.pos_rank_half_ppr,
            avatar: find(usersObj, {
              user_id: roster.owner_id,
            }).avatar,
          };
          if (
            parseInt(obj.rank) === 1 &&
            ["K", "DEF"].indexOf(currentPlayer.position) === -1
          ) {
            testData[currentPlayer.position] = obj;
          }
        }
      });
    });
    setData(testData);
  }, [rosters, stats, players, usersObj]);

  return (
    <div className="summary">
      <Link className="w-100" style={{ textDecoration: "none" }} to={href}>
        <div
          className="flex justify-between w-100"
          style={{ marginBottom: 24 }}
        >
          <h3 className="w-100 lime">{title}</h3>
          {onActionClick && (
            <IconButton
              icon={mdiRefresh}
              title="Refresh"
              onClick={(e) => {
                e.preventDefault();
                onActionClick();
              }}
              iconColor={"#54d846"}
              isLoading={actionIsLoading}
            />
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr 1fr fr",
            gap: 16,
          }}
        >
          {data &&
            Object.keys(data).length > 0 &&
            !isLoading &&
            ["QB", "RB", "WR", "TE"].map((pos) => {
              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.5fr 1fr 0.5fr",
                    gap: 8,
                  }}
                  key={pos}
                >
                  <h2
                    className="flex w-100 justify-start"
                    style={{ margin: 0, color: "white" }}
                  >
                    {pos}
                  </h2>
                  <div className="flex flex-column">
                    <h5 className="flex justify-start align-center">
                      {data[pos].name}
                    </h5>
                    <h5>
                      <small>{data[pos].team}</small>
                    </h5>
                  </div>
                  <h5 className="flex align-center">{data[pos].ppg}ppg</h5>
                  <div className="flex w-100 justify-center align-center">
                    <Avatar size="md" avatarId={data[pos].avatar} />
                  </div>
                </div>
              );
            })}
        </div>
      </Link>
    </div>
  );
};

export default SummaryCard;
