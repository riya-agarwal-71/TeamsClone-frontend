// the main app component which controls all the other renders and routes
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
import { Home, Login, SignUp, RoomWrapper, Page404, Chats } from "./";

// create a theme for the app whcih defines the font size
const theme = createMuiTheme({
  typography: {
    fontFamily: ["Amiko", "sans-serif"].join(","),
  },
});

// private route component which renders login if user is not logged in
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

// the main app class component
class App extends Component {
  render() {
    return (
      // give the theme to all the components
      <ThemeProvider theme={theme}>
        <div>
          {/* Define the router (the paths) */}
          <Router>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/login' component={Login} />
              <Route path='/signup' component={SignUp} />
              {/* Render room only if you are either logged in or looged in as guest */}
              <PrivateRoute
                path='/room/:id'
                component={RoomWrapper}
                isLoggedIn={
                  this.props.auth.isLoggedIn || this.props.guest.isLoggedIn
                }
              />
              <Route path='/chats' component={Chats} />
              <Route component={Page404} />
            </Switch>
          </Router>
        </div>
      </ThemeProvider>
    );
  }
}

// get the access to auth and guest state
function mapStateToProps(state) {
  return {
    auth: state.auth,
    guest: state.guest,
  };
}

export default connect(mapStateToProps)(App);
