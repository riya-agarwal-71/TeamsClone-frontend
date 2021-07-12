// get the api urls
import { APIUrls } from "../helper/urls";
import { getFormBody } from "../helper/utils";
// get the necessary action types
import {
  GROUP_FAILED,
  GROUP_START,
  GROUP_SUCCESS,
  CLEAR_GROUP_STATE,
} from "./actionTypes";

// action - start group action
export function groupStart() {
  return {
    type: GROUP_START,
  };
}

// action - successfully completed the group action
export function groupSuccessful(msg, id, messages = null, admin = null) {
  return {
    type: GROUP_SUCCESS,
    msg,
    id,
    messages,
    admin,
  };
}

// action - group action failed
export function groupFailed(error) {
  return {
    type: GROUP_FAILED,
    error,
  };
}

// action - clear the group state
export function clearGroupState() {
  return {
    type: CLEAR_GROUP_STATE,
  };
}

// api call - to create a group
export function createGroup(fromUser, name, particpantsStr = "") {
  return (dispatch) => {
    const url = APIUrls.createGroup();
    // fetch the api to create a group
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ name, particpantsStr, fromUser }),
    })
      .then((res) => res.json()) // convert to json
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.grp)); // dispatch group success with success msg and the new grp
          return;
        }
        dispatch(groupFailed(data.message)); // dispatch group failed with the error msg
        return;
      });
  };
}

// api call - to get the participants of the group
export function getParticipants(grpID) {
  return (dispatch) => {
    const url = APIUrls.getParticipants();
    // fetch the get participants api url
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ grpID }),
    })
      .then((data) => data.json()) // convert to json
      .then(({ data }) => {
        if (data.success) {
          // dispatch group success with the success msg, group id, participants list, admin details
          dispatch(
            groupSuccessful(
              data.message,
              data.data.id,
              data.data.participants,
              data.data.admin
            )
          );
          return;
        }
        dispatch(groupFailed(data.message)); // dispatch group failed with error msg
        return;
      });
  };
}

// api call - to add a memeber in the group
export function addMember(byUser, newUser, grpID) {
  return (dispatch) => {
    const url = APIUrls.addMember();
    // fetch the add member api call
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ byUser, newUser, grpID }),
    })
      .then((data) => data.json()) // convert to json
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.id)); // dispatch group success with success msg, group id
          return;
        }
        dispatch(groupFailed(data.message)); // dispatch group error with the error msg
        return;
      });
  };
}

// api call - to remove member from the group
export function removeMember(from, toRemove, grpID) {
  return (dispatch) => {
    const url = APIUrls.removeMember();
    // fetch the api call to remove member
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ from, toRemove, grpID }),
    })
      .then((data) => data.json()) // convert to json
      .then(({ data }) => {
        if (data.success) {
          dispatch(groupSuccessful(data.message, data.data.id)); // dispatch group success with the successmsg and the group id
          return;
        }
        dispatch(groupFailed(data.message)); // dispatch group failed with the error message
        return;
      });
  };
}

// api call - to get the messages of the group
export function getMessages(grpID) {
  return (dispatch) => {
    const url = APIUrls.getMessages();
    // fetch the get messages api call
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ grpID }),
    })
      .then((data) => data.json()) // convert to json
      .then(({ data }) => {
        if (data.success) {
          dispatch(
            groupSuccessful(data.message, data.data.id, data.data.messages) // dispatch group successfull with success msg. group id nd the array of messages
          );
          return;
        }
        dispatch(groupFailed(data.message)); // dispatch group failed with error msg
        return;
      });
  };
}
