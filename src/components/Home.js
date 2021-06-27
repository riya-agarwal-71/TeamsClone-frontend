import React, { Component } from "react";
import { Button, InputBase } from "@material-ui/core";
import randstr from "crypto-random-string";
import { Navbar } from "./";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { startRoom, createRoom, checkExistingRoom } from "../actions/room";
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
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" });

    const self = this;
    this.props.dispatch(startRoom());
    this.props.dispatch(createRoom(newRoomUrl)).then(() => {
      if (self.props.room.success) {
        self.setState({
          redirectNewRoom: true,
          roomCode: newRoomUrl,
        });
      } else {
        console.log(self.props.room.error);
      }
    });
  };

  handleRoomIdChange = (e) => {
    this.setState({
      roomUrl: e.target.value,
    });
  };

  redirectToRoom = () => {
    let roomCode = this.state.roomUrl.split("/");
    roomCode = roomCode[roomCode.length - 1];
    const self = this;
    this.props.dispatch(startRoom());
    this.props.dispatch(checkExistingRoom(roomCode)).then(() => {
      if (self.props.room.success) {
        self.setState({
          redirectExistingRoom: true,
          roomCode: roomCode,
        });
      } else {
        console.log(self.props.room.error);
      }
    });
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
    if (this.state.redirectExistingRoom && this.state.roomCode) {
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

function mapStateToProps(state) {
  return {
    room: state.room,
  };
}

export default connect(mapStateToProps)(Home);
