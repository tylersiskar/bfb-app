import { sortBy } from "lodash";
import { PlayerList } from "../../components/list-items";
import { Button } from "../../components/buttons";

const TopDrawer = ({
  isVisible,
  isExpanded,
  playerListExpanded,
  activeRoster,
  children,
}) => {
  return (
    <div
      className={`roster-panel ${isVisible ? "visible" : ""}  ${
        isExpanded
          ? playerListExpanded
            ? "panel-expanded"
            : "panel-full-expanded"
          : ""
      }`}
    >
      {isExpanded && children}
    </div>
  );
};

export default TopDrawer;
