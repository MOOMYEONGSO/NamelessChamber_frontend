import { type ComponentPropsWithoutRef } from "react";
import classes from "./CoinInfo.module.css";

type CoinInfoProps = {
  coin: number;
} & ComponentPropsWithoutRef<"button">;

const CoinInfo = ({ coin, ...rest }: CoinInfoProps) => {
  return (
    <button type="button" className={classes.coin} {...rest}>
      열람권 : {coin}
    </button>
  );
};

export default CoinInfo;
