import { Content } from "../../components/layout";
import SummaryCard from "./cards/summary";
import "./home.scss";

const HomePage = () => {
  return (
    <Content dark home>
      <h3 style={{ margin: 24 }}>
        Welcome to the Bad Franchise Builders' Site
      </h3>
      <div className="home-body">
        <SummaryCard
          title="Players"
          subtitle="This should show top players at each position and their team"
          href="/teams"
        />
        <SummaryCard
          title="Drafts"
          subtitle="Best Draft pick at each position and their team"
          href="/drafts"
        />
        <SummaryCard
          title="Trends"
          subtitle="Hottest/Coldest Team"
          href="/trends"
        />
      </div>
    </Content>
  );
};

export default HomePage;
