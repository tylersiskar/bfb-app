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
  const [rosters, setRosters] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState(statsObj);
  const [position, setPosition] = useState();
  const [activeTeam, setActiveTeam] = useState("all");
  const [teamOptions, setTeamOptions] = useState([]);

  const fetchStats = async () => {
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

    setTeamOptions(Object.keys(league));

    if (activeTeam !== "all") setRosters({ [activeTeam]: league[activeTeam] });
    else setRosters(league);
  };

  useEffect(() => {
    setDatasets(
      Object.keys(rosters).map((teamName, i) => {
        return {
          label: teamName,
          data: rosters[teamName].map((player) => ({
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
  }, [position, activeTeam]);

  //   useEffect(() => {
  //       setRosters()
  //   })

  useEffect(() => {
    fetchPlayers();
  }, []);

  let data = {
    datasets,
  };

  return (
    <div style={{ backgroundColor: "white", width: 1200, padding: 12 }}>
      <Button onClick={fetchStats}>FETCH LATEST STATS</Button>
      <Button
        onClick={(e) => setPosition(e.target.id)}
        id="WR"
        active={position === "WR"}
      >
        WR
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
        id="QB"
        active={position === "QB"}
      >
        QB
      </Button>
      <Button
        onClick={(e) => setPosition(e.target.id)}
        id="TE"
        active={position === "TE"}
      >
        TE
      </Button>
      <select
        id="teams"
        onChange={(e) => {
          if (e.target.value === "all") {
          } else {
            setDatasets([
              {
                label: e.target.value,
                data: rosters[e.target.value].map((player) => ({
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
      <Scatter
        data={data}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) =>
                  context.dataset.label + " " + context.raw.label,
              },
            },
          },
          scales: {
            y: {
              reverse: true,
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default ScatterPlot;
