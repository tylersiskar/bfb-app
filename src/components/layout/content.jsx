const Content = ({ children, dark }) => {
  return (
    <div
      className={
        dark ? "bg-dark w-100 flex align-center justify-center" : "w-100"
      }
    >
      {children}
    </div>
  );
};

export default Content;
