const TopDrawer = ({ isVisible, isExpanded, playerListExpanded, children }) => {
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
