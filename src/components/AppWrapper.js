import React, { Component } from "react";
import jwt_decode from "jwt-decode";
import { authenticateUser } from "../actions/auth";
import { connect } from "react-redux";

import { App } from ".";

class AppWrapper extends Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem("token")) {
      var user = jwt_decode(localStorage.getItem("token"));
      console.log(user);
      this.props.dispatch(
        authenticateUser({ name: user.name, email: user.email })
      );
    }
  }
  render() {
    return <App />;
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(AppWrapper);
