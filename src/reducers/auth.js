import {
  LOGIN_FAILED,
  START_LOGIN,
  LOGIN_SUCCESSFULL,
  START_SIGNUP,
  SIGNUP_FAILED,
  SIGNUP_SUCCESSFULL,
  CLEAR_STATE,
} from "../actions/actionTypes";

const initialState = {
  user: {},
  error: null,
  isLoggedIn: false,
  inProgress: null,
  success: null,
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case START_SIGNUP:
    case START_LOGIN:
      return {
        ...state,
        inProgress: true,
      };
    case LOGIN_SUCCESSFULL:
      return {
        ...state,
        inProgress: false,
        isLoggedIn: true,
        error: null,
        user: action.user,
        success: action.message,
      };
    case SIGNUP_FAILED:
    case LOGIN_FAILED:
      return {
        ...state,
        user: {},
        isLoggedIn: false,
        inProgress: false,
        error: action.error,
      };
    case SIGNUP_SUCCESSFULL:
      return {
        ...state,
        inProgress: false,
        error: null,
        success: action.message,
      };
    case CLEAR_STATE:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}
