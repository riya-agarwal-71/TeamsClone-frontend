// login component to render the login page
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  TextField,
  Button,
  IconButton,
  Paper,
  Typography,
  Link,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { startLogin, login, clearAuthState } from "../actions/auth";

import "../styles/signup.scss";
import { guestLogin } from "../actions/guest";

// the login component
class Login extends Component {
  constructor(props) {
    super(props);
    // the state of this component
    this.state = {
      email: "",
      password: "",
      redirect: false,
      passwordVisible: false,
      username: "",
      redirectGuest: false,
    };
  }

  // if logged in then redirect to home page
  componentDidMount = () => {
    if (this.props.auth.isLoggedIn) {
      this.setState({
        redirect: true,
      });
      return;
    }
    this.props.dispatch(clearAuthState());
  };

  // function to track the input in the password field
  handlePasswordChange = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  // function to track the input in the email field
  handleEmailChange = (e) => {
    this.setState({
      email: e.target.value,
    });
  };

  // function to submit the login form
  handleFormSubmit = (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    // start the login and login with the email and password
    this.props.dispatch(startLogin());
    this.props.dispatch(login(email, password));
  };

  // if logged in successfully then redirect to home page
  redirectToHome = () => {
    if (this.props.auth.success != null) {
      setTimeout(() => {
        this.setState({
          redirect: true,
        });
      }, 500);
    }
  };

  // function to change the visibility of the password
  handlePasswordVisibilty = () => {
    const self = this;
    this.setState({
      passwordVisible: !self.state.passwordVisible,
    });
  };

  // function to login as guest (only applicable when entering a room)
  handleGuestFormSubmit = (e) => {
    e.preventDefault();
    var guestUsername = this.state.username;
    guestUsername = guestUsername + " (Guest)";
    this.props.dispatch(guestLogin(guestUsername));
    this.setState({
      redirectGuest: true,
    });
  };

  // function to track the change in the guest name field
  handleGuestNameChange = (e) => {
    this.setState({
      username: e.target.value,
    });
  };

  render() {
    // if want to redirect
    if (this.state.redirect) {
      // if there is a from in the location (passed down in case of enetring a meet) redirect to room url
      if (this.props.location.state) {
        return <Redirect to={this.props.location.state.from} />;
      }
      // redirect to home
      return <Redirect to={"/"} />;
    }
    // if there is a guest redirect (will always have the from else we wont accept the guest login)
    else if (this.state.redirectGuest) {
      // redirect to room
      return <Redirect to={this.props.location.state.from} />;
    }
    return (
      <div className='root-contaniner bg-img '>
        <div className='main-container'>
          {/* the success alert */}
          {this.props.auth.success && (
            <div>
              <Alert key={0} severity={"success"} classes={{ root: "alert" }}>
                {this.props.auth.success}
              </Alert>
            </div>
          )}
          {/* if success then redirect to home (checked in the function) */}
          {this.redirectToHome()}
          {/* the error alert */}
          {this.props.auth.error && (
            <Alert key={0} severity={"error"} classes={{ root: "alert" }}>
              {this.props.auth.error}
            </Alert>
          )}
          {/* The login form */}
          <form onSubmit={this.handleFormSubmit}>
            <Paper className='form'>
              <div className='heading'>
                <Typography variant='h4'>Login</Typography>
              </div>
              <div className='inputField'>
                <TextField
                  label='Email'
                  required
                  type='email'
                  margin='none'
                  onChange={this.handleEmailChange}
                />
              </div>
              <div className='inputField'>
                <TextField
                  label='Password'
                  required
                  type={this.state.passwordVisible ? "text" : "password"}
                  margin='none'
                  onChange={this.handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size='small'
                        onClick={this.handlePasswordVisibilty}
                      >
                        {this.state.passwordVisible ? (
                          <Visibility fontSize='small' />
                        ) : (
                          <VisibilityOff fontSize='small' />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </div>
              <div className='submit-btn'>
                <Button
                  className='btn'
                  type='submit'
                  disabled={this.props.auth.inProgress}
                >
                  Login
                </Button>
              </div>
              <Typography variant='subtitle2' className='subtitle'>
                <div>Dont have an account ? </div>
                <div>
                  <Link href='/signup' className='login-link'>
                    Sign up
                  </Link>{" "}
                  for one now !!
                </div>
              </Typography>
            </Paper>
          </form>
        </div>
        {/* Only show the guest login if we are here from the room url */}
        {this.props.location.state && !this.props.location.state.isNew && (
          <div className='or-container'></div>
        )}
        {/* The guest login form */}
        {this.props.location.state && !this.props.location.state.isNew && (
          <div className='main-container'>
            <form onSubmit={this.handleGuestFormSubmit}>
              <Paper className='form'>
                <div className='heading'>
                  <Typography variant='h4'>Continue as Guest</Typography>
                </div>
                <div className='inputField'>
                  <TextField
                    placeholder='Name'
                    type='text'
                    required
                    fullWidth
                    onChange={this.handleGuestNameChange}
                  />
                </div>
                <div className='submit-btn'>
                  <Button type='submit' className='btn'>
                    Continue
                  </Button>
                </div>
              </Paper>
            </form>
          </div>
        )}
      </div>
    );
  }
}

// get access to the auth state in the props
function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(Login);
