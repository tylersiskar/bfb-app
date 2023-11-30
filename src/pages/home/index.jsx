import { useSelector } from "react-redux";
import {
  selectCustomMatchupData,
  useGetCurrentMatchupsQuery,
  useGetNflStateQuery,
  useGetRostersQuery,
} from "../../api/api";
import { Content } from "../../components/layout";
import Scoreboard from "../../components/scoreboard/scoreboard";
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

  return (
    <Content dark home isLoading={isLoading}>
      <Scoreboard matchups={Object.values(matchupData)} />
      <div className="home-body">
        <SummaryCard title="Top Players" href="/teams" />
        <TrendsCard title="Trending Teams" href="/trends" />
      </div>
    </Content>
  );
};

export default HomePage;
