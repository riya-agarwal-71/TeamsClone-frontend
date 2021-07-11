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

import { APIUrls } from "../helper/urls";
import { getFormBody } from "../helper/utils";

export function startLogin() {
  return {
    type: START_LOGIN,
  };
}

export function loginSuccess(user, message) {
  return {
    type: LOGIN_SUCCESSFULL,
    user,
    message,
  };
}

export function loginfailed(error) {
  return {
    type: LOGIN_FAILED,
    error,
  };
}

export function clearAuthState() {
  return {
    type: CLEAR_STATE,
  };
}

export function login(email, password) {
  return (dispatch, done) => {
    const url = APIUrls.login();
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ email, password }),
    })
      .then((response) => response.json())
      .then(({ data }) => {
        if (data.success === true) {
          localStorage.setItem("token", data.data.token);
          dispatch(loginSuccess(data.data.user, data.message));
          done();
          return;
        }
        dispatch(loginfailed(data.message));
        done();
        return;
      });
  };
}

export function startSignup() {
  return {
    type: START_SIGNUP,
  };
}

export function signupSuccess(message) {
  return {
    type: SIGNUP_SUCCESSFULL,
    message,
  };
}

export function signupfailed(error) {
  return {
    type: SIGNUP_FAILED,
    error,
  };
}

export function signup(email, password, name, confirmPassword) {
  return (dispatch, done) => {
    const url = APIUrls.signup();
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ email, password, name, confirmPassword }),
    })
      .then((response) => response.json())
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(signupSuccess(data.message));
          done();
          return;
        }
        dispatch(signupfailed(data.message));
        done();
        return;
      });
  };
}

export function logout() {
  return {
    type: LOGOUT,
  };
}

export function authenticateUser(user) {
  return {
    type: AUTHENTICATE_USER,
    user,
  };
}

export function getGrpSuccess(msg, grps) {
  return {
    type: GET_GROUP_SUCESS,
    msg,
    grps,
  };
}

export function getGrpFailed(error) {
  return {
    type: GET_GROUP_FAILED,
    error,
  };
}

export function getGroups(email) {
  return (dispatch) => {
    const url = APIUrls.getGroups();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: getFormBody({ email }),
    })
      .then((response) => response.json())
      .then(({ data }) => {
        if (data.success === true) {
          dispatch(getGrpSuccess(data.message, data.data.groups));
          return;
        }
        dispatch(getGrpFailed(data.message));
        return;
      });
  };
}
