const Content = ({ children, dark }) => {
  return (
    <div
      className={
        dark ? "bg-dark w-100 flex align-center justify-center" : "w-100"
      }
      style={{ padding: 4, boxSizing: "border-box" }}
    >
      {children}
    </div>
  );
};

export default Content;
