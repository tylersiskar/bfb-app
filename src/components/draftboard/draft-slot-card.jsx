import { useDispatch } from "react-redux";
import "./draftboard.scss";
import { setActiveSlot } from "../../api/draftSlice";

const DraftSlotCard = ({ draftSlot, onSelect, selectedPick }) => {
  const dispatch = useDispatch();
  const isEmpty = !draftSlot.player;
  let isSelected =
    selectedPick.round === draftSlot.round &&
    selectedPick.pick === draftSlot.pick;

  const _onClick = () => {
    dispatch(setActiveSlot(draftSlot));
    onSelect && onSelect(draftSlot);
  };

  if (isEmpty) {
    return (
      <div
        className={`card ${isSelected ? "selected" : ""}`}
        onClick={_onClick}
      >
        <div />
        <div className="flex align-end justify-between w-100">
          <p className="sm color-light">{`${draftSlot.round}.${draftSlot.pick}`}</p>
          <p className="x-sm color-light">
            {draftSlot.team.slice(0, 3).toUpperCase()}
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`card ${draftSlot.player.position} ${
          isSelected ? "selected" : ""
        }`}
        onClick={_onClick}
      >
        <div className="flex flex-column justify-start align-start">
          <p className="x-sm">{draftSlot.player.first_name}</p>
          <p className="sm">{draftSlot.player.last_name}</p>
        </div>
        <div className="flex align-center">
          <p className="x-sm">
            {draftSlot.player.position} - {draftSlot.player.team}
          </p>
        </div>
        <div className="flex align-end justify-between w-100">
          <p className="sm">{`${draftSlot.round}.${draftSlot.pick}`}</p>
          <p className="x-sm">{draftSlot.team.slice(0, 3).toUpperCase()}</p>
        </div>
      </div>
    );
  }
};

export default DraftSlotCard;
