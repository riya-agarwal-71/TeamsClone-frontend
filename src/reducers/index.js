import { combineReducers } from "redux";
import auth from "./auth";
import guest from "./guest";

export default combineReducers({
  auth,
  guest,
});
