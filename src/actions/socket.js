// import the necessary action types
import {
  START_SOCKET,
  SOCKET_FAILED,
  SOCKET_SUCCESS,
  CLEAR_SOCKET_STATE,
} from "./actionTypes";
// get the server url for the socket connection
import { server_url } from "../helper/urls";
import { io } from "socket.io-client";

// action - start the socket connection
export function startSocketConnection() {
  return {
    type: START_SOCKET,
  };
}

// action - socket connection sucessfull
export function socketSuccessfull(socket, socketID) {
  return {
    type: SOCKET_SUCCESS,
    socket,
    socketID,
  };
}

// action - socket connection failed
export function socketFailed() {
  return {
    type: SOCKET_FAILED,
  };
}

// action - clear the socket state
export function clearSocketState() {
  return {
    type: CLEAR_SOCKET_STATE,
  };
}

// fucntion - to connect to the socket
export function connectToSocket() {
  return (dispatch) => {
    try {
      const socket = io(server_url);
      var socketID;
      // connect to socket
      socket.on("connect", () => {
        socketID = socket.id;
        dispatch(socketSuccessfull(socket, socketID)); // dispatch socket connection successfull with the socket and the socket id
      });
      return;
    } catch (error) {
      dispatch(socketFailed()); // dispatch the socket failed
      console.log(error);
    }
  };
}
