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
  "#E41A1C",
  "#377EB8",
  "#4DAF4A",
  "#984EA3",
  "#FF7F00",
  "#A65628",
  "#F781BF",
  "#999999",
  "#66C2A5",
  "#E7298A",
  "#1B9E77",
  "#7570B3",
];

// Position-specific keeper model settings – tweak freely
const POSITION_CONFIG = {
  QB: {
    weightPpg: 0.7, // care more about actual PPG
    weightValue: 0.3,
    cutoff: 90, // stricter: fewer QBs above line
  },
  RB: {
    weightPpg: 0.6, // a bit flatter trade-off than WR
    weightValue: 0.45,
    cutoff: 85,
  },
  WR: {
    weightPpg: 0.6,
    weightValue: 0.4,
    cutoff: 85,
  },
  TE: {
    weightPpg: 0.7,
    weightValue: 0.3,
    cutoff: 90,
  },
};

// Percentile range
const AXIS_MIN = 55;
const AXIS_MAX = 101;

const chartAreaBorder = {
  id: "chartAreaBorder",
  beforeDraw(chart) {
    const {
      ctx,
      chartArea: { left, top, width, height },
    } = chart;
    ctx.save();
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

export const TeamsV2Page = () => {
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

  useEffect(() => {
    if (leagueId) dispatch(fetchLeagues(leagueId));
  }, [dispatch, leagueId]);

  const data = useMemo(() => {
    if (!usersObj || !leagueObject || !players) {
      return { datasets: [] };
    }

    const { weightPpg, weightValue, cutoff } = POSITION_CONFIG[position];

    const usersById = Object.fromEntries(
      usersObj.map((u) => [u.user_id, u.display_name])
    );

    // Build team → players
    const leagueByTeam = leagueObject.reduce((acc, team) => {
      const teamName = usersById[team.owner_id];
      const teamPlayers = team.players
        .map((id) => {
          const player = find(players, { id });
          if (!player) return null;

          const {
            full_name,
            position: playerPos,
            pos_rank_half_ppr,
            ppg_percentile,
            value_percentile,
            ppg,
            value,
          } = player;

          if (
            playerPos === "K" ||
            playerPos === "DEF" ||
            ppg_percentile == null ||
            value_percentile == null
          ) {
            return null;
          }

          const ppgPct = ppg_percentile * 100;
          const valPct = value_percentile * 100;

          const keeperScore = weightPpg * ppgPct + weightValue * valPct;

          return {
            name: full_name,
            team: teamName,
            rank: pos_rank_half_ppr,
            x: valPct,
            y: ppgPct,
            ppgPercentile: ppgPct,
            valuePercentile: valPct,
            keeperScore,
            ppg,
            value,
            isKeeperWorthy: keeperScore >= cutoff,
          };
        })
        .filter(Boolean);

      acc[teamName] = teamPlayers;
      return acc;
    }, {});

    // Scatter datasets for each team
    const teamDatasets = Object.entries(leagueByTeam).map(
      ([teamName, teamPlayers], i) => {
        const color = colors[i % colors.length];
        return {
          label: teamName,
          data: teamPlayers,
          backgroundColor: color,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBorderWidth: 1,
          pointBorderColor: (ctx) => {
            const raw = ctx.raw || {};
            return raw.isKeeperWorthy ? "#ffffff" : "transparent";
          },
          datalabels: {
            display: true,
            align: "bottom",
            anchor: "end",
            offset: 1,
            color: "#ffffff",
            font: { size: 7, weight: "500" },
            clip: false,
            formatter: (val) => {
              if (!val.name) return "";
              const parts = val.name.split(" ");
              const lastName =
                parts.length === 3
                  ? parts[1] + " " + parts[2]
                  : parts[parts.length - 1];
              const firstInitial = parts[0]?.[0] || "";
              return `${firstInitial} ${lastName}`;
            },
          },
        };
      }
    );

    // Keeper boundary line for current position:
    // weightPpg*PPG + weightValue*Value = cutoff
    // -> PPG = (cutoff - weightValue*Value) / weightPpg
    const keeperLinePoints = [];
    for (let x = AXIS_MIN; x <= AXIS_MAX; x += 1) {
      const y = (cutoff - weightValue * x) / weightPpg;
      keeperLinePoints.push({ x, y });
    }

    const keeperBoundaryDataset = {
      label: "Keeper Boundary",
      type: "line",
      data: keeperLinePoints,
      borderColor: "rgba(255,255,255,0.6)",
      borderWidth: 1,
      borderDash: [6, 4],
      pointRadius: 0,
      datalabels: { display: false },
    };

    return {
      datasets: [...teamDatasets, keeperBoundaryDataset],
    };
  }, [usersObj, leagueObject, players, position]);

  return (
    <Content isLoading={isRosterLoading}>
      <div
        className="flex flex-column align-center justify-center"
        style={{ maxWidth: 420, margin: "auto", padding: "0 16px" }}
      >
        <h2 style={{ color: "#fff", paddingBottom: 8 }}>Keeper Value</h2>
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
              onClick={() => setPosition(pos)}
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
        {data.datasets.length > 0 && (
          <Scatter
            data={data}
            plugins={[chartAreaBorder, ChartDataLabels]}
            options={{
              maintainAspectRatio: window.innerWidth > 767,
              plugins: {
                legend: { display: false },
                tooltip: {
                  bodyColor: "#fff",
                  titleColor: "#fff",
                  backgroundColor: "rgba(0,0,0,0.8)",
                  callbacks: {
                    label: (ctx) => {
                      const raw = ctx.raw || {};
                      if (!raw.name) return "";

                      const name = raw.name;
                      const team = raw.team;
                      const ppg = raw.ppg ? parseFloat(raw.ppg).toFixed(2) : "";

                      return `${team} ${name} PPG: ${ppg}`;
                    },
                  },
                },
                datalabels: {}, // enable dataset-level datalabel configs
              },
              scales: {
                x: {
                  type: "linear",
                  min: AXIS_MIN,
                  max: AXIS_MAX,
                  reverse: true, // 👈 flip the axis so 100 is on the left, 60 on the right
                  title: {
                    display: true,
                    text: "Dynasty Value Percentile",
                    color: "#ffffff",
                  },
                  ticks: {
                    color: "#ffffff",
                    callback: (v) => `${v}%`,
                  },
                  grid: {
                    color: "rgba(255,255,255,0.15)",
                    drawBorder: false,
                  },
                },
                y: {
                  type: "linear",
                  min: AXIS_MIN,
                  max: AXIS_MAX,
                  title: {
                    display: true,
                    text: "PPG Percentile",
                    color: "#ffffff",
                  },
                  ticks: {
                    color: "#ffffff",
                    callback: (v) => `${v}%`,
                  },
                  grid: {
                    color: "rgba(255,255,255,0.15)",
                    drawBorder: false,
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
