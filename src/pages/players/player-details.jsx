import { useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  selectPlayersProjectedKeepers,
  useGetPlayerByIdQuery,
  useGetPlayersAllQuery,
  useGetPlayersQuery,
  useGetStatsQuery,
} from "../../api/bfbApi";
import { selectLeagueYear } from "../../api/selectors/leagueSelectors";
import { Content } from "../../components/layout";
import {
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetUsersQuery,
} from "../../api/api";
import "./player-details.scss";
import { mdiChartBar, mdiSwapHorizontal } from "@mdi/js";
import WindowList from "../../components/window/window-list";
import { selectExpandedWindow } from "../../api/playerDetailsSlice";
import Plot from "react-plotly.js";
import { find, groupBy } from "lodash";

function getPercentile(array, value) {
  let numArray = array.map((v) => parseFloat(v));
  const sorted = [...numArray].sort((a, b) => a - b);
  const count = sorted.filter((v) => v < value).length;
  return ((count / sorted.length) * 100).toFixed(1);
}

const renderBoxplot = ({ series }) => {
  const datasets = series.map((dataObj) => {
    return {
      title: dataObj.title,
      data: dataObj.data.map((o) => parseFloat(o[dataObj.dataKey])).sort(),
    };
  });
  const outliers = series.map((dataObj) => {
    let value = dataObj.data.filter((o) => o.id === dataObj.outlierId);
    let hasValue = value && value.length > 0;
    return {
      title: dataObj.title,
      dataKey: dataObj.dataKey,
      value: hasValue && parseFloat(value[0][dataObj.dataKey]),
      percentile: getPercentile(
        dataObj.data.map((o) => o[dataObj.dataKey]),
        hasValue && parseFloat(value[0][dataObj.dataKey])
      ),
    };
  });

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
            <div className="flex align-center">
              <p className="white bold md pr-1">{o.title}:</p>
              <p className="blue sm bold">{` ${o.value}`}</p>
            </div>
            <div className="flex align-center">
              <p className="white bold md pr-1">Percentile:</p>
              <p className="blue sm bold">{` ${o.percentile}%`}</p>
            </div>
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
          displayModeBar: false, // ✅ removes the toolbar entirely
          staticPlot: true, // ✅ disables all user interactions (zoom, pan, etc.)
          responsive: true,
        }}
        style={{ width: "100%", height: "325px" }}
      />
    </div>
  );
};

const PlayerDetails = () => {
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
  const { data: playersAll } = useGetPlayersAllQuery(year);
  const { data: stats } = useGetStatsQuery(
    { year, pos: player?.position },
    { skip: !player || !player.position }
  );
  const teamOwners = useSelector((state) =>
    selectPlayersProjectedKeepers(state, {
      playersAll,
      rosters,
      users,
    })
  );

  let rosteredPlayers = teamOwners?.map((team) => team.players).flat(1);
  let activePlayer = rosteredPlayers?.find((o) => o.id === params.playerId);
  // roster fetching...tbd if we'll really use this
  /**
   * Trying to figure out the value of this. I guess if i want to view a player, i want to see if I can acquire them, so seeing who their team is would be helpful.
   * Would like to have a lot of cards to go through honestly.
   */
  let allRosters = rosters?.map((r) => r.players);
  let playerIds = allRosters?.filter((arr) => !!arr.includes(params.playerId));
  const { data: fullRoster } = useGetPlayersQuery(
    { id: JSON.stringify(playerIds), year: leagueYear },
    { skip: !playerIds || !playerIds.length }
  );
  if (!player) {
    return <Content dark isLoading />;
  }
  return (
    <Content dark isLoading={isFetching} home>
      <div style={{ height: "calc(100vh - 100px)" }}>
        <div className={`hero ${!!expandedWindow ? "hero-collapsed" : ""}`}>
          <div
            className={`player-avatar mr-2 ${
              !!expandedWindow ? "avatar-sm" : ""
            }`}
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
          <div className="flex-column align-center flex pl-2">
            <h1 className="light pb-1">{player.full_name}</h1>
            <div className="flex">
              <p className="light pb-2">
                {player.position} • {player.team}
              </p>
            </div>
            <p className="yellow bold pb-2">KTC: {player.value}</p>
          </div>
        </div>
        <WindowList
          windows={[
            {
              icon: mdiChartBar,
              title: "Value",
              color: "#F28B82",
              bodyFn: () =>
                renderBoxplot({
                  series: [
                    {
                      data: stats,
                      outlierId: player.id,
                      dataKey: "ppg_half_ppr",
                      title: "PPG",
                    },
                    {
                      data: playersAll,
                      outlierId: player.id,
                      dataKey: "value",
                      title: "KTC",
                    },
                  ],
                }),
            },
            {
              icon: mdiSwapHorizontal,
              title: "Trade Candidacy",
              color: "#B5EAD7",
              bodyFn: () => {
                return (
                  <div
                    className="flex flex-column"
                    style={{ overflow: "auto", height: 325 }}
                  >
                    {activePlayer.tradeCandidateTeams.map((ownerId) => {
                      let owner = find(teamOwners, { owner_id: ownerId });
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
                                        Object.keys(positionalGrouping).length -
                                          1 ===
                                        i
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
            },
            // {
            //   icon: mdiListBoxOutline,
            //   title: "Roster",
            //   color: "#AEC6CF",
            //   bodyFn: () => (
            //     <PlayerList
            //       className="flex flex-column"
            //       hidePagination
            //       playerList={fullRoster}
            //       onPlayerClick={(player) => {}}
            //     />
            //   ),
            // },
          ]}
        />
      </div>
    </Content>
  );
};
export default PlayerDetails;
