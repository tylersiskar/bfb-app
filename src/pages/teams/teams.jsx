import { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
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

const colors = [
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
const chartAreaBorder = {
  id: "chartAreaBorder",
  beforeDraw(chart) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  },
};

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const TeamsPage = () => {
  const dispatch = useDispatch();
  const [datasets, setDatasets] = useState([]);
  const [position, setPosition] = useState("QB");

  const leagueYear = useSelector(selectLeagueYear);
  const leagueId = useSelector(selectLeagueId);
  const leagueStatus = useSelector(selectLeagueStage);
  const statsYear = leagueStatus === "pre_draft" ? leagueYear - 1 : leagueYear;

  const { data: leagueObject, isLoading: isRosterLoading } =
    useGetRostersQuery();
  const { data: usersObj } = useGetUsersQuery();
  const { data: players } = useGetPlayersAllQuery({
    year: statsYear,
    position,
  });

  // Fetch league data when leagueId changes
  useEffect(() => {
    if (leagueId) dispatch(fetchLeagues(leagueId));
  }, [dispatch, leagueId]);

  // Build datasets
  const fetchPlayers = useCallback(
    (pos) => {
      if (!usersObj || !leagueObject || !players) return;

      const users = Object.fromEntries(
        usersObj.map((u) => [u.user_id, u.display_name])
      );

      const league = leagueObject.reduce((acc, team) => {
        const teamName = users[team.owner_id];
        const teamPlayers = team.players
          .map((id) => {
            const player = find(players, { id });
            if (!player) return null;
            return {
              name: player.full_name,
              position: player.position,
              x: player.ppg,
              y: player.pos_rank_half_ppr,
            };
          })
          .filter(
            (p) =>
              p &&
              ["K", "DEF"].indexOf(p.position) === -1 &&
              (!pos || p.position === pos)
          );

        acc[teamName] = teamPlayers;
        return acc;
      }, {});

      setDatasets(
        Object.entries(league).map(([teamName, players], i) => ({
          label: teamName,
          data: players,
          backgroundColor: colors[i % colors.length],
          pointRadius: 4,
          pointHoverRadius: 12,
        }))
      );
    },
    [usersObj, leagueObject, players]
  );

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return (
    <Content isLoading={isRosterLoading}>
      <div
        className="flex flex-column align-center justify-center"
        style={{ maxWidth: 325, margin: "auto" }}
      >
        <h2 style={{ paddingBottom: 12 }}>Rank vs PPG by Team</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
            width: "100%",
          }}
        >
          {["QB", "RB", "WR", "TE"].map((pos) => (
            <Button
              key={pos}
              id={pos}
              onClick={() => {
                if (position === pos) return;
                setPosition(pos);
              }}
              active={position === pos}
            >
              {pos}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        className="h-100"
        style={{ padding: "0 8px 32px", maxHeight: "calc(100vh - 200px)" }}
      >
        {datasets.length > 0 && (
          <Scatter
            data={{ datasets }}
            plugins={[chartAreaBorder]}
            options={{
              maintainAspectRatio: window.innerWidth > 767,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const xVal = ctx.raw?.x;
                      const ppg =
                        typeof xVal === "number"
                          ? xVal.toFixed(2)
                          : parseFloat(xVal).toFixed(2);
                      const name = ctx.raw?.name ?? "";
                      const team = ctx.dataset?.label ?? "";

                      return `${team} ${name}\nPPG: ${ppg}\nRank: ${ctx.raw.y}`;
                    },
                  },
                },
                datalabels: {
                  display: true,
                  align: "bottom",
                  anchor: "end",
                  offset: 2,
                  color: "#333",
                  font: {
                    size: 9,
                    weight: "500",
                  },
                  clip: false,
                  formatter: (val) => {
                    const parts = val.name?.split(" ");
                    const lastName =
                      parts.length === 3
                        ? parts?.[parts.length - 2] +
                          " " +
                          parts?.[parts.length - 1]
                        : parts?.[parts.length - 1];
                    return parts?.[0][0] + " " + lastName || ""; // show last name
                  },
                },
              },
              scales: {
                y: {
                  reverse: true,
                  beginAtZero: true,
                  title: { display: false, text: "Rank" },
                  ticks: {
                    stepSize: 10,
                  },
                },
                x: {
                  title: { display: true, text: "PPG" },
                  max: position === "TE" || position === "WR" ? 20 : 30,
                  min: position === "TE" ? 5 : 10,
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
