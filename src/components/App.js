import React, { Component } from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import jwt_decode from "jwt-decode";
import { authenticateUser } from "../actions/auth";

import "../styles/index.scss";
import { Home, Login, SignUp, RoomWrapper, Page404 } from "./";

const PrivateRoute = (props) => {
  const { isLoggedIn, path, component: Component } = props;
  if (isLoggedIn) {
    return <Route path={path} render={(props) => <Component {...props} />} />;
  }
  return <Redirect to={{ pathname: "/login", state: { from: props.path } }} />;
};

class App extends Component {
  componentDidMount = () => {
    if (localStorage.token) {
      var { id, name } = jwt_decode(localStorage.token);
      this.props.dispatch(authenticateUser({ id, name }));
    }
  };
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/login' component={Login} />
            <Route path='/signup' component={SignUp} />
            <PrivateRoute
              path='/room/:id'
              component={RoomWrapper}
              isLoggedIn={localStorage.token}
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
  };
}

export default connect(mapStateToProps)(App);
