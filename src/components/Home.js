import React, { Component } from "react";
import { Button, InputBase } from "@material-ui/core";
import randstr from "crypto-random-string";
import { Navbar } from "./";

import "../styles/home.scss";

class Home extends Component {
  createNewRoom = () => {
    const newRoomUrl =
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" });
    window.location.href = `room/${newRoomUrl}`;
  };

  handleRoomIdChange = (e) => {
    this.setState({
      roomUrl: e.target.value,
    });
  };

  redirectToRoom = () => {
    let roomCode = this.state.roomUrl.split("/");
    roomCode = roomCode[roomCode.length - 1];
    window.location.href = `room/${roomCode}`;
  };

  render() {
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
