import { useSelector } from "react-redux";
import {
  selectFullRosters,
  useGetCurrentMatchupsQuery,
  useGetNflStateQuery,
  useGetRostersQuery,
} from "../../api/api";
import { Content } from "../../components/layout";
import Scoreboard from "../../components/scoreboard/scoreboard";
import TrendsCard from "./cards/trends";
import "./home.scss";

const HomePage = () => {
  const { data, isLoading } = useGetRostersQuery();
  const { data: nflState, isLoading: nflStateIsLoading } =
    useGetNflStateQuery();
  const { data: matchups, isLoading: matchupsIsLoading } =
    useGetCurrentMatchupsQuery(nflState && nflState.week, {
      skip: nflStateIsLoading,
    });
  const mutatedData = useSelector((state) =>
    selectFullRosters(state, { rosters: data, matchups })
  );

  return (
    <Content dark home isLoading={isLoading}>
      <Scoreboard matchups={Object.values(mutatedData)} />
      <div className="home-body">
        {/* <SummaryCard
          title="Players"
          subtitle="This should show top players at each position and their team"
          href="/teams"
        />
        <SummaryCard
          title="Drafts"
          subtitle="Best Draft pick at each position and their team"
          href="/drafts"
        /> */}
        <TrendsCard title="Trending Teams" href="/trends" />
      </div>
    </Content>
  );
};

export default HomePage;
