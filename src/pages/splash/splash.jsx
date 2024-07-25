import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeagues,
  selectLeagues,
  setLeagueId,
} from "../../api/leagueSlice";
import { Button } from "../../components/buttons";
import { Content } from "../../components/layout";

const Splash = (props) => {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const leagues = useSelector(selectLeagues);
  const saveLeague = () => {
    dispatch(setLeagueId({ id: league.league_id, year: league.season }));
  };

  return (
    <Content dark>
      <div
        className="d-flex flex-column w-100 align-center justify-center"
        style={{ height: `calc(100% - 164px)` }}
      >
        <h2 className="mb-1">Enter your Sleeper League ID</h2>
        <h6 className="mb-2">
          {"League Settings -> General -> Scroll to Bottom"}
        </h6>
        <div className="d-flex">
          <input
            onChange={(e) => setValue(e.target.value)}
            style={{
              background: "black",
              color: "white",
              height: "36px",
              width: "200px",
              marginBottom: "8px",
              marginRight: 8,
              border: "none",
              borderRadius: "4px",
              padding: "0 8px",
              outline: "none",
            }}
            placeholder="Sleeper League ID"
            value={value}
            name="leagueId"
          />
          <Button
            active
            style={{ width: 48 }}
            onClick={(e) => {
              dispatch(fetchLeagues(value));
            }}
          >
            Go
          </Button>
        </div>
      </div>
    </Content>
  );
};
export default Splash;
