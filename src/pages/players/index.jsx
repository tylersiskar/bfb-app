import { Content } from "../../components/layout";
import PlayerDetails from "./player-details";

const PlayerDetailsPage = ({ isFetching = false }) => {
  return (
    <Content dark isLoading={isFetching} home>
      <PlayerDetails />
    </Content>
  );
};

export default PlayerDetailsPage;
