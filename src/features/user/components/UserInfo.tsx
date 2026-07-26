import classes from "./UserInfo.module.css";
import avatarDefault from "../../../assets/icons/AvatarDefault.svg";

type UserInfoProps = {
  nickname: string;
  postCount: number;
};

const UserInfo = ({ nickname, postCount }: UserInfoProps) => {
  return (
    <div className={classes.card}>
      <img className={classes.avatar} src={avatarDefault} alt="" />

      <div className={classes.info}>
        <p className={classes.nickname}>{nickname}</p>

        <ul className={classes.stats}>
          <li className={classes.stat}>
            <span className={classes.statLabel}>작성수</span>
            <span className={classes.statValue}>{postCount}</span>
          </li>
          {/* 팔로워·팔로잉 기능 미개발 → 비활성('-') */}
          <li className={`${classes.stat} ${classes.disabled}`}>
            <span className={classes.statLabel}>팔로워</span>
            <span className={classes.statValue}>-</span>
          </li>
          <li className={`${classes.stat} ${classes.disabled}`}>
            <span className={classes.statLabel}>팔로잉</span>
            <span className={classes.statValue}>-</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserInfo;
