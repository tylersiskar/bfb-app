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
import {
  mdiArrowDownThin,
  mdiArrowUpThin,
  mdiChevronLeft,
  mdiCloseBoxOutline,
  mdiListBoxOutline,
  mdiTrashCanOutline,
} from "@mdi/js";
import { Button, IconButton } from "../../components/buttons";
import { PlayerList } from "../../components/list-items";
import {
  selectActiveSlot,
  selectDraftedPlayers,
  updateDraftedPlayers,
  setActiveSlot,
  clearDraftedPlayers,
  setFullDraft,
} from "../../api/draftSlice";
import {
  selectNonKeepers,
  useGetMockQuery,
  useGetMocksQuery,
  useGetPlayersQuery,
  usePostMockMutation,
} from "../../api/bfbApi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { find } from "lodash";
import RosterPanel from "./roster-panel";

const MockNew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [mockName, setMockName] = useState("");
  const [expandList, setExpandList] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [pickIdx, setPickIdx] = useState(0);
  const [page, setPage] = useState(1);
  const [position, setPosition] = useState();
  const [rookies, setRookies] = useState("");
  const { data: tradedPicks } = useGetTradedPicksQuery("2024");
  const { data, isLoading } = useGetRostersQuery();
  const { data: nflState } = useGetNflStateQuery();
  const activeSlot = useSelector(selectActiveSlot);
  const standings = useSelector(selectStandings);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const { data: players } = useGetPlayersQuery({ page, position, rookies });
  const { refetch: fetchMocks } = useGetMocksQuery();
  const { data: currentMock } = useGetMockQuery({ id }, { skip: !id });
  const [postMock, { isSuccess }] = usePostMockMutation();
  const draftOrderWithTrades = useSelector((state) =>
    selectDraftOrder(state, {
      standings,
      tradedPicks,
      rosters: data,
    })
  );
  const nonKeepers = useSelector((state) =>
    selectNonKeepers(state, { rosters: data, players })
  );

  const [openPanel, setOpenPanel] = useState(false);

  useEffect(() => {
    if (currentMock) dispatch(setFullDraft(currentMock[0].picks));
    else dispatch(clearDraftedPlayers());
  }, [currentMock]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(clearDraftedPlayers());
      fetchMocks();
      navigate("/mocks");
    }
  }, [isSuccess]);

  useEffect(() => {
    dispatch(fetchStandings());
  }, [dispatch]);

  const _onDraft = (player) => {
    let filteredDraftedPlayers = draftedPlayers.filter((obj) => {
      if (obj.round === activeSlot.round) {
        if (obj.pick === activeSlot.pick) {
          return false;
        } else return true;
      } else return true;
    });
    dispatch(
      updateDraftedPlayers([
        ...filteredDraftedPlayers,
        {
          ...player,
          round: activeSlot.round,
          pick: activeSlot.pick,
          roster_id: activeSlot.roster_id,
        },
      ])
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

  const _setPosition = (e) => {
    if (position === e.target.id) setPosition();
    else setPosition(e.target.id);
  };
  const handleSubmit = async (mockData) => {
    try {
      await postMock({
        picks: JSON.stringify(mockData),
        name: mockName,
      });
    } catch (error) {
      // Handle error
    }
  };
  return (
    <Content dark isLoading={isLoading}>
      <div className="home-body">
        <div className="d-flex flex-column">
          <div className="flex justify-between mb-1">
            <Link className="flex align-center justify-start p-2" to="/mocks">
              <IconButton className="p-0" icon={mdiChevronLeft} />
              <p className="light"> Back</p>
            </Link>
            {currentMock ? (
              <p
                className="light d-flex align-center"
                style={{ paddingRight: 16 }}
              >
                {currentMock[0].name}
              </p>
            ) : (
              <input
                onChange={(e) => setMockName(e.target.value)}
                style={{
                  background: "black",
                  color: "white",
                  height: "36px",
                  width: "86px",
                  marginRight: "16px",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 8px",
                  fontStyle: "italic",
                  outline: "none",
                  display: id ? "none" : "block",
                }}
                placeholder="Mock Name"
              />
            )}
          </div>
          <div className="flex justify-between" style={{ padding: "0 16px" }}>
            <h2> {nflState?.season} Draft Order</h2>
            {draftedPlayers.length > 0 && (
              <div>
                <Button
                  className={`${id ? "d-none" : ""} bg-${
                    mockName ? "lime" : "gray"
                  } button-sm flex align-center p-1`}
                  style={{
                    borderColor: mockName ? "#54d846" : "rgb(206, 206, 206)",
                  }}
                  onClick={() => mockName && handleSubmit(draftedPlayers)}
                  dispatch={!mockName}
                >
                  <p className="sm dark bold">SUBMIT MOCK</p>
                </Button>
              </div>
            )}
          </div>
          <Draftboard
            standings={standings}
            rosters={data}
            onSelectPick={(pick, roundIdx, pickIdx) => {
              setRoundIdx(roundIdx);
              setPickIdx(pickIdx);
              setExpandList(true);
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
              height: "40dvh",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <h5>Trades Made (Coming soon...)</h5>
          </div>
          <RosterPanel
            isExpanded={openPanel}
            playerListExpanded={expandList}
            isVisible={!!Object.keys(activeSlot).length}
            activeSlot={activeSlot}
            draftedPlayers={draftedPlayers}
          />
          <div
            className={`bottom-drawer ${id ? "d-none" : ""} ${
              expandList
                ? openPanel
                  ? "half-expanded"
                  : "expanded"
                : "collapsed"
            }`}
          >
            <div className="flex w-100 justify-between">
              <div>
                {!!Object.keys(activeSlot).length ? (
                  <div className="flex flex-column">
                    <h6 className="pb-1">Active Draft Selection</h6>
                    <div className="flex align-end">
                      <p className="light pb-1 pr-1 bold">{activeSlot.team} </p>
                      <p className="light sm pb-1">
                        Pick {activeSlot.round}.{activeSlot.pick}
                      </p>
                    </div>
                  </div>
                ) : (
                  <h6 className="">Select Draft Position</h6>
                )}
              </div>
              <div className="flex align-center">
                {!!find(draftedPlayers, {
                  round: activeSlot.round,
                  pick: activeSlot.pick,
                }) && (
                  <IconButton
                    icon={mdiTrashCanOutline}
                    title="Remove Selection"
                    iconColor="#ff3f5d"
                    onClick={() => {
                      dispatch(
                        updateDraftedPlayers(
                          draftedPlayers.filter(
                            (player) =>
                              !(
                                player.round === activeSlot.round &&
                                player.pick === activeSlot.pick
                              )
                          )
                        )
                      );
                    }}
                  />
                )}
                {Object.keys(activeSlot).length > 0 && (
                  <IconButton
                    icon={openPanel ? mdiCloseBoxOutline : mdiListBoxOutline}
                    onClick={() => setOpenPanel(!openPanel)}
                  />
                )}
                <IconButton
                  icon={expandList ? mdiArrowDownThin : mdiArrowUpThin}
                  onClick={() => setExpandList(!expandList)}
                />
              </div>
            </div>
            <div className="flex my-2">
              <Button
                className="button-sm inverted mr-2"
                id="QB"
                onClick={_setPosition}
                active={position === "QB"}
              >
                QB
              </Button>
              <Button
                className="button-sm inverted mr-2"
                id="RB"
                onClick={_setPosition}
                active={position === "RB"}
              >
                RB
              </Button>
              <Button
                className="button-sm inverted mr-2"
                id="WR"
                onClick={_setPosition}
                active={position === "WR"}
              >
                WR
              </Button>
              <Button
                className="button-sm inverted mr-2"
                id="TE"
                onClick={_setPosition}
                active={position === "TE"}
              >
                TE
              </Button>
              <Button
                className="button-sm inverted"
                onClick={() => setRookies(!rookies ? "true" : "")}
                active={!!rookies}
              >
                Rookies
              </Button>
            </div>
            <PlayerList
              onDraft={_onDraft}
              players={nonKeepers}
              scrollHeight={`calc(${
                expandList ? "75dvh" : activeSlot ? "40dvh" : "170px"
              } - 136px)`}
              page={page}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
    </Content>
  );
};

export default MockNew;
