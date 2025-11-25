import { useEffect, useState, useMemo } from "react";
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
import find from "lodash/find";
import { useGetPlayersAllQuery } from "../../api/bfbApi";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLeagueId,
  selectLeagueStage,
  selectLeagueYear,
} from "../../api/selectors/leagueSelectors";
import { fetchLeagues } from "../../api/leagueSlice";

const colors = [
  "#E41A1C", // vivid red
  "#377EB8", // strong blue
  "#4DAF4A", // balanced green
  "#984EA3", // purple
  "#FF7F00", // orange
  "#A65628", // brown
  "#F781BF", // pink
  "#999999", // gray
  "#66C2A5", // teal (distinct from green)
  "#E7298A", // magenta
  "#1B9E77", // turquoise
  "#7570B3", // indigo
];

const chartAreaBorder = {
  id: "chartAreaBorder",
  beforeDraw(chart) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    ctx.save();
    // Softer light border for dark background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
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

export const TeamsPage = () => {
  const dispatch = useDispatch();
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

  const datasets = useMemo(() => {
    if (!usersObj || !leagueObject || !players) return [];

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
            value: player.value,
          };
        })
        .filter((p) => p && !["K", "DEF"].includes(p.position));

      acc[teamName] = teamPlayers;
      return acc;
    }, {});

    return Object.entries(league).map(([teamName, players], i) => ({
      label: teamName,
      data: players,
      backgroundColor: colors[i % colors.length],
      pointRadius: 4,
      pointHoverRadius: 12,
    }));
  }, [usersObj, leagueObject, players]);

  return (
    <Content isLoading={isRosterLoading}>
      <div
        className="flex flex-column align-center justify-center"
        style={{ maxWidth: 325, margin: "auto" }}
      >
        <h2 style={{ color: "#fff", paddingBottom: 12 }}>
          Rank vs PPG by Team
        </h2>
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
              inverted
            >
              {pos}
            </Button>
          ))}
        </div>
      </div>
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
                legend: {
                  display: false,
                  labels: {
                    color: "#fff",
                  },
                },
                tooltip: {
                  bodyColor: "#fff",
                  titleColor: "#fff",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
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
                  offset: 4,
                  // White labels for dark background
                  color: "#ffffff",
                  font: {
                    size: 9,
                    weight: "500",
                  },
                  clip: false,
                  formatter: (val) => {
                    const parts = val.name?.split(" ");
                    const lastName =
                      parts && parts.length === 3
                        ? parts[parts.length - 2] +
                          " " +
                          parts[parts.length - 1]
                        : parts?.[parts.length - 1];
                    return (parts?.[0]?.[0] || "") + " " + (lastName || "");
                  },
                },
              },
              scales: {
                y: {
                  reverse: true,
                  beginAtZero: true,
                  title: {
                    display: false,
                    text: "Rank",
                    color: "#fff",
                  },
                  ticks: {
                    stepSize: 10,
                    color: "#ffffff",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.15)", // lighter grid lines
                    drawBorder: false,
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "PPG",
                    color: "#ffffff",
                  },
                  ticks: {
                    color: "#ffffff",
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.15)",
                    drawBorder: false,
                  },
                  max: position === "TE" ? 16 : position === "WR" ? 20 : 26,
                  min: position === "TE" ? 4 : position === "QB" ? 12 : 8,
                },
              },
            }}
          />
        )}
      </div>
    </Content>
  );
};
