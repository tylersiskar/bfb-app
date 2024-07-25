import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCustomMatchupData,
  useGetCurrentMatchupsQuery,
  useGetLeagueQuery,
  useGetNflStateQuery,
  useGetRostersQuery,
} from "../../api/api";
import { selectTrades, selectWaiverPickups } from "../../api/transactionsSlice";
import { fetchTransactionsForYear } from "../../api/transactionsThunks";
import { Content } from "../../components/layout";
import { StandingsList } from "../../components/standings";
import Scoreboard from "../../components/scoreboard/scoreboard";
import AcquisitionCard from "./cards/acquisition";
import SummaryCard from "./cards/summary";
import TrendsCard from "./cards/trends";
import MocksCard from "./cards/mocks";
import "./home.scss";
import { fetchStandings, selectStandings } from "../../api/standingsSlice";
import {
  fetchLeagues,
  selectLeagueId,
  selectLeagues,
  selectLeagueYear,
} from "../../api/leagueSlice";
import { Splash } from "../splash";

const HomePage = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetRostersQuery();
  const { data: nflState, isLoading: nflStateIsLoading } =
    useGetNflStateQuery();
  const { data: matchups } = useGetCurrentMatchupsQuery(
    nflState && nflState.week,
    {
      skip: nflStateIsLoading,
    }
  );
  const standings = useSelector(selectStandings);
  const trades = useSelector(selectTrades);
  const waivers = useSelector(selectWaiverPickups);
  const leagueId = useSelector(selectLeagueId);
  const leagueYear = useSelector(selectLeagueYear);
  const seasons = useSelector(selectLeagues);
  const matchupData = useSelector((state) =>
    selectCustomMatchupData(state, { rosters: data, matchups })
  );
  const { data: league } = useGetLeagueQuery(leagueId, { skip: !leagueId });

  let seasonType = league?.status === "pre_draft" ? "off-season" : "in-season";

  useEffect(() => {
    dispatch(fetchLeagues(leagueId));
  }, []);

  useEffect(() => {
    if (seasons && seasons.length > 1 && leagueYear) {
      dispatch(fetchStandings({ seasons, year: leagueYear - 1 }));
    }
  }, [seasons.length]);

  useEffect(() => {
    if (
      !nflState ||
      (Object.keys(trades).length > 0 && Object.keys(waivers).length > 0)
    )
      return; //if no active week yet, or trades and waivers already exist
    dispatch(fetchTransactionsForYear(nflState.week));
  }, [nflState]);

  if (league) {
    return (
      <Content dark home isLoading={isLoading || nflStateIsLoading}>
        <Scoreboard matchups={Object.values(matchupData)} />
        <div className="home-body" style={{ padding: 16 }}>
          {seasonType === "off-season" && (
            <div className="d-flex flex-column">
              <h2 style={{ paddingBottom: 12 }}>
                {nflState?.previous_season} Season Recap
              </h2>
              <StandingsList standings={standings ?? []} />
            </div>
          )}
          <SummaryCard
            title="Top Players"
            href="/teams"
            rosters={data}
            year={seasonType === "off-season" ? leagueYear - 1 : leagueYear}
          />
          {seasonType === "in-season" && (
            <>
              <TrendsCard title="Trending Teams" href="/trends" />
              {/* <AcquisitionCard title="Top Acquisitions" href="/transactions" /> */}
            </>
          )}
          {seasonType === "off-season" && (
            <MocksCard title="Mock Draft Center" href="/mocks" />
          )}
        </div>
      </Content>
    );
  } else {
    return <Splash />;
  }
};

export default HomePage;
