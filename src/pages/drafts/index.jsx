import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import Button from "../../components/buttons/button";
import Content from "../../components/layout/content";
import { useDraft } from "../../sleeper/drafts";
import { groupBy } from "lodash";
import statsObj from "../../components/charts/stats.json";
import playersObj from "../../components/charts/players.json";
/**
 *
 * @param {*} props
 * @returns
 * This page is supposed to be a multiseries chart that shows each draft slot vs ppg for that year, then marked red or someting if they were a keeper the following year?
 */
const colors = [
  "red",
  "orange",
  "gold",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
];
let statsUrl = "https://api.sleeper.app/v1/stats/nfl/regular/<year>";
const DraftsPage = (props) => {
  const [positions, setPositions] = useState([
    "QB",
    "RB",
    "WR",
    "TE",
    "K",
    "DEF",
  ]);
  const [year, setYear] = useState("2022");
  const { data, loading, error } = useDraft(year);
  const [dataset, setDataset] = useState([]);
  const [stats, setStats] = useState(statsObj);

  const fetchStats = async () => {
    let response = await fetch(statsUrl.replace("<year>", year));
    let statsObj = await response.json();
    setStats(statsObj);
  };

  const _calculatePPG = (id) => {
    return stats[id].pts_half_ppr / stats[id].gp;
  };

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchStats();
  }, [year]);

  const _setDataset = () => {
    let arr = groupBy(data, "round");
    setDataset(
      Object.keys(arr)
        .slice(0, 8)
        .map((round, i) => {
          return {
            label: `Round ${round}`,
            backgroundColor: colors[i],
            pointRadius: 8,
            pointHoverRadius: 12,
            data: arr[round].reduce((newArray, obj) => {
              if (positions.includes(playersObj[obj.player_id].position)) {
                newArray.push({
                  x: obj.draft_slot,
                  y: _calculatePPG(obj.player_id),
                  label: playersObj[obj.player_id].full_name ?? "DEF",
                  position: playersObj[obj.player_id].position,
                });
              }
              return newArray;
            }, []),
          };
        })
    );
  };
  useEffect(() => {
    _setDataset();
  }, [data, stats, positions]);

  const _exportToCSV = () => {
    let csvData = [["Year", "Round", "Draft Slot", "Player", "PPG"]];
    dataset.forEach((row) => {
      row.data.forEach((round) => {
        csvData.push([
          year,
          row.label,
          round.x,
          round.label,
          round.y.toFixed(2),
        ]);
      });
    });

    let csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "draft_data.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
  };
  return (
    <Content>
      <div
        className="w-100"
        style={{
          paddingTop: 12,
          maxWidth: 1200,
          maxHeight: window.innerWidth > 767 ? "100%" : "100vh",
          margin: "auto",
        }}
      >
        <div
          className="flex flex-column align-center justify-center"
          style={{
            padding: 12,
            maxWidth: 500,
            margin: "auto",
          }}
        >
          <div className="flex flex-column align-center">
            <h2 style={{ margin: 0 }}>PPG vs Draft Slot By Round</h2>
            <h4 className="subtitle" style={{ margin: "12px 0" }}>
              Filtering by Team coming soon...
            </h4>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 2fr",
              gap: 4,
              width: "100%",
              marginBottom: 8,
            }}
          >
            <Button
              onClick={(e) =>
                setYear(year === e.target.id ? null : e.target.id)
              }
              id="2022"
              active={year === "2022"}
            >
              2022
            </Button>
            <Button
              onClick={(e) =>
                setYear(year === e.target.id ? null : e.target.id)
              }
              id="2023"
              active={year === "2023"}
            >
              2023
            </Button>
            <Button onClick={_exportToCSV}>Export {year} Data</Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
              gap: 4,
              width: "100%",
              marginBottom: 8,
            }}
          >
            {["QB", "RB", "WR", "TE", "K", "DEF"].map((pos) => {
              return (
                <Button
                  onClick={() => {
                    let newPositions = positions.includes(pos)
                      ? [...positions.filter((item) => item !== pos)]
                      : [...positions, pos];

                    setPositions(newPositions);
                  }}
                  id={pos}
                  key={pos}
                  active={positions.includes(pos)}
                  secondary
                >
                  {pos}
                </Button>
              );
            })}
          </div>
        </div>

        <Scatter
          data={{ datasets: dataset }}
          options={{
            maintainAspectRatio: window.innerWidth > 767,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label} ${
                      context.raw.label
                    }\n PPG: ${context.raw.y.toFixed(2)}\n Slot: ${
                      context.raw.x
                    }`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                border: {
                  width: 2,
                  color: "black",
                },
                title: {
                  display: true,
                  text: "PPG",
                },
                grid: {
                  display: false,
                },
                max: 25,
              },
              x: {
                min: 0,
                max: 13,
                border: {
                  width: 2,
                  color: "black",
                },
                ticks: {
                  stepSize: 1,
                },
                title: {
                  display: true,
                  text: "Draft Slot",
                },
                grid: {
                  display: false,
                },
              },
            },
          }}
        />
      </div>
    </Content>
  );
};

export default DraftsPage;
