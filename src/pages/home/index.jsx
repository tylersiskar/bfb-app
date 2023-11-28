import { Content } from "../../components/layout";
import TrendsCard from "./cards/trends";
import "./home.scss";

const HomePage = () => {
  return (
    <Content dark home>
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
