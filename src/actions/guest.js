// import the equired action types
import { GUEST_LOGIN } from "./actionTypes";

// action - login as guest
export function guestLogin(username) {
  return {
    type: GUEST_LOGIN,
    username,
  };
}
