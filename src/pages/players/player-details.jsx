import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import {
  selectPlayersProjectedKeepers,
  useGetPlayerByIdQuery,
  useGetPlayersQuery,
  useGetStatsQuery,
} from "../../api/bfbApi";
import { selectLeagueYear } from "../../api/selectors/leagueSelectors";
import { Content } from "../../components/layout";
import { PlayerList } from "../../components/list-items";
import {
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetUsersQuery,
} from "../../api/api";
import "./player-details.scss";
import { mdiChartBar, mdiListBoxOutline, mdiSwapHorizontal } from "@mdi/js";
import WindowList from "../../components/window/window-list";
import { selectExpandedWindow } from "../../api/playerDetailsSlice";
import Plot from "react-plotly.js";
import { find, groupBy } from "lodash";
import { useMemo, useState } from "react";

function getPercentile(array, value) {
  let numArray = array.map((v) => parseFloat(v));
  const sorted = [...numArray].sort((a, b) => a - b);
  const count = sorted.filter((v) => v < value).length;
  return ((count / sorted.length) * 100).toFixed(1);
}

const renderBoxplot = ({ series }) => {
  const outliers = series
    .map((dataObj) => {
      let value = dataObj.data.filter((o) => o.id === dataObj.outlierId);
      let hasValue = value && value.length > 0;
      if (!hasValue) return;
      return {
        title: dataObj.title,
        dataKey: dataObj.dataKey,
        value: hasValue && parseFloat(value[0][dataObj.dataKey]),
        percentile: getPercentile(
          dataObj.data.map((o) => o[dataObj.dataKey]),
          hasValue && parseFloat(value[0][dataObj.dataKey])
        ),
      };
    })
    .filter((o) => !!o);
  let datasets = series
    .map((dataObj) => {
      let data = dataObj.data.map((o) => parseFloat(o[dataObj.dataKey])).sort();
      return {
        title: dataObj.title,
        data,
        dataKey: dataObj.dataKey,
      };
    })
    .filter((set) => find(outliers, { dataKey: set.dataKey }));
  const normalize = (arr) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return arr.map((val) => (val - min) / (max - min));
  };

  const normalizePoint = (point, arr) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return (point - min) / (max - min);
  };

  let plotlyData = datasets
    .map((dataset, i) => {
      let boxData = {
        type: "box",
        x: normalize(dataset.data), // normalized values
        y: Array(dataset.data.length).fill(dataset.title),
        orientation: "h",
        name: dataset.title,
        text: "placeholder",
        hoverinfo: "text",
        marker: { color: "#cecece" },
        line: { color: "#cecece" },
        fillcolor: "rgba(0,0,0,0)",
        boxpoints: "all", // only show calculated outliers
        customdata: dataset.data, // original (raw) values
        hovertemplate: "Value: %{customdata}<extra></extra>",
      };

      let dotData = {
        type: "scatter",
        mode: "markers",
        x: [normalizePoint(outliers[i].value, dataset.data)], // normalized value
        y: [dataset.title],
        customdata: [outliers[i].value],
        hovertemplate: "Player %{customdata}<extra></extra>",
        marker: {
          color: "steelblue",
          size: 12,
          symbol: "circle",
        },
        name: "Player",
        showlegend: false,
      };

      return [boxData, dotData];
    })
    .flat(1);

  return (
    <div style={{ backgroundColor: "transparent", width: "100%" }}>
      <div className="flex pt-1">
        {outliers.map((o) => (
          <div className="flex-column align-start pr-2" key={o.title}>
            {o.value && (
              <div className="flex align-center">
                <p className="white bold md pr-1">{o.title}:</p>
                <p className="blue sm bold">{`${o.value}`}</p>
              </div>
            )}
            {o.value && (
              <div className="flex align-center">
                <p className="white bold md pr-1">Percentile:</p>
                <p className="blue sm bold">{` ${o.percentile}%`}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <Plot
        useResizeHandler={true}
        data={plotlyData}
        layout={{
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { color: "#cecece" },
          xaxis: {
            visible: false,
          },
          yaxis: {
            showgrid: false,
            zeroline: false,
          },
          margin: { t: 40 },
          showlegend: false,
        }}
        config={{
          displayModeBar: false,
          staticPlot: true,
          responsive: true,
        }}
        style={{ width: "100%", height: "325px" }}
      />
    </div>
  );
};

const PlayerDetails = () => {
  const navigate = useNavigate();
  const [playerSource, togglePlayerSource] = useState("all");
  const expandedWindow = useSelector(selectExpandedWindow);
  const params = useParams();
  const { data: rosters } = useGetRostersQuery();
  const { data: users } = useGetUsersQuery();
  const leagueYear = useSelector(selectLeagueYear);
  const { data: nflState } = useGetNflStateQuery();
  let year =
    nflState?.season_type === "off" ? nflState.previous_season : leagueYear;
  const { data: player, isFetching } = useGetPlayerByIdQuery({
    id: params.playerId,
    year: leagueYear,
  });
  const { data: playersAll } = useGetPlayersQuery({
    year: leagueYear,
    pageSize: 1000,
  });
  const { data: stats } = useGetStatsQuery(
    { year, pos: player?.position },
    { skip: !player || !player.position }
  );
  // arr of rosters with owner info and projected keepers
  const teamWithProjectedKeepers = useSelector((state) =>
    selectPlayersProjectedKeepers(state, {
      playersAll,
      rosters,
      users,
    })
  );

  const {
    tradeCandidateTeams,
    bfbTeam,
    activePlayer,
    sourceRoster,
    sourceStats,
  } = useMemo(() => {
    if (!teamWithProjectedKeepers || !playersAll || !player) {
      return {
        tradeCandidateTeams: [],
        bfbTeam: {},
        activePlayer: {},
        sourceRoster: [],
        sourceStats: [],
      };
    }
    const matchedTeam = teamWithProjectedKeepers.find(
      (team) => !!find(team.players, { id: params.playerId })
    );

    const players = matchedTeam?.players || [];
    const activePlayerOnRoster = find(players, { id: params.playerId });
    let rosteredPlayers = rosters?.map((r) => r.players).flat(1);
    let allPlayersOnRoster = playersAll?.filter((p) =>
      p.id === params.playerId ? true : rosteredPlayers.includes(p.id)
    );
    let allStatsOnRoster = stats?.filter((p) =>
      p.id === params.playerId ? true : rosteredPlayers.includes(p.id)
    );
    let sourceRoster = playerSource === "all" ? playersAll : allPlayersOnRoster;
    let sourceStats = playerSource === "all" ? stats : allStatsOnRoster;
    sourceRoster = sourceRoster.filter((r) => r.position === player.position);
    return {
      tradeCandidateTeams:
        activePlayerOnRoster && activePlayerOnRoster.tradeCandidateTeams,
      bfbTeam: matchedTeam || {},
      activePlayer: activePlayerOnRoster,
      sourceRoster,
      sourceStats,
    };
  }, [teamWithProjectedKeepers, player, stats]);

  if (!player) return <Content dark isLoading />;
  let windows = [
    {
      icon: mdiChartBar,
      title: "Value",
      color: "#F28B82",
      isChecked: playerSource === "all",
      onToggle: () => {
        togglePlayerSource((prev) => (prev === "all" ? "rostered" : "all"));
      },
      bodyFn: () =>
        renderBoxplot({
          series: [
            {
              data: sourceStats,
              outlierId: player.id,
              dataKey: "ppg_half_ppr",
              title: "PPG",
            },
            {
              data: sourceRoster,
              outlierId: player.id,
              dataKey: "value",
              title: "KTC",
            },
          ],
        }),
    },
  ];
  if (tradeCandidateTeams && tradeCandidateTeams.length > 0) {
    windows.push({
      icon: mdiSwapHorizontal,
      title: "Trade Candidacy",
      color: "#B5EAD7",
      bodyFn: () => {
        return (
          <div
            className="flex flex-column"
            style={{ overflow: "auto", height: 325 }}
          >
            {tradeCandidateTeams?.map((ownerId) => {
              let owner = find(teamWithProjectedKeepers, {
                owner_id: ownerId,
              });
              let playerIds = owner.players.map((p) => p.id);
              if (playerIds.includes(params.playerId)) return;
              let ownersKeepers = owner.projectedKeepers;
              let positionalGrouping = groupBy(ownersKeepers, "pos");
              let displayName = owner.team_name;
              if (displayName) {
                return (
                  <div
                    className="flex align-end mb-2 justify-between"
                    key={ownerId}
                  >
                    <p className="pr-2 light md bold">{displayName}</p>
                    <div className="d-flex pt-1 ">
                      {Object.keys(positionalGrouping)
                        .sort()
                        .map((pos, i) => (
                          <div
                            className={`${pos} p-1`}
                            style={{
                              borderRadius: 4,
                              marginRight: 4,
                            }}
                            key={pos}
                          >
                            {" "}
                            <p
                              className={`bold dark sm pr-${
                                Object.keys(positionalGrouping).length - 1 === i
                                  ? 0
                                  : 1
                              }`}
                            >{`${positionalGrouping[pos].length} ${pos} `}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        );
      },
    });
  }
  if (activePlayer) {
    windows.push({
      icon: mdiListBoxOutline,
      title: "Roster",
      color: "#AEC6CF",
      bodyFn: () => (
        <PlayerList
          className="flex flex-column"
          hidePagination
          playerList={bfbTeam.players}
          onPlayerClick={(player) => {
            navigate(`/players/${player.id}`);
          }}
          style={{ width: "100%" }}
          scrollHeight="auto"
          activePlayerId={params.playerId}
        />
      ),
    });
  }
  console.log(activePlayer, player);
  return (
    <Content dark isLoading={isFetching} home>
      <div style={{ height: "calc(100vh - 100px)" }}>
        <div className="hero">
          <div className="flex justify-between align-center w-100">
            <div className="flex-column align-start flex pl-2">
              <h1 className={`light pb-1 ${expandedWindow ? "md" : "lg"}`}>
                {player.full_name}
              </h1>
              <div className="flex">
                <p className={`light ${expandedWindow ? "md" : "lg"}  pb-2`}>
                  {player.position} • {player.team}
                </p>
              </div>
              <p className="yellow sm pb-2">{bfbTeam.team_name ?? "BFB FA"}</p>
              <p className="blue bold sm pb-2">KTC: {player.value}</p>
            </div>
            <div
              className={`player-avatar ${!!expandedWindow ? "avatar-sm" : ""}`}
              style={{ margin: 0 }}
            >
              <img
                src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`}
                style={{
                  height: "110%",
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            </div>
          </div>
          <div className="flex w-100 align-center">
            <div
              className={`QB p-1 flex align-center justify-center`}
              style={{
                borderRadius: 4,
                marginRight: 4,
              }}
            >
              <p className={`bold dark sm pr-1`}>
                {activePlayer && activePlayer.status
                  ? activePlayer.status.toUpperCase() === "N/A"
                    ? "NON-KEEPER"
                    : activePlayer.status.toUpperCase() === "TRADE"
                    ? "TRADE CANDIDATE"
                    : activePlayer.status.toUpperCase()
                  : player.years_exp === 0
                  ? "ROOKIE"
                  : "FREE AGENT"}
              </p>
            </div>
          </div>
        </div>
        <WindowList windows={windows} />
      </div>
    </Content>
  );
};
export default PlayerDetails;
