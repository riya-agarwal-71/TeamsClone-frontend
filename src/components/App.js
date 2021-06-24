import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "../styles/index.scss";
import { Home, Login, SignUp, RoomWrapper, Page404 } from "./";

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/login' component={Login} />
            <Route path='/signup'>
              <SignUp from={""} />
            </Route>
            <Route path='/room/:id' component={RoomWrapper} />
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
