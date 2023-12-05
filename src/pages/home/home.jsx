import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCustomMatchupData,
  useGetCurrentMatchupsQuery,
  useGetNflStateQuery,
  useGetRostersQuery,
} from "../../api/api";
import { fetchTransactionsForYear } from "../../api/transactionsThunks";
import { Content } from "../../components/layout";
import Scoreboard from "../../components/scoreboard/scoreboard";
import AcquisitionCard from "./cards/acquisition";
import SummaryCard from "./cards/summary";
import TrendsCard from "./cards/trends";
import "./home.scss";

const HomePage = () => {
  const { data, isLoading } = useGetRostersQuery();
  const { data: nflState, isLoading: nflStateIsLoading } =
    useGetNflStateQuery();
  const { data: matchups } = useGetCurrentMatchupsQuery(
    nflState && nflState.week,
    {
      skip: nflStateIsLoading,
    }
  );
  const matchupData = useSelector((state) =>
    selectCustomMatchupData(state, { rosters: data, matchups })
  );
  const dispatch = useDispatch();

  useEffect(() => {
    nflState &&
      nflState.week &&
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
