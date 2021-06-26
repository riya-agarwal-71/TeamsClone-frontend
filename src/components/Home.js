import React, { Component } from "react";
import { Button, InputBase } from "@material-ui/core";
import randstr from "crypto-random-string";
import { Navbar } from "./";
import { Redirect } from "react-router-dom";

import "../styles/home.scss";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectNewRoom: false,
      redirectExistingRoom: false,
      roomCode: "",
    };
  }

  createNewRoom = () => {
    const newRoomUrl =
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" });
    this.setState({
      redirectNewRoom: true,
      roomCode: newRoomUrl,
    });
    // window.location.href = `room/${newRoomUrl}`;
  };

  handleRoomIdChange = (e) => {
    this.setState({
      roomUrl: e.target.value,
    });
  };

  redirectToRoom = () => {
    let roomCode = this.state.roomUrl.split("/");
    roomCode = roomCode[roomCode.length - 1];
    this.setState({
      redirectExistingRoom: true,
      roomCode: roomCode,
    });
    // window.location.href = `room/${roomCode}`;
  };

  render() {
    if (this.state.redirectNewRoom) {
      return (
        <Redirect
          to={{
            pathname: `room/${this.state.roomCode}`,
            state: { isNew: true },
          }}
        />
      );
    }
    if (this.state.redirectToRoom && this.state.roomCode) {
      return (
        <Redirect
          to={{
            pathname: `room/${this.state.roomCode}`,
            state: { isNew: false },
          }}
        />
      );
    }
    return (
      <div>
        <Navbar />
        <div className='home-container'>
          <div>
            <Button
              className='btn-margin'
              variant='outlined'
              onClick={this.createNewRoom}
            >
              Create a Room
            </Button>
          </div>
          OR
          <div>
            <InputBase
              placeholder='Enter the room id'
              onChange={this.handleRoomIdChange}
            />
            <Button
              className='btn-margin'
              variant='outlined'
              onClick={this.redirectToRoom}
            >
              Join an existing room
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
