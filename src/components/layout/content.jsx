import "./layout.scss";
const Content = ({ children, dark, home }) => {
  return (
    <div
      className={dark ? "bg-dark w-100" : "w-100"}
      style={{ padding: 4, boxSizing: "border-box" }}
    >
      <div className={home ? "w-100 subcontent h-100" : "w-100 subcontent"}>
        {children}
      </div>
    </div>
  );
};

export default Content;
