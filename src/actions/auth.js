// get all the related action types
import {
  START_LOGIN,
  LOGIN_SUCCESSFULL,
  LOGIN_FAILED,
  SIGNUP_FAILED,
  SIGNUP_SUCCESSFULL,
  START_SIGNUP,
  CLEAR_STATE,
  LOGOUT,
  AUTHENTICATE_USER,
  GET_GROUP_SUCESS,
  GET_GROUP_FAILED,
} from "./actionTypes";
// get the api urls
import { APIUrls } from "../helper/urls";
import { getFormBody } from "../helper/utils";

// action - start login
export function startLogin() {
  return {
    type: START_LOGIN,
  };
}

// action - login is successfull
export function loginSuccess(user, message) {
  return {
    type: LOGIN_SUCCESSFULL,
    user,
    message,
  };
}

// action - login unsucessfull
export function loginfailed(error) {
  return {
    type: LOGIN_FAILED,
    error,
  };
}

// action - clear the auth state
export function clearAuthState() {
  return {
    type: CLEAR_STATE,
  };
}

// api call - to login the user
export function login(email, password) {
  return (dispatch, done) => {
    const url = APIUrls.login();
    // fetch the response from the api call
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ email, password }),
    })
      .then((response) => response.json()) // convert the data to json
      .then(({ data }) => {
        if (data.success === true) {
          localStorage.setItem("token", data.data.token); // set the token in local storage
          dispatch(loginSuccess(data.data.user, data.message)); // dispatch login success with user and a success message
          done();
          return;
        }
        dispatch(loginfailed(data.message)); // dispatch login failedwith error message
        done();
        return;
      });
  };
}

// action - start sign up
export function startSignup() {
  return {
    type: START_SIGNUP,
  };
}

// action - successfully signed up
export function signupSuccess(message) {
  return {
    type: SIGNUP_SUCCESSFULL,
    message,
  };
}

// action - sign up unsucessfull
export function signupfailed(error) {
  return {
    type: SIGNUP_FAILED,
    error,
  };
}

// api call - to signup a user
export function signup(email, password, name, confirmPassword) {
  return (dispatch, done) => {
    const url = APIUrls.signup();
    // gfet the signup user response
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ email, password, name, confirmPassword }),
    })
      .then((response) => response.json()) // conver to json
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(signupSuccess(data.message)); // disptach sucessfull signup with the success msg
          done();
          return;
        }
        dispatch(signupfailed(data.message)); // dispatch failed signup with the error msg
        done();
        return;
      });
  };
}

// action - logout the user
export function logout() {
  return {
    type: LOGOUT,
  };
}

// action authenticate the user (on refresh basically)
export function authenticateUser(user) {
  return {
    type: AUTHENTICATE_USER,
    user,
  };
}

// action - sucessfully got the groups of the user
export function getGrpSuccess(msg, grps) {
  return {
    type: GET_GROUP_SUCESS,
    msg,
    grps,
  };
}

// action - couldnt get teh groups of the user
export function getGrpFailed(error) {
  return {
    type: GET_GROUP_FAILED,
    error,
  };
}

// api call - to get the groups for the user
export function getGroups(email) {
  return (dispatch) => {
    const url = APIUrls.getGroups();
    // fetch the get groups api call
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ email }),
    })
      .then((response) => response.json()) // convert to json
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(getGrpSuccess(data.message, data.data.groups)); // dispatch group sucessfull action with the success msg and the groups
          return;
        }
        dispatch(getGrpFailed(data.message)); // dispatch group unsucessfull action with the error msg
        return;
      });
  };
}
