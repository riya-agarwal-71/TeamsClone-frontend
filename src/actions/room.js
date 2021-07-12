// import the required action types
import {
  START_ROOM,
  ROOM_SUCCESSFULL,
  ROOM_FAILED,
  CLEAR_ROOM,
} from "./actionTypes";
// get the api urls
import { APIUrls } from "../helper/urls";
import { getFormBody } from "../helper/utils";

// action - start any room action
export function startRoom() {
  return {
    type: START_ROOM,
  };
}

// action - room action completed successfully
export function roomSuccessfull(url) {
  return {
    type: ROOM_SUCCESSFULL,
    url,
  };
}

// action - room action failed
export function roomFailed(error) {
  return {
    type: ROOM_FAILED,
    error,
  };
}

// action - clear the room state
export function clearRoom() {
  return {
    type: CLEAR_ROOM,
  };
}

// api call - to create a new room
export function createRoom(roomUrl) {
  return (dispatch, done) => {
    const url = APIUrls.createRoom();
    // fetch the create room api
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ roomUrl }),
    })
      .then((response) => response.json()) // convert to json
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(roomSuccessfull(data.data.roomUrl)); // dispatch room success with the room url
        } else {
          dispatch(roomFailed(data.message)); // dispatch room failed with the error message
        }
      });
  };
}

// api call - to check if the room exists
export function checkExistingRoom(roomUrl) {
  return (dispatch) => {
    const url = APIUrls.checkRoom();
    // fetch the api
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ roomUrl }),
    })
      .then((response) => response.json()) // convert to json
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(roomSuccessfull(data.data.roomUrl)); // dispatch room successfull with the room url
        } else {
          dispatch(roomFailed(data.message)); // dispatch room failed with the error msg
        }
      });
  };
}
