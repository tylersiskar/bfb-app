import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import Button from "../../components/buttons/button";
import { Content } from "../../components/layout";
import { useGetRostersQuery, useGetUsersQuery } from "../../api/api";
import { find } from "lodash";
import { useGetStatsQuery, useGetPlayersAllQuery } from "../../api/bfbApi";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLeagueId,
  selectLeagueStage,
  selectLeagueYear,
} from "../../api/selectors/leagueSelectors";
import { fetchLeagues } from "../../api/leagueSlice";

let colors = [
  "#bb17bd",
  "#5bce7a",
  "#923871",
  "#7683ae",
  "#f35caa",
  "#cb413d",
  "#bfabd0",
  "#6960aa",
  "#cf9a4f",
  "#2c708c",
  "#a3c592",
  "cyan",
];
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const TeamsPage = () => {
  const dispatch = useDispatch();
  const [datasets, setDatasets] = useState([]);
  const [position, setPosition] = useState();
  const leagueYear = useSelector(selectLeagueYear);
  const leagueId = useSelector(selectLeagueId);
  const leagueStatus = useSelector(selectLeagueStage);
  let statsYear = leagueStatus === "pre_draft" ? leagueYear - 1 : leagueYear;
  const { data: stats, isLoading } = useGetStatsQuery({ year: statsYear });
  const { data: leagueObject, isLoading: isRosterLoading } =
    useGetRostersQuery();
  const { data: usersObj } = useGetUsersQuery();
  const { data: players } = useGetPlayersAllQuery(statsYear);

  const fetchPlayers = (pos) => {
    if (!usersObj) return;
    let league = [];
    let users = {};
    usersObj.forEach((user) => {
      users[user.user_id] = user.display_name;
    });
    leagueObject &&
      leagueObject.forEach((team) => {
        let teamName = users[team.owner_id];
        let teamPlayers = team.players.map((player) => {
          let currentPlayer = find(players, { id: player });
          if (currentPlayer) {
            let currentStat = find(stats, { player_id: player });
            return {
              name: currentPlayer.full_name,
              position: currentPlayer.position,
              pts: currentStat ? currentStat.pts_half_ppr : 0,
              gp: currentStat ? currentStat.gms_active : 0,
              ppg: currentStat
                ? currentStat.pts_half_ppr / currentStat.gms_active
                : 0,
              x: currentStat
                ? currentStat.pts_half_ppr / currentStat.gms_active
                : 0,
              rank: currentStat ? currentStat.pos_rank_half_ppr : 0,
              y: currentStat ? currentStat.pos_rank_half_ppr : 0,
            };
          }
        });
        if (pos) {
          teamPlayers = teamPlayers.filter((item) => {
            return (
              item &&
              item.position === pos &&
              ["K", "DEF"].indexOf(item.position) === -1
            );
          });
        } else {
          teamPlayers = teamPlayers.filter((item) => {
            return item && ["K", "DEF"].indexOf(item.position) === -1;
          });
        }
        league[teamName] = teamPlayers;
      });

    setDatasets(
      Object.keys(league).map((teamName, i) => {
        let image = new Image();
        let user = find(usersObj, { display_name: teamName });
        image.src = user.avatar
          ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
          : "";
        image.height = 20;
        image.width = 20;
        image.borderRadius = 4;
        return {
          label: teamName,
          data: league[teamName].map((player) => {
            return {
              x: player.x,
              y: player.y,
              label: player.name,
            };
          }),
          pointStyle: image ?? null,
          backgroundColor: colors[i],
          pointRadius: 8,
          pointHoverRadius: 12,
        };
      })
    );
  };
  useEffect(() => {
    dispatch(fetchLeagues(leagueId));
  }, []);

  useEffect(() => {
    if (stats && leagueObject) fetchPlayers(position);
  }, [position, stats, leagueObject, players]);

  return (
    <Content isLoading={isLoading || isRosterLoading}>
      <div
        className="flex flex-column align-center justify-center"
        style={{
          padding: 12,
          maxWidth: 500,
          margin: "auto",
        }}
      >
        <div className="flex flex-column align-center">
          <h2 style={{ margin: 0 }}>Rank vs PPG by Team</h2>
          <h4 className="subtitle" style={{ margin: "12px 0" }}>
            Filter by Position and Team below
          </h4>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 4,
            width: "100%",
            marginBottom: 8,
          }}
        >
          <Button
            onClick={(e) =>
              setPosition(position === e.target.id ? null : e.target.id)
            }
            id="QB"
            active={position === "QB"}
          >
            QB
          </Button>
          <Button
            onClick={(e) =>
              setPosition(position === e.target.id ? null : e.target.id)
            }
            id="RB"
            active={position === "RB"}
          >
            RB
          </Button>
          <Button
            onClick={(e) =>
              setPosition(position === e.target.id ? null : e.target.id)
            }
            id="WR"
            active={position === "WR"}
          >
            WR
          </Button>
          <Button
            onClick={(e) =>
              setPosition(position === e.target.id ? null : e.target.id)
            }
            id="TE"
            active={position === "TE"}
          >
            TE
          </Button>
        </div>
      </div>
      <div
        className="h-100"
        style={{ paddingBottom: 64, maxHeight: "calc(100vh - 275px)" }}
      >
        {datasets && (
          <Scatter
            data={{ datasets }}
            options={{
              maintainAspectRatio: window.innerWidth > 767,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.dataset.label} ${
                        context.raw.label
                      }\n PPG: ${context.raw.x.toFixed(2)}\n Rank: ${
                        context.raw.y
                      }`,
                  },
                },
              },
              scales: {
                y: {
                  reverse: true,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Rank",
                  },
                  ticks: {
                    stepSize: position !== "TE" && position !== "QB" ? 25 : 10,
                  },
                  border: {
                    width: 2,
                    color: "black",
                  },
                  max:
                    position === "TE" || position === "QB"
                      ? 50
                      : position === "RB"
                      ? 100
                      : 125,
                },
                x: {
                  title: {
                    display: true,
                    text: "PPG",
                  },
                  border: {
                    width: 2,
                    color: "black",
                  },
                  gridLines: {
                    display: false,
                  },
                },
              },
            }}
          />
        )}
      </div>
    </Content>
  );
};

export default TeamsPage;
