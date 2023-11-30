import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetStatsQuery } from "../../../api/api";
import players from "../../../sleeper/players.json";
import usersObj from "../../../sleeper/users.json";
import { Avatar } from "../../../components/images";
import { find } from "lodash";
import "./cards.scss";

const SummaryCard = ({ title, href, rosters }) => {
  const { data: stats } = useGetStatsQuery("2023");
  const [data, setData] = useState();

  useEffect(() => {
    if (!rosters || !stats) return;
    let testData = {};
    rosters.forEach((roster) => {
      roster.players.forEach((player) => {
        let obj = {
          name: `${players[player].first_name.slice(0, 1)}. ${
            players[player].last_name
          }`,
          team: players[player].team,
          ppg: (stats[player].pts_half_ppr / stats[player].gp).toFixed(2),
          rank: stats[player].pos_rank_half_ppr,
          avatar: find(usersObj, {
            user_id: roster.owner_id,
          }).avatar,
        };
        if (
          obj.rank === 1 &&
          ["K", "DEF"].indexOf(players[player].position) === -1
        )
          testData[players[player].position] = obj;
      });
    });
    setData(testData);
  }, [rosters, stats]);

  return (
    <div className="summary">
      <Link className="w-100" style={{ textDecoration: "none" }} to={href}>
        <h3 className="lime" style={{ paddingBottom: 24 }}>
          {title}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr 1fr fr",
            gap: 16,
          }}
        >
          {data &&
            ["QB", "RB", "WR", "TE"].map((pos) => {
              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.5fr 1fr 0.5fr",
                    gap: 8,
                  }}
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
