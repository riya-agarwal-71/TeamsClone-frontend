// import all the reducers and combine them using the combineReducers method from redux
import { combineReducers } from "redux";
import auth from "./auth";
import guest from "./guest";
import room from "./room";
import group from "./group";
import message from "./message";
import socket from "./socket";

// combien all the reducers
export default combineReducers({
  auth,
  guest,
  room,
  group,
  message,
  socket,
});
