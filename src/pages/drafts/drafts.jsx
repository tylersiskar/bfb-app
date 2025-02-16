import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import Button from "../../components/buttons/button";
import Content from "../../components/layout/content";
import { groupBy, find } from "lodash";
import {
  useGetDraftDetailsQuery,
  useGetRostersQuery,
  useGetUsersQuery,
} from "../../api/api";
import { useGetPlayersAllQuery, useGetStatsQuery } from "../../api/bfbApi";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeagues } from "../../api/leagueSlice";
import {
  selectLeagueId,
  selectLeagues,
  selectLeagueYear,
} from "../../api/selectors/leagueSelectors";

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

const DraftsPage = (props) => {
  const dispatch = useDispatch();
  const [positions, setPositions] = useState([
    "QB",
    "RB",
    "WR",
    "TE",
    // "K",
    // "DEF",
  ]);
  const [dataset, setDataset] = useState([]);
  const { data: league } = useGetRostersQuery();
  const [variable, setVariable] = useState("roster_id");
  const { data: usersObj, isLoading: isUserLoading } = useGetUsersQuery();
  const leagueYear = useSelector(selectLeagueYear);
  const leagueId = useSelector(selectLeagueId);
  const [year, setYear] = useState(leagueYear);
  const { data: stats } = useGetStatsQuery(year);
  const { data: playersObj, isLoading } = useGetPlayersAllQuery(year);
  const leagues = useSelector(selectLeagues);
  let draftIds;

  leagues?.forEach((l) => {
    if (!draftIds) draftIds = {};
    draftIds[l.season] = l.draft_id;
  });
  const { data } = useGetDraftDetailsQuery(draftIds && draftIds[year], {
    skip: !draftIds,
  });

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
              let player = find(playersObj, { id: obj.player_id });
              if (player && positions.includes(player.position)) {
                let playerStat = find(stats, { player_id: obj.player_id });
                if (playerStat) {
                  newArray.push({
                    x: obj[variable],
                    y: playerStat.gms_active
                      ? playerStat.pts_half_ppr / playerStat.gms_active
                      : 0,
                    label: `${player.first_name} ${player.last_name}`,
                    position: player.position,
                  });
                }
              }
              return newArray;
            }, []),
          };
        })
    );
  };

  useEffect(() => {
    dispatch(fetchLeagues(leagueId));
  }, []);

  useEffect(() => {
    if (playersObj) _setDataset();
  }, [data, stats, positions, variable, playersObj]);

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
    <Content isLoading={isLoading || isUserLoading}>
      <div
        className="flex flex-column align-center justify-center"
        style={{
          padding: 12,
          maxWidth: 500,
          margin: "auto",
        }}
      >
        <div className="flex flex-column align-center">
          <h2 style={{ margin: 0, marginBottom: 12, textAlign: "center" }}>
            {year} PPG vs {variable === "draft_slot" ? "Draft Slot" : "Team"} By
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
              setVariable(variable === e.target.id ? null : e.target.id)
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
            gridTemplateColumns: leagues.map(() => "1fr").join(" "),
            gap: 4,
            width: "100%",
            marginBottom: 8,
          }}
        >
          {leagues
            ?.map((season) => {
              return (
                <Button
                  onClick={(e) =>
                    setYear(year === e.target.id ? null : e.target.id)
                  }
                  id={season.season}
                  key={season.season}
                  active={year === season.season}
                >
                  {season.season}
                </Button>
              );
            })
            .reverse()}
          {/* <Button onClick={_exportToCSV}>Export {year} Data</Button> */}
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
          {["QB", "RB", "WR", "TE"].map((pos) => {
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

      <div
        className="h-100"
        style={{ paddingBottom: 64, maxHeight: "calc(100vh - 275px)" }}
      >
        {!data || data.length === 0 ? (
          "No Draft Data Yet!"
        ) : (
          <Scatter
            data={{ datasets: dataset }}
            options={{
              maintainAspectRatio: window.innerWidth > 767,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return `${context.dataset.label} ${
                        context.raw.label
                      }\n PPG: ${parseFloat(context.raw.y).toFixed(2)}\n ${
                        variable === "draft_slot" ? "Slot" : "Team"
                      }: ${_getTeamName(context.raw.x)}`;
                    },
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
                      if (value === 13 || value === 0) return "";
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
        )}
      </div>
    </Content>
  );
};

export default DraftsPage;
