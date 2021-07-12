// get api urls
import { getFormBody } from "../helper/utils";
import { APIUrls } from "../helper/urls";

// get the required action types
import {
  START_MESSAGE,
  MESSAGE_FAILED,
  MESSAGE_SUCCESS,
  CLEAR_MESSAGE_STATE,
} from "./actionTypes";

// action - strat a message action
export function startMessage() {
  return {
    type: START_MESSAGE,
  };
}

// action - message action unsuccessfull
export function messageFailed(error) {
  return {
    type: MESSAGE_FAILED,
    error,
  };
}

// action - message action successfull
export function messageSuccess(successMsg, message) {
  return {
    type: MESSAGE_SUCCESS,
    successMsg,
    message,
  };
}

// action - clear the message state
export function clearMessageState() {
  return {
    type: CLEAR_MESSAGE_STATE,
  };
}

// api call - to create (send) a new message to a group
export function sendMessage(fromUser, toGrpID, message) {
  return (dispatch) => {
    const url = APIUrls.sendMessage();
    // fetch the send message url
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ fromUser, toGrpID, message }),
    })
      .then((res) => res.json()) // convert to json
      .then(({ data }) => {
        if (data.success) {
          dispatch(messageSuccess(data.message, data.data.msg)); // dispatch message success with the success msg and created msg
          return;
        }
        dispatch(messageFailed(data.message)); // dispatch message failed with the error message
        return;
      });
  };
}
