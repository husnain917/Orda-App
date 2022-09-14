import {useDispatch} from "react-redux";
import mainCore from "../core/main";

export const backgroundSyncStart = () => {
  const dispatch = useDispatch();
  console.log('BackgroundSync loaded!!!!!!');
};

export const backgroundSyncStop = () => {
};
