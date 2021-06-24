import React, { Component } from "react";
import { connect } from "react-redux";
import jwt_decode from "jwt-decode";
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

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.token,
      user: "",
    };
  }

  componentDidMount = () => {
    if (!this.state.token) {
      return;
    }
    var user = jwt_decode(this.state.token);
    this.setState({
      user: user.name,
    });
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
            {this.state.token ? (
              <div className='flex-row'>
                <div>
                  <Typography>{this.state.user}</Typography>
                </div>
                <div>
                  <Button color='inherit'>Logout</Button>
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
