import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDraftOrder,
  useGetRostersQuery,
  useGetTradedPicksQuery,
  useGetUsersQuery,
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
  mdiRefresh,
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
  selectKeepers,
  useGetMockQuery,
  useGetMocksQuery,
  usePostMockMutation,
  useGetPlayersAllQuery,
  useGetPlayerValueMutation,
} from "../../api/bfbApi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import find from "lodash/find";
import sortBy from "lodash/sortBy";

import { fetchLeagues } from "../../api/leagueSlice";
import {
  selectLeagueId,
  selectLeagues,
  selectLeagueYear,
} from "../../api/selectors/leagueSelectors";

import useActiveRoster from "./useActiveRoster";
import html2canvas from "html2canvas";
import { Helmet, HelmetProvider } from "react-helmet-async";
import PlayerDetails from "../players/player-details";
import TopDrawer from "./roster-panel";

let URL = `https://s3.amazonaws.com/badfranchisebuilders.com/thumbnails/{IMAGE}`;

const captureScreenshot = async () => {
  const element = document.getElementById("round_1"); // You can target a specific element if needed
  const canvas = await html2canvas(element);
  const image = canvas.toDataURL("image/jpeg"); // Use JPEG and adjust quality for compression
  return image;
};

const MockNew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { state } = location;
  let name = state ? state.name : null;
  const [expandList, setExpandList] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [pickIdx, setPickIdx] = useState(0);
  const [position, setPosition] = useState();
  const [rookies, setRookies] = useState("");
  const [activePlayerId, setActivePlayerId] = useState("");
  const year = useSelector(selectLeagueYear);
  const { data: tradedPicks } = useGetTradedPicksQuery(year, { skip: !year });
  const { data, isLoading } = useGetRostersQuery();
  const { data: users } = useGetUsersQuery();
  const activeSlot = useSelector(selectActiveSlot);
  const standings = useSelector(selectStandings);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const seasons = useSelector(selectLeagues);
  const { refetch: fetchMocks } = useGetMocksQuery();
  const { data: currentMock } = useGetMockQuery({ id }, { skip: !id });
  const [postMock, { isSuccess }] = usePostMockMutation();
  const [updatePlayerRankings, { isLoading: isRefreshing }] =
    useGetPlayerValueMutation();
  const draftOrderWithTrades = useSelector((state) =>
    selectDraftOrder(state, {
      standings,
      tradedPicks,
      year,
    })
  );
  const { data: playersAll } = useGetPlayersAllQuery({ year });
  const leagueId = useSelector(selectLeagueId);
  let current = find(seasons, { league_id: leagueId });
  const keepers = useSelector((state) =>
    selectKeepers(state, {
      rosters: data,
      players: playersAll,
      leagueType: current?.settings?.type,
    })
  );

  const nonKeepers = useSelector((state) =>
    selectNonKeepers(state, {
      rosters: data,
      players: playersAll,
    })
  );
  let availablePlayers = nonKeepers.filter(
    (p) => !find(draftedPlayers, { id: p.id })
  );

  // const [trigger, { data: playerValue, isFetching: playerValueIsLoading }] =
  //   useLazyGetPlayerValueQuery();

  const {
    activeRoster,
    activeId,
    isFetching: isActiveRosterFetching,
  } = useActiveRoster();

  // const updatePlayerValueList = (newDrafted) => {
  //   if (isActiveRosterFetching) return;
  //   let drafted = newDrafted ?? draftedPlayers;
  //   trigger({ activeRoster, draftedPlayers: [...drafted, ...keepers] });
  // };

  // useEffect(updatePlayerValueList, [
  //   activeId,
  //   activeSlot,
  //   isActiveRosterFetching,
  // ]);

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
    dispatch(fetchLeagues(leagueId));
  }, [dispatch]);

  useEffect(() => {
    if (seasons.length > 0 && users)
      dispatch(fetchStandings({ seasons, users, year: year - 1 }));
  }, [seasons, users]);

  const _onDraft = (player) => {
    let filteredDraftedPlayers = draftedPlayers.filter((obj) => {
      if (obj.round === activeSlot.round) {
        if (obj.pick === activeSlot.pick) {
          return false;
        } else return true;
      } else return true;
    });
    let newDraftedPlayers = [
      ...filteredDraftedPlayers,
      {
        ...player,
        round: activeSlot.round,
        pick: activeSlot.pick,
        roster_id: activeSlot.roster_id,
      },
    ];
    if (pickIdx === 11) {
      setRoundIdx(roundIdx + 1);
      setPickIdx(0);
      dispatch(setActiveSlot(draftOrderWithTrades[roundIdx + 1][0]));
    } else {
      setRoundIdx(roundIdx);
      setPickIdx(pickIdx + 1);
      dispatch(setActiveSlot(draftOrderWithTrades[roundIdx][pickIdx + 1]));
    }
    dispatch(updateDraftedPlayers(newDraftedPlayers));
  };

  const _setPosition = (e) => {
    if (position === e.target.id) setPosition();
    else setPosition(e.target.id);
  };

  const _getPlayerList = () => {
    if (position) {
      return availablePlayers.filter((p) => p.position === position);
    } else return availablePlayers ?? [];
    // if (position) {
    //   return playerValue.filter((p) => p.POS === position);
    // } else return playerValue ?? [];
  };
  const handleSubmit = async (mockData) => {
    let image = await captureScreenshot();
    try {
      await postMock({
        picks: JSON.stringify(mockData),
        name: name,
        image,
      });
    } catch (error) {
      console.log(error);
      // Handle error
    }
  };
  return (
    <HelmetProvider>
      <>
        <Helmet>
          <meta
            property="og:image"
            content={
              currentMock && URL.replace("{IMAGE}", currentMock[0].thumbnail)
            }
          />
          <meta property="og:url" content={window.location.href} />
        </Helmet>
        <Content dark isLoading={isLoading}>
          <div className="home-body">
            <div className="d-flex flex-column">
              <div className="flex justify-between mb-1">
                <Link
                  className="flex align-center justify-start p-2"
                  to="/mocks"
                >
                  <IconButton className="p-0" icon={mdiChevronLeft} />
                  <p className="light"> Back</p>
                </Link>
              </div>
              <div
                className="flex justify-between"
                style={{ padding: "0 16px" }}
              >
                <h2> {`${currentMock ? currentMock[0].name : name}'s Mock`}</h2>
                {draftedPlayers.length > 0 && (
                  <div>
                    <Button
                      className={`${id ? "d-none" : ""} bg-${
                        name ? "lime" : "gray"
                      } button-sm flex align-center p-1`}
                      style={{
                        borderColor: name ? "#54d846" : "rgb(206, 206, 206)",
                      }}
                      onClick={() => name && handleSubmit(draftedPlayers)}
                      dispatch={!name}
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
                  height: "40svh",
                  overflowY: "auto",
                  boxSizing: "border-box",
                }}
              >
                <h5>Trades Made (Coming soon...)</h5>
              </div>
              <TopDrawer
                isExpanded={openPanel || !!activePlayerId}
                playerListExpanded={expandList}
                isVisible={!!Object.keys(activeSlot).length || !!activePlayerId}
              >
                {activePlayerId ? (
                  <PlayerDetails activePlayerId={activePlayerId} />
                ) : (
                  <>
                    <h6>Current Roster</h6>
                    <PlayerList
                      isRoster
                      playerList={sortBy(activeRoster, "position")}
                      scrollHeight={`calc(${!expandList ? 55 : 25}svh - 60px)`}
                      hidePagination
                      actionColumn={(player) => (
                        <Button
                          style={{
                            height: 32,
                            background: player.isKeeper && "transparent",
                            borderColor:
                              player.isKeeper && "rgb(206, 206, 206)",
                          }}
                          className={player.isKeeper ? "p-1" : "bg-lime p-1"}
                        >
                          <p
                            className={
                              player.isKeeper ? "sm light bold" : "sm dark bold"
                            }
                          >
                            {player.isKeeper ? "Kept" : "NEW"}
                          </p>
                        </Button>
                      )}
                    />
                  </>
                )}
              </TopDrawer>
              <div
                className={`bottom-drawer ${id ? "d-none" : ""} ${
                  expandList
                    ? openPanel || !!activePlayerId
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
                          <p className="light pb-1 pr-1 bold">
                            {activeSlot.team}{" "}
                          </p>
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
                    {/* {playerValueIsLoading && (
                    <Icon
                      path={mdiLoading}
                      title={"loading"}
                      color={"#808080"}
                      size={1}
                      className="loading-icon"
                    />
                  )} */}
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
                          // updatePlayerValueList(
                          //   draftedPlayers.filter(
                          //     (player) =>
                          //       !(
                          //         player.round === activeSlot.round &&
                          //         player.pick === activeSlot.pick
                          //       )
                          //   )
                          // );
                        }}
                      />
                    )}
                    {Object.keys(activeSlot).length > 0 && (
                      <IconButton
                        icon={
                          openPanel ? mdiCloseBoxOutline : mdiListBoxOutline
                        }
                        onClick={() => {
                          setActivePlayerId("");
                          setOpenPanel(!openPanel);
                        }}
                      />
                    )}
                    <IconButton
                      icon={expandList ? mdiArrowDownThin : mdiArrowUpThin}
                      onClick={() => setExpandList(!expandList)}
                    />
                    <IconButton
                      icon={mdiRefresh}
                      title="Refresh"
                      onClick={() => {
                        updatePlayerRankings(year);
                      }}
                      iconColor={"#54d846"}
                      isLoading={isRefreshing}
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
                  {/* <Button
                className="button-sm inverted"
                onClick={() => setRookies(!rookies ? "true" : "")}
                active={!!rookies}
              >
                Rookies
              </Button> */}
                </div>
                <PlayerList
                  onDraft={_onDraft}
                  scrollHeight={`calc(${
                    expandList
                      ? openPanel || !!activePlayerId
                        ? "40svh"
                        : "55svh"
                      : "170px"
                  } - 136px)`}
                  playerList={_getPlayerList()}
                  onPlayerClick={(player) => setActivePlayerId(player.id)}
                  // playerValueIsFetching={playerValueIsLoading}
                />
              </div>
            </div>
          </div>
        </Content>
      </>
    </HelmetProvider>
  );
};

export default MockNew;
