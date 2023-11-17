import "./images.scss";

const Avatar = (props) => {
  return (
    <img
      className="avatar"
      src={
        props.url ??
        "https://sleepercdn.com/avatars/8eb8f8bf999945d523f2c4033f70473e"
      }
    />
  );
};
export default Avatar;
