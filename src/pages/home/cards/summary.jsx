import { Avatar } from "../../../components/images";
import { VerticalListItem } from "../../../components/list-items";
import "./cards.scss";

const SummaryCard = ({ title, subtitle, href }) => {
  return (
    <div className="summary">
      <a className="w-100" style={{ textDecoration: "none" }} href={href}>
        <h3 style={{ paddingBottom: 12 }}>{title}</h3>
        {/* <h5>{subtitle}</h5> */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            height: "100%",
          }}
        >
          <VerticalListItem />
          <VerticalListItem />
        </div>
      </a>
    </div>
  );
};

export default SummaryCard;
