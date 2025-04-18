import { mdiMagnify } from "@mdi/js";
import { Link } from "react-router-dom";
import IconButton from "../buttons/icon-button";

const DropdownMenu = ({ items = [] }) => {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        top: 32,
        left: 0,
        right: 0,
        background: "#1f2126",
        color: "gray",
        height: items.length ? 150 : 0,
        overflow: "scroll",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        boxShadow: "0 0 4px gray",
      }}
    >
      {items.map((player) => {
        return (
          <Link
            style={{ textDecoration: "none" }}
            to={`/players/${player.id}`}
            key={player.id}
          >
            <div
              style={{
                height: "48px",
                borderBottom: "1px solid #A7A7A7",
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
              }}
            >
              <img
                src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`}
                style={{ height: "75%" }}
              />
              <div className="flex-column flexm pl-2">
                <p className="sm light">{player.full_name}</p>
                <p className="x-sm light">
                  {player.position} • {player.team}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const SearchInput = ({
  onSearch,
  onSearchClick,
  isActive,
  searchResults,
  inputValue,
  onBlur,
}) => {
  return (
    <div style={{ position: "relative" }}>
      <div className="flex align-center">
        <input
          onChange={onSearch}
          style={{
            background: "black",
            color: "white",
            height: "32px",
            width: isActive ? "150px" : "0px",
            border: "none",
            borderRadius: "4px",
            borderTopRadiusRight: isActive ? 0 : "4px",
            borderBottomRadiusRight: isActive ? 0 : "4px",
            padding: isActive ? "0 8px" : "0px",
            outline: "none",
            transition: "width 0.350s ease",
          }}
          placeholder="Search players..."
          name="search"
          value={inputValue}
          autoComplete="off"
          onBlur={onBlur}
        />
        <IconButton
          iconColor="#A7A7A7"
          buttonStyle={{
            background: isActive ? "black" : "transparent",
            borderTopRadiusRight: "4px",
            borderBottomRadiusRight: "4px",
            height: "32px",
            display: "flex",
            alignItems: "center",
          }}
          iconSize={1}
          icon={mdiMagnify}
          onClick={() => {
            onSearchClick(!isActive);
          }}
        />
      </div>
      {isActive && <DropdownMenu items={searchResults} />}
    </div>
  );
};

export default SearchInput;
