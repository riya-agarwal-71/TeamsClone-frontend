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
import { FlareSharp, Visibility, VisibilityOff } from "@material-ui/icons";
import { signup, startSignup, clearAuthState } from "../actions/auth";
import "../styles/signup.scss";

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passVisible: false,
      confirmPassVisible: false,
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      redirect: false,
      redirectToHome: false,
    };
  }

  componentDidMount = () => {
    if (this.props.auth.isLoggedIn) {
      this.setState({
        redirectToHome: true,
      });
      return;
    }
  };

  handlePassVisibilty = () => {
    const self = this;
    this.setState({
      passVisible: !self.state.passVisible,
    });
  };

  handleconfirmPassVisiblity = () => {
    const self = this;
    this.setState({
      confirmPassVisible: !self.state.confirmPassVisible,
    });
  };

  handleNameChange = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  handleEmailChange = (e) => {
    this.setState({
      email: e.target.value,
    });
  };

  handlePassChange = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  handleConfirmPassChange = (e) => {
    this.setState({
      confirmPassword: e.target.value,
    });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    const { password, name, confirmPassword, email } = this.state;
    this.props.dispatch(startSignup());
    this.props.dispatch(signup(email, password, name, confirmPassword));
  };

  redirectToLogin = () => {
    setTimeout(() => {
      this.setState({
        redirect: true,
      });
    }, 500);
    this.props.dispatch(clearAuthState());
  };

  render() {
    if (this.state.redirectToHome) {
      return <Redirect to={"/"} />;
    }
    if (this.state.redirect) {
      return (
        <Redirect
          to={{ pathname: "/login", state: { from: "/", isNew: true } }}
        />
      );
    }
    return (
      <div className='main-container'>
        {this.props.auth.success && (
          <div>
            <Alert key={0} severity={"success"} classes={{ root: "alert" }}>
              {this.props.auth.success}
            </Alert>
          </div>
        )}
        {this.props.auth.success ? this.redirectToLogin() : ""}
        {this.props.auth.error && (
          <Alert key={0} severity={"error"} classes={{ root: "alert" }}>
            {this.props.auth.error}
          </Alert>
        )}
        <form onSubmit={this.handleFormSubmit}>
          <Paper className='form signup'>
            <div className='heading'>
              <Typography variant='h4'>Sign Up</Typography>
            </div>
            <div className='inputField'>
              <TextField
                label='Email'
                required
                type='email'
                margin='none'
                onChange={this.handleEmailChange}
                value={this.state.email}
              />
            </div>
            <div className='inputField'>
              <TextField
                label='Name'
                required
                margin='none'
                onChange={this.handleNameChange}
                value={this.state.name}
              />
            </div>
            <div className='inputField'>
              <TextField
                label='Password'
                required
                type={this.state.passVisible ? "text" : "password"}
                margin='none'
                onChange={this.handlePassChange}
                value={this.state.password}
                InputProps={{
                  endAdornment: (
                    <IconButton size='small' onClick={this.handlePassVisibilty}>
                      {this.state.passVisible ? (
                        <Visibility fontSize='small' />
                      ) : (
                        <VisibilityOff fontSize='small' />
                      )}
                    </IconButton>
                  ),
                }}
              />
            </div>
            <div className='inputField'>
              <TextField
                label='Confirm Password'
                required
                type={this.state.confirmPassVisible ? "text" : "password"}
                margin='none'
                onChange={this.handleConfirmPassChange}
                value={this.state.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size='small'
                      onClick={this.handleconfirmPassVisiblity}
                    >
                      {this.state.confirmPassVisible ? (
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
                Sign Up
              </Button>
            </div>
            <Typography variant='subtitle2' className='subtitle'>
              <div>Already have an account ? </div>
              <div>
                <Link href='/login' className='login-link'>
                  Login
                </Link>{" "}
                instead ...
              </div>
            </Typography>
          </Paper>
        </form>
        {this.props.from === "room" && (
          <form>
            <Paper>Redirected from Room</Paper>
          </form>
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

export default connect(mapStateToProps)(Signup);
