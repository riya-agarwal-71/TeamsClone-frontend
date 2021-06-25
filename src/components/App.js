import React, { Component } from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import "../styles/index.scss";
import { Home, Login, SignUp, RoomWrapper, Page404 } from "./";

const PrivateRoute = (privateProps) => {
  const { isLoggedIn, location, component: Component } = privateProps;
  const path = location.pathname;
  console.log("isLoggedIn", isLoggedIn);
  console.log(path);
  if (isLoggedIn) {
    return <Route path={path} render={(props) => <Component {...props} />} />;
  }
  return (
    <Redirect
      to={{
        pathname: "/login",
        state: { from: privateProps.location.pathname },
      }}
    />
  );
};

class App extends Component {
  render() {
    console.log("APP RENDER", this.props.auth.isLoggedIn);
    return (
      <div>
        <Router>
          <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/login' component={Login} />
            <Route path='/signup' component={SignUp} />
            <PrivateRoute
              path='/room/:id'
              component={RoomWrapper}
              isLoggedIn={
                this.props.auth.isLoggedIn || this.props.guest.isLoggedIn
              }
            />
            <Route component={Page404} />
          </Switch>
        </Router>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    guest: state.guest,
  };
}

export default connect(mapStateToProps)(App);
