import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { VerticalListItem } from "../../../components/list-items";
import "./cards.scss";
import {
  selectDraftOrder,
  useGetRostersQuery,
  useGetTradedPicksQuery,
} from "../../../api/api";
import { selectStandings } from "../../../api/standingsSlice";
import { selectDraftedPlayers } from "../../../api/draftSlice";
import Draftboard from "../../../components/draftboard/draftboard";

const MocksCard = ({ title, subtitle, href }) => {
  const { data: tradedPicks } = useGetTradedPicksQuery("2024");
  const { data, isLoading } = useGetRostersQuery();

  const standings = useSelector(selectStandings);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const draftOrderWithTrades = useSelector((state) =>
    selectDraftOrder(state, {
      standings,
      tradedPicks,
      rosters: data,
    })
  );
  return (
    <div className="summary">
      <Link
        className="flex flex-column w-100 h-100"
        style={{
          textDecoration: "none",
          alignItems: "center",
        }}
        to={href}
      >
        <h3 className="w-100 lime" style={{ marginBottom: 16 }}>
          {title}
        </h3>
        <Draftboard
          rounds={1}
          width="100%"
          standings={standings}
          rosters={data}
          selectedPick={{}}
          draftedPlayers={draftedPlayers}
          draftOrderWithTrades={draftOrderWithTrades}
        />
      </Link>
    </div>
  );
};

export default MocksCard;
