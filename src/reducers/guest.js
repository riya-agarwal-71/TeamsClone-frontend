import { GUEST_LOGIN } from "../actions/actionTypes";

const initialState = {
  username: "",
  isLoggedIn: false,
};

export default function guest(state = initialState, action) {
  switch (action.type) {
    case GUEST_LOGIN:
      return {
        ...state,
        username: action.username,
        isLoggedIn: true,
      };
    default:
      return state;
  }
}
