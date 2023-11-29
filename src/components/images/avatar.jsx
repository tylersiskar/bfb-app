import "./images.scss";

const Avatar = ({ avatarId, size = "lg" }) => {
  return (
    <img
      className={`avatar avatar-${size}`}
      src={
        avatarId
          ? `https://sleepercdn.com/avatars/${avatarId}`
          : "https://sleepercdn.com/avatars/8eb8f8bf999945d523f2c4033f70473e"
      }
    />
  );
};
export default Avatar;
