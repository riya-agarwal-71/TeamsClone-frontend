import React, { Component } from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import "../styles/index.scss";
import { Home, Login, SignUp, RoomWrapper, Page404 } from "./";

const theme = createMuiTheme({
  typography: {
    fontFamily: ["Amiko", "sans-serif"].join(","),
  },
});

const PrivateRoute = (privateProps) => {
  const { isLoggedIn, location, component: Component } = privateProps;
  const path = location.pathname;
  if (isLoggedIn) {
    return <Route path={path} render={(props) => <Component {...props} />} />;
  }
  var isNew = false;
  if (location.state) {
    isNew = location.state.isNew;
  }
  if (path.substr(0, 5) === `/room`) {
    return (
      <Redirect
        to={{
          pathname: "/login",
          state: {
            from: privateProps.location.pathname,
            isNew,
          },
        }}
      />
    );
  }
};

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
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
