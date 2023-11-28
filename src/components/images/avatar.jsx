import "./images.scss";

const Avatar = ({ avatarId }) => {
  return (
    <img
      className="avatar"
      src={
        avatarId
          ? `https://sleepercdn.com/avatars/${avatarId}`
          : "https://sleepercdn.com/avatars/8eb8f8bf999945d523f2c4033f70473e"
      }
    />
  );
};
export default Avatar;
