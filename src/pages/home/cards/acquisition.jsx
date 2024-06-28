import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetStatsQuery,
  useGetUsersQuery,
} from "../../../api/api";
import {
  selectTrades,
  selectWaiverPickups,
} from "../../../api/transactionsSlice";
import { fetchTransactionsForYear } from "../../../api/transactionsThunks";
import { Avatar } from "../../../components/images";
import { keyBy, find } from "lodash";
import { useGetPlayersAllQuery } from "../../../api/bfbApi";

const AcquisitionCard = ({ href, title }) => {
  const dispatch = useDispatch();
  const { data: nflState } = useGetNflStateQuery();
  const waivers = useSelector(selectWaiverPickups);
  const trades = useSelector(selectTrades);
  const { data: stats } = useGetStatsQuery("2023");
  const { data: rosters } = useGetRostersQuery();
  const [topTrade, setTopTradeAdd] = useState();
  const [topWaiver, setTopWaiverAdd] = useState();
  const { data: users } = useGetUsersQuery();
  const { data: players } = useGetPlayersAllQuery();

  useEffect(() => {
    if (!nflState) return; //if no active week yet, or trades and waivers already exist
    dispatch(fetchTransactionsForYear(nflState.week));
  }, [nflState]);

  useEffect(() => {
    if (!trades || !waivers || !rosters || !stats) return;
    let keyByRosters = keyBy(rosters, "roster_id");
    let rosterOwnerObject = {};
    rosters.forEach((r) => {
      rosterOwnerObject[r.roster_id] = find(users, { user_id: r.owner_id });
    });
    let topTradeAdd = { ppg: 0 };
    let topWaiverAdd = { ppg: 0 };
    Object.keys(trades).forEach((week) => {
      // let adds =
      if (trades[week].length > 0) {
        trades[week].forEach((trade) => {
          if (!trade.adds) return;
          Object.keys(trade.adds).forEach((player) => {
            if (
              stats[player].pts_half_ppr / stats[player].gp >
              topTradeAdd.ppg
            ) {
              topTradeAdd = {
                name: `${players[player].first_name} ${players[player].last_name}`,
                position: players[player].position,
                nflTeam: players[player].team,
                team: rosterOwnerObject[trade.adds[player]].metadata.team_name,
                avatarId: rosterOwnerObject[trade.adds[player]].avatar,
                ppg: stats[player].pts_half_ppr / stats[player].gp,
              };
            }
          });
        });
      }
    });
    Object.keys(waivers).forEach((week) => {
      // let adds =
      if (waivers[week].length > 0) {
        waivers[week].forEach((waiver) => {
          if (!waiver.adds || waiver.status !== "complete") return;
          Object.keys(waiver.adds).forEach((player) => {
            if (!keyByRosters[waiver.adds[player]].players.includes(player))
              return;
            if (
              stats[player].pts_half_ppr / stats[player].gp >
              topWaiverAdd.ppg
            ) {
              topWaiverAdd = {
                name: `${players[player].first_name} ${players[player].last_name}`,
                position: players[player].position,
                nflTeam: players[player].team,
                team: rosterOwnerObject[waiver.adds[player]].metadata.team_name,
                avatarId: rosterOwnerObject[waiver.adds[player]].avatar,
                ppg: stats[player].pts_half_ppr / stats[player].gp,
              };
            }
          });
        });
      }
    });
    setTopTradeAdd(topTradeAdd);
    setTopWaiverAdd(topWaiverAdd);
  }, [trades, waivers]);
  return (
    <div className="summary">
      <Link
        className="flex flex-column  w-100 h-100"
        style={{
          textDecoration: "none",
          alignItems: "center",
        }}
        to={href}
      >
        <h3 className="w-100 lime" style={{ marginBottom: 24 }}>
          {title}
        </h3>
        <div
          className="w-100"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div className="flex flex-column align-center w-100">
            <div style={{ paddingBottom: 16 }}>
              <h2 className="light">Trade</h2>
            </div>
            {topTrade && (
              <>
                <Avatar avatarId={topTrade?.avatarId} />
                <div style={{ padding: "16px 0 8px" }}>
                  <h5>{topTrade.name}</h5>
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <p className="blue sm">
                    {topTrade.position} · {topTrade.nflTeam}
                  </p>
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <p className="blue sm">{topTrade.team}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-column align-center w-100">
            <div style={{ paddingBottom: 16 }}>
              <h2 className="light">Waiver</h2>
            </div>
            {topWaiver && (
              <>
                <Avatar avatarId={topWaiver?.avatarId} />
                <div style={{ padding: "16px 0 8px" }}>
                  <h5>{topWaiver.name}</h5>
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <p className="blue sm">
                    {topWaiver.position} · {topWaiver.nflTeam}
                  </p>
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <p className="blue sm">{topWaiver.team}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AcquisitionCard;
