const initialState = {};
import firebase from "firebase/app";

const reducer = (
  state: any,
  action: { type: string; payload: { user: firebase.User } }
) => {
  switch (action.type) {
    case "login":
      return action.payload.user;
    case "logout":
      return initialState;
    default:
      return state;
  }
};

export default {
  initialState,
  reducer,
};
