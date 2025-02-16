import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./cards.scss";
import {
  selectDraftOrder,
  useGetRostersQuery,
  useGetTradedPicksQuery,
} from "../../../api/api";
import { selectStandings } from "../../../api/standingsSlice";
import { selectDraftedPlayers } from "../../../api/draftSlice";
import Draftboard from "../../../components/draftboard/draftboard";
import { selectLeagueYear } from "../../../api/selectors/leagueSelectors";
import { mdiRefresh } from "@mdi/js";
import IconButton from "../../../components/buttons/icon-button";

const MocksCard = ({
  title,
  subtitle,
  href,
  onActionClick,
  actionIsLoading,
}) => {
  const year = useSelector(selectLeagueYear);
  const { data: tradedPicks } = useGetTradedPicksQuery(year, { skip: !year });
  const { data } = useGetRostersQuery();
  const standings = useSelector(selectStandings);
  const draftedPlayers = useSelector(selectDraftedPlayers);
  const draftOrderWithTrades = useSelector((state) =>
    selectDraftOrder(state, {
      standings,
      tradedPicks,
      year,
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
        <div
          className="flex justify-between w-100"
          style={{ marginBottom: 16 }}
        >
          <h3 className="w-100 lime">{title}</h3>
          {onActionClick && (
            <IconButton
              icon={mdiRefresh}
              title="Refresh"
              onClick={(e) => {
                e.preventDefault();
                onActionClick();
              }}
              iconColor={"#54d846"}
              isLoading={actionIsLoading}
            />
          )}
        </div>
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
