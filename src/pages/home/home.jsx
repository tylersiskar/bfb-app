import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCustomMatchupData,
  useGetCurrentMatchupsQuery,
  useGetNflStateQuery,
  useGetRostersQuery,
} from "../../api/api";
import { selectTrades, selectWaiverPickups } from "../../api/transactionsSlice";
import { fetchTransactionsForYear } from "../../api/transactionsThunks";
import { Content } from "../../components/layout";
import Scoreboard from "../../components/scoreboard/scoreboard";
import AcquisitionCard from "./cards/acquisition";
import SummaryCard from "./cards/summary";
import TrendsCard from "./cards/trends";
import "./home.scss";

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
  const trades = useSelector(selectTrades);
  const waivers = useSelector(selectWaiverPickups);
  const matchupData = useSelector((state) =>
    selectCustomMatchupData(state, { rosters: data, matchups })
  );

  useEffect(() => {
    if (
      !nflState ||
      (Object.keys(trades).length > 0 && Object.keys(waivers).length > 0)
    )
      return; //if no active week yet, or trades and waivers already exist
    dispatch(fetchTransactionsForYear(nflState.week));
  }, [nflState]);
  return (
    <Content dark home isLoading={isLoading || nflStateIsLoading}>
      <Scoreboard matchups={Object.values(matchupData)} />
      <div className="home-body">
        <SummaryCard title="Top Players" href="/teams" rosters={data} />
        <TrendsCard title="Trending Teams" href="/trends" />
        <AcquisitionCard title="Top Acquisitions" href="/transactions" />
      </div>
    </Content>
  );
};

export default HomePage;
