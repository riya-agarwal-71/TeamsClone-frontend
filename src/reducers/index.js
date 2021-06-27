import { combineReducers } from "redux";
import auth from "./auth";
import guest from "./guest";
import room from "./room";

export default combineReducers({
  auth,
  guest,
  room,
});
