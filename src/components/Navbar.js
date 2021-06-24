import React, { Component } from "react";
import { connect } from "react-redux";
// import jwt_decode from "jwt-decode";
import {
  AppBar,
  Toolbar,
  // IconButton,
  Typography,
  // InputBase,
  Button,
  ButtonGroup,
  Link,
} from "@material-ui/core";
// import { Menu, Search } from "@material-ui/icons";

import "../styles/navbar.scss";
import { logout } from "../actions/auth";

class Navbar extends Component {
  handleLogout = () => {
    localStorage.removeItem("token");
    this.props.dispatch(logout());
  };

  render() {
    return (
      <AppBar position='static' className='navbar-top'>
        <Toolbar>
          {/* <IconButton color="inherit">
            <Menu color="inherit" />
          </IconButton> */}
          {/* <img src="logo.png" alt="Logo" /> */}
          <Typography variant='h6' className='navbar-name'>
            <Link href='/' color='inherit' underline='none'>
              Microsoft Teams
            </Link>
          </Typography>
          <div className='search-container'>
            {/* <div className="search-icon-div">
              <Search className="search-icon" />
            </div>
            <InputBase placeholder="Search" className="search-input" /> */}
          </div>
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

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(Navbar);
