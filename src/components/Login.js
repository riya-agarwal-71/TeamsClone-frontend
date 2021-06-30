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

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      redirect: false,
      passwordVisible: false,
      username: "",
      redirectGuest: false,
    };
  }

  componentDidMount = () => {
    if (this.props.auth.isLoggedIn) {
      this.setState({
        redirect: true,
      });
      return;
    }
    this.props.dispatch(clearAuthState());
  };

  handlePasswordChange = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  handleEmailChange = (e) => {
    this.setState({
      email: e.target.value,
    });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    this.props.dispatch(startLogin());
    this.props.dispatch(login(email, password));
  };

  redirectToHome = () => {
    if (this.props.auth.success != null) {
      setTimeout(() => {
        this.setState({
          redirect: true,
        });
      }, 500);
    }
  };

  handlePasswordVisibilty = () => {
    const self = this;
    this.setState({
      passwordVisible: !self.state.passwordVisible,
    });
  };

  handleGuestFormSubmit = (e) => {
    e.preventDefault();
    var guestUsername = this.state.username;
    guestUsername = guestUsername + " (Guest)";
    console.log(guestUsername);
    console.log(this.props.location.state.from);
    this.props.dispatch(guestLogin(guestUsername));
    this.setState({
      redirectGuest: true,
    });
  };

  handleGuestNameChange = (e) => {
    this.setState({
      username: e.target.value,
    });
  };

  render() {
    if (this.state.redirect) {
      if (this.props.location.state) {
        return <Redirect to={this.props.location.state.from} />;
      }
      return <Redirect to={"/"} />;
    } else if (this.state.redirectGuest) {
      return <Redirect to={this.props.location.state.from} />;
    }
    return (
      <div className='root-contaniner'>
        <div className='main-container'>
          {this.props.auth.success && (
            <div>
              <Alert key={0} severity={"success"} classes={{ root: "alert" }}>
                {this.props.auth.success}
              </Alert>
            </div>
          )}
          {this.redirectToHome()}
          {this.props.auth.error && (
            <Alert key={0} severity={"error"} classes={{ root: "alert" }}>
              {this.props.auth.error}
            </Alert>
          )}
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
        {this.props.location.state && !this.props.location.state.isNew && (
          <div className='or-container'>
            <Typography variant='h6'>OR</Typography>
          </div>
        )}
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

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(Login);
