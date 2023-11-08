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
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
];
let statsUrl = "https://api.sleeper.app/v1/stats/nfl/regular/<year>";
const DraftsPage = (props) => {
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

  useEffect(() => {
    let arr = groupBy(data, "round");
    setDataset(
      Object.keys(arr)
        .slice(0, 8)
        .map((round, i) => {
          return {
            label: `Round ${round}`,
            backgroundColor: colors[i],
            pointRadius: 5,
            data: arr[round].map((obj) => {
              return {
                x: obj.draft_slot,
                y: _calculatePPG(obj.player_id),
                label: playersObj[obj.player_id].full_name ?? "DEF",
              };
            }),
          };
        })
    );
    // [ { label: round (key), data: [{x: draft_slot, y: ppg (in active year), label: PlayerName, backgroundColor: colors[i]}]}]
  }, [data, stats]);

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
              Filtering by Team / Position coming soon...
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
                title: {
                  display: true,
                  text: "PPG",
                },
                max: 25,
              },
              x: {
                title: {
                  display: true,
                  text: "Draft Slot",
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
