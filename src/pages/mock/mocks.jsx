import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDraftOrder,
  useGetNflStateQuery,
  useGetRostersQuery,
  useGetTradedPicksQuery,
} from "../../api/api";
import { Content } from "../../components/layout";
import "../home/home.scss";
import { fetchStandings, selectStandings } from "../../api/standingsSlice";
import Draftboard from "../../components/draftboard/draftboard";
import { mdiArrowDownThin, mdiArrowUpThin } from "@mdi/js";
import { IconButton } from "../../components/buttons";
import { PlayerList } from "../../components/list-items";
import {
  selectActiveSlot,
  selectDraftedPlayers,
  updateDraftedPlayers,
  setActiveSlot,
} from "../../api/draftSlice";

const MockDraftCenter = () => {
  const dispatch = useDispatch();
  const [expandList, setExpandList] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [pickIdx, setPickIdx] = useState(0);
  const { data: tradedPicks } = useGetTradedPicksQuery("2024");
  const { data, isLoading } = useGetRostersQuery();
  const { data: nflState } = useGetNflStateQuery();
  const activeSlot = useSelector(selectActiveSlot);
  const standings = useSelector(selectStandings);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const draftOrderWithTrades = useSelector((state) =>
    selectDraftOrder(state, {
      standings,
      tradedPicks,
      rosters: data,
    })
  );

  useEffect(() => {
    dispatch(fetchStandings());
  }, [dispatch]);

  const _onDraft = (player) => {
    dispatch(
      updateDraftedPlayers({
        ...player,
        round: activeSlot.round,
        pick: activeSlot.pick,
      })
    );
    if (pickIdx === 11) {
      setRoundIdx(roundIdx + 1);
      setPickIdx(0);
      dispatch(setActiveSlot(draftOrderWithTrades[roundIdx + 1][0]));
    } else {
      setRoundIdx(roundIdx);
      setPickIdx(pickIdx + 1);
      dispatch(setActiveSlot(draftOrderWithTrades[roundIdx][pickIdx + 1]));
    }
  };

  return (
    <Content dark isLoading={isLoading}>
      <div className="home-body">
        <div className="d-flex flex-column">
          <h2 style={{ padding: "0 24px" }}> {nflState?.season} Draft Order</h2>
          <Draftboard
            standings={standings}
            rosters={data}
            onSelectPick={(pick, roundIdx, pickIdx) => {
              setRoundIdx(roundIdx);
              setPickIdx(pickIdx);
              setExpandList(false);
            }}
            selectedPick={activeSlot}
            draftedPlayers={draftedPlayers}
            draftOrderWithTrades={draftOrderWithTrades}
          />
          <div
            style={{
              borderTop: "1px solid white",
              padding: "8px 16px",
              marginTop: 8,
              width: "100%",
              height: "50vh",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <h5>Trades Made (Coming soon...)</h5>
          </div>
          <div
            className={`bottom-drawer ${
              !!Object.keys(activeSlot).length
                ? "half-expanded"
                : expandList
                ? "expanded"
                : ""
            }`}
          >
            <div className="flex w-100 justify-between">
              <div>
                {!!Object.keys(activeSlot).length && (
                  <div className="flex flex-column">
                    <h6 className="pb-1">Active Draft Selection</h6>
                    <p className="light pb-1">{activeSlot.team}</p>
                    <p className="light pb-1">
                      {activeSlot.round}.{activeSlot.pick}
                    </p>
                  </div>
                )}
              </div>
              <IconButton
                icon={
                  Object.keys(activeSlot).length > 0 || expandList
                    ? mdiArrowDownThin
                    : mdiArrowUpThin
                }
                onClick={() => {
                  dispatch(setActiveSlot({}));
                  if (Object.keys(activeSlot).length > 0) {
                    setExpandList(false);
                  } else {
                    setExpandList(!expandList);
                  }
                }}
              />
            </div>
            <PlayerList
              onDraft={_onDraft}
              scrollHeight={expandList ? "70vh" : activeSlot ? "50vh" : "170px"}
            />
          </div>
        </div>
      </div>
    </Content>
  );
};

export default MockDraftCenter;
