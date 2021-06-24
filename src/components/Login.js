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

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      redirect: false,
      passwordVisible: false,
    };
  }

  componentWillUnmount = () => {
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
    setTimeout(() => {
      this.setState({
        redirect: true,
      });
    }, 500);
  };

  handlePasswordVisibilty = () => {
    const self = this;
    this.setState({
      passwordVisible: !self.state.passwordVisible,
    });
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to='/' />;
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
        {this.props.auth.success ? this.redirectToHome() : ""}
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
                placeholder='Email'
                required
                type='email'
                margin='none'
                onChange={this.handleEmailChange}
              />
            </div>
            <div className='inputField'>
              <TextField
                placeholder='Password'
                required
                type='password'
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
        {this.props.location.state && <div>Continue As guest ?</div>}
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
