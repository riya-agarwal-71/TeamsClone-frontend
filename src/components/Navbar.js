// navbar component
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
  Link,
} from "@material-ui/core";

import "../styles/navbar.scss";
import { logout } from "../actions/auth";

// navbar class component
class Navbar extends Component {
  // doesnt require state

  // function to log the user out
  handleLogout = () => {
    localStorage.removeItem("token");
    this.props.dispatch(logout());
  };

  render() {
    return (
      <AppBar position='static' className='navbar-top'>
        <Toolbar>
          {/* The name of the app which redirects you to home page */}
          <Typography variant='h6' className='navbar-name'>
            <Link href='/' color='inherit' underline='none'>
              Microsoft Teams Clone
            </Link>
          </Typography>
          {/* Display the user info and the logout button if logged in else display the login signup buttons */}
          <div className='navbar-icons'>
            {this.props.auth.isLoggedIn ? (
              <div className='flex-row-cst'>
                <div style={{ marginRight: "2rem" }}>
                  <Typography>{this.props.auth.user.name}</Typography>
                </div>
                <div>
                  <Button color='inherit' onClick={this.handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <ButtonGroup variant='text' color='inherit'>
                <Button href='/login'>Login</Button>
                <Button href='/signup'>Sign Up</Button>
              </ButtonGroup>
            )}
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

// get the access to auth state in props
function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(Navbar);
