// the wrapper component for the app component which authenticates the user
import React, { Component } from "react";
import jwt_decode from "jwt-decode";
import { authenticateUser } from "../actions/auth";
import { connect } from "react-redux";

import { App } from ".";

class AppWrapper extends Component {
  constructor(props) {
    super(props);
    // if token exists then authenticate the user and dispatch action authenticateUser
    if (localStorage.getItem("token")) {
      var user = jwt_decode(localStorage.getItem("token"));
      this.props.dispatch(
        authenticateUser({ name: user.name, email: user.email })
      );
    }
  }
  render() {
    return <App />;
  }
}

// get the access to auth state in props
function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(AppWrapper);
