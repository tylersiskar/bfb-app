import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Scatter } from "react-chartjs-2";
import {
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetStatsQuery,
} from "../../api/api";
import { selectTrades, selectWaiverPickups } from "../../api/transactionsSlice";
import { fetchTransactionsForYear } from "../../api/transactionsThunks";
import { Content } from "../../components/layout";
import Button from "../../components/buttons/button";

import { find, keyBy, groupBy } from "lodash";
import users from "../../sleeper/users.json";
import players from "../../sleeper/players.json";

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
  "cyan",
];
const TransactionsPage = (props) => {
  const dispatch = useDispatch();
  const { data: nflState, isLoading: nflStateIsLoading } =
    useGetNflStateQuery();
  const waivers = useSelector(selectWaiverPickups);
  const trades = useSelector(selectTrades);
  const { data: rosters, isLoading: rostersIsLoading } = useGetRostersQuery();
  const { data: stats, isLoading: statsIsLoading } = useGetStatsQuery("2023");
  const [acquisitions, setAcquisitions] = useState();
  const [acquisitionType, setAcquisitionType] = useState("trades");
  const [datasets, setDatasets] = useState([]);
  const _getTeamName = (value) => {
    let roster = find(rosters, { roster_id: value });
    if (!!roster) {
      return find(users, { user_id: roster.owner_id }).display_name;
    }
    return value;
  };

  const createAcquisitonArray = (acquistionArray) => {
    let keyByRosters = keyBy(rosters, "roster_id");
    let rosterOwnerObject = {};
    rosters &&
      rosters.forEach((r) => {
        rosterOwnerObject[r.roster_id] = find(users, { user_id: r.owner_id });
      });
    return Object.keys(acquistionArray).map((week) => {
      return acquistionArray[week]
        .filter((a) => a.status === "complete")
        .map((trade) => {
          let { type } = trade;
          const playersObj = (obj, drop) =>
            obj
              ? Object.keys(obj).map((player) => {
                  const user = rosterOwnerObject[obj[player]];
                  if (
                    (keyByRosters[obj[player]].players.includes(player) ||
                      drop) &&
                    stats[player].gp > 1
                  ) {
                    return {
                      week: trade.leg,
                      avatar: user.avatar,
                      teamName: user.display_name,
                      x: obj[player],
                      y: stats[player]?.pos_rank_half_ppr || 0,
                      player:
                        players[player]?.full_name ||
                        `${players[player].first_name} ${players[player].last_name}`,
                      ppg: stats[player]
                        ? (
                            stats[player].pts_half_ppr / stats[player].gp
                          )?.toFixed(2)
                        : 0,
                      rank: stats[player]?.pos_rank_half_ppr || 0,
                      position: players[player]?.position || "",
                    };
                  } else {
                    return null;
                  }
                })
              : [];

          return {
            acquiredPlayers: playersObj(trade.adds).filter((obj) => !!obj),
            droppedPlayers: playersObj(trade.drops, true), // dont filter out dropped players, want to show what was given up in trades
            acquisitionType: type,
            [type === "trade" ? "picks" : "faab"]:
              type === "trade" ? trade.draft_picks : trade.settings.waiver_bid,
          };
        })
        .filter((obj) => obj.acquiredPlayers.length > 0);
    });
  };

  /** Need to create an object of {player:, ppg: , acquisitionType:, teamname , rank} */

  /** graph that has y axis rank, x axis team, tooltip that shows PPG. radius size based on FAAB  */
  useEffect(() => {
    if (!rosters || !nflState || !stats || !trades) return;
    let newTradeArray =
      Object.keys(trades).length === nflState.week + 1 &&
      createAcquisitonArray(trades);
    let newWaiverArray =
      Object.keys(waivers).length === nflState.week + 1 &&
      createAcquisitonArray(waivers, "waiver");

    if (newTradeArray && newWaiverArray)
      setAcquisitions({ trades: newTradeArray, waivers: newWaiverArray });
  }, [trades, rosters, stats, nflState, waivers]);

  useEffect(() => {
    nflState &&
      nflState.week &&
      dispatch(fetchTransactionsForYear(nflState.week));
  }, [nflState]);

  useEffect(() => {
    if (acquisitions) {
      let newAcquisition = [
        ...acquisitions?.[acquisitionType]
          .flat(1)
          .map((obj) => obj.acquiredPlayers)
          .flat(1),
      ];
      newAcquisition = groupBy(newAcquisition, "position");
      newAcquisition = Object.keys(newAcquisition).map((team, i) => {
        return {
          label: team,
          data: newAcquisition[team],
          pointRadius: 7,
          pointHoverRadius: 12,
          backgroundColor: colors[i],
        };
      });
      setDatasets(newAcquisition);
    }
  }, [acquisitionType, acquisitions]);

  return (
    <Content
      isLoading={
        nflStateIsLoading ||
        rostersIsLoading ||
        statsIsLoading ||
        datasets.length === 0
      }
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
          <h2 style={{ margin: 0 }}>Acquisitions By Team</h2>
          <h4 className="subtitle" style={{ margin: "12px 0" }}>
            Toggle Acquisition Type
          </h4>
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
              setAcquisitionType(
                acquisitionType === e.target.id ? null : e.target.id
              )
            }
            id="trades"
            active={acquisitionType === "trades"}
          >
            Trades
          </Button>
          <Button
            onClick={(e) =>
              setAcquisitionType(
                acquisitionType === e.target.id ? null : e.target.id
              )
            }
            id="waivers"
            active={acquisitionType === "waivers"}
          >
            Waiver
          </Button>
        </div>
      </div>
      <Scatter
        data={{ datasets }}
        options={{
          maintainAspectRatio: window.innerWidth > 767,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  if (context.raw.week === 1)
                    return `${context.raw.player} \n Week ${context.raw.week} or OFF\n\n Pos. Rank: ${context.raw.rank} \n\nPPG: ${context.raw.ppg}`;
                  return `${context.raw.player} \n Week ${context.raw.week}\n\n Pos. Rank: ${context.raw.rank} \n\nPPG: ${context.raw.ppg}`;
                },
              },
            },
          },
          scales: {
            y: {
              reverse: true,
              beginAtZero: true,
              title: {
                display: true,
                text: "Rank",
              },
              ticks: {
                stepSize: 10,
              },
              border: {
                width: 2,
                color: "black",
              },
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
                text: "Team",
              },
              grid: {
                display: true,
              },
            },
          },
        }}
      />
    </Content>
  );
};

export default TransactionsPage;
