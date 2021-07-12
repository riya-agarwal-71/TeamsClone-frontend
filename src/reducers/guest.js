// get the required action types
import { GUEST_LOGIN } from "../actions/actionTypes";

// define the inital state
const initialState = {
  username: "",
  isLoggedIn: false,
};

// the reducer function to change the guest state
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
