import { useEffect, useState } from "react";
import players from "./players.json";
import statsObj from "./stats.json";
import usersObj from "./users.json";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import Button from "../buttons/button";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

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
  "#cf5112",
];
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

let playerURL = "https://api.sleeper.app/v1/players/nfl";
let leagueURL = "https://api.sleeper.app/v1/league/934894009888088064/rosters";
let statsUrl = "https://api.sleeper.app/v1/stats/nfl/regular/2023";
const ScatterPlot = (props) => {
  const [leagueState, setLeague] = useState();
  // active rosters...
  const [rosters, setRosters] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState(statsObj);
  const [position, setPosition] = useState();
  const [activeTeam, setActiveTeam] = useState("all");
  const [teamOptions, setTeamOptions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchStats = async () => {
    setIsFetching(true);
    let response = await fetch(statsUrl);
    let statsObj = await response.json();
    setStats(statsObj);
  };

  const fetchPlayers = async (pos) => {
    let league = [];
    let response = await fetch(leagueURL);
    let leagueObject = await response.json();

    let users = {};
    usersObj.forEach((user) => {
      users[user.user_id] = user.display_name;
    });

    leagueObject.forEach((team) => {
      let teamName = users[team.owner_id];
      let teamPlayers = team.players.map((player) => ({
        name: players[player].full_name,
        position: players[player].position,
        pts: stats[player].pts_half_ppr,
        gp: stats[player].gms_active,
        ppg: stats[player].pts_half_ppr / stats[player].gms_active,
        x: stats[player].pts_half_ppr / stats[player].gms_active,
        rank: stats[player].pos_rank_half_ppr,
        y: stats[player].pos_rank_half_ppr,
      }));
      if (pos) {
        teamPlayers = teamPlayers.filter((item) => {
          return item.position === pos;
        });
      }

      league[teamName] = teamPlayers;
    });
    setIsFetching(false);
    setLeague(league);
    setTeamOptions(Object.keys(league));
    if (activeTeam !== "all") setRosters({ [activeTeam]: league[activeTeam] });
    else setRosters(league);
  };

  useEffect(() => {
    setDatasets(
      Object.keys(rosters).map((teamName, i) => {
        return {
          label: teamName,
          data: leagueState[teamName].map((player) => ({
            x: player.x,
            y: player.y,
            label: player.name,
          })),
          backgroundColor: colors[i],
          pointRadius: 5,
        };
      })
    );
  }, [rosters]);

  useEffect(() => {
    fetchPlayers(position);
  }, [position, activeTeam, stats]);

  useEffect(() => {
    fetchStats();
  }, []);

  let data = {
    datasets,
  };
  return (
    <div
      style={{
        backgroundColor: "white",
        width: "100%",
        paddingTop: 12,
        maxWidth: 1200,
        maxHeight: window.innerWidth > 767 ? "100%" : "100vh",
        margin: "auto",
      }}
    >
      <div
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 500,
          margin: "auto",
        }}
      >
        {/* <Button onClick={fetchStats} style={{ marginBottom: 8 }}>
          {isFetching ? (
            <Icon
              path={mdiLoading}
              title="Stats Fetching"
              size={1}
              horizontal
              vertical
              color="white"
              spin
            />
          ) : (
            "GET LATEST STATS"
          )}
        </Button> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h2 style={{ margin: 0 }}>Rank vs PPG by Team</h2>
          <h4 style={{ color: "rgb(118 118 118)", margin: "12px 0" }}>
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
            onClick={(e) => setPosition(e.target.id)}
            id="QB"
            active={position === "QB"}
          >
            QB
          </Button>
          <Button
            onClick={(e) => setPosition(e.target.id)}
            id="RB"
            active={position === "RB"}
          >
            RB
          </Button>
          <Button
            onClick={(e) => setPosition(e.target.id)}
            id="WR"
            active={position === "WR"}
          >
            WR
          </Button>
          <Button
            onClick={(e) => setPosition(e.target.id)}
            id="TE"
            active={position === "TE"}
          >
            TE
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 150,
            alignItems: "center",
          }}
        >
          <label style={{ marginBottom: 4 }}>Select Team</label>
          <select
            id="teams"
            onChange={(e) => {
              if (e.target.value === "all") {
              } else {
                setDatasets([
                  {
                    label: e.target.value,
                    data: leagueState[e.target.value].map((player) => ({
                      x: player.x,
                      y: player.y,
                      label: player.name,
                    })),
                    backgroundColor:
                      colors[Object.keys(rosters).indexOf(e.target.value)],
                    pointRadius: 5,
                  },
                ]);
              }
              setActiveTeam(e.target.value);
            }}
            value={activeTeam}
          >
            <option value={"all"}>{"All"}</option>

            {teamOptions.map((r) => (
              <option value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <Scatter
        data={data}
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
            },
            x: {
              title: {
                display: true,
                text: "PPG",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ScatterPlot;