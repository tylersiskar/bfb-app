import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import Button from "../../components/buttons/button";
import Content from "../../components/layout/content";
import { useDraft } from "../../sleeper/drafts";
import { groupBy, find } from "lodash";
import statsObj from "../../sleeper/stats.json";
import playersObj from "../../sleeper/players.json";
import usersObj from "../../sleeper/users.json";
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
let leagueURL = "https://api.sleeper.app/v1/league/934894009888088064/rosters";
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
  const [league, setLeague] = useState([]);
  const [variable, setVariable] = useState("draft_slot");

  const fetchStats = async () => {
    let response = await fetch(statsUrl.replace("<year>", year));
    let statsObj = await response.json();
    setStats(statsObj);
  };

  const _calculatePPG = (id) => {
    return stats[id].pts_half_ppr / stats[id].gp;
  };

  const fetchLeague = async () => {
    let response = await fetch(leagueURL);
    let leagueObject = await response.json();
    setLeague(leagueObject);
  };

  useEffect(() => {
    fetchStats();
    fetchLeague();
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
                  x: obj[variable],
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
  }, [data, stats, positions, variable]);

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

  const _getTeamName = (value) => {
    if (variable === "draft_slot") return value;
    else {
      let roster = find(league, { roster_id: value });
      if (!!roster) {
        return find(usersObj, { user_id: roster.owner_id }).display_name;
      }
      return value;
    }
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
            <h2 style={{ marginBottom: 12 }}>
              PPG vs {variable === "draft_slot" ? "Draft Slot" : "Team"} By
              Round
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              width: "100%",
              marginBottom: 8,
            }}
          >
            <Button
              onClick={(e) =>
                setVariable(variable === e.target.id ? null : e.target.id)
              }
              id="draft_slot"
              active={variable === "draft_slot"}
              secondary
            >
              Draft Slot
            </Button>
            <Button
              onClick={(e) =>
                setVariable(year === e.target.id ? null : e.target.id)
              }
              id="roster_id"
              active={variable === "roster_id"}
              secondary
            >
              Team
            </Button>
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
                    }\n PPG: ${context.raw.y.toFixed(2)}\n ${
                      variable === "draft_slot" ? "Slot" : "Team"
                    }: ${_getTeamName(context.raw.x)}`,
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
                  callback: (value) => {
                    return _getTeamName(value);
                  },
                  stepSize: 1,
                },
                title: {
                  display: true,
                  text: variable === "draft_slot" ? "Draft Slot" : "Team",
                },
                grid: {
                  display: true,
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
