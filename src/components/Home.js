import React, { Component } from "react";
import { Button, Typography, TextField, Link } from "@material-ui/core";
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
      redirectToChats: false,
    };
  }

  componentDidMount = () => {
    if (this.props.auth.isLoggedIn) {
      this.setState({
        redirectToChats: true,
      });
    }
  };

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
    if (this.state.redirectToChats) {
      return <Redirect to='/chats' />;
    }
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
        <div style={{ marginBottom: "5px" }}></div>
        <div className='details'>
          <Typography variant='h5' className='first-text change-font'>
            Connecting with friends and family has never been easier !!
            <div className='buttons'>
              <Button
                className='btn-margin'
                variant='outlined'
                onClick={this.createNewRoom}
              >
                Create a Room
              </Button>
              <div className='my-flex-row'>
                <TextField
                  placeholder='Enter the room id'
                  onChange={this.handleRoomIdChange}
                />
                <div style={{ marginRight: "1rem" }}></div>
                <Button
                  className='btn-margin'
                  variant='outlined'
                  onClick={this.redirectToRoom}
                >
                  Join an existing room
                </Button>
              </div>
            </div>
          </Typography>
          <img
            alt='meet sample'
            className='first-image'
            src='https://fj-employer-blog.s3.amazonaws.com/employer-blog/wp-content/uploads/2020/03/26155349/Keep-Team-Connected.png'
          />
        </div>
        <div
          className='details'
          style={{ backgroundColor: "rgb(227,241,254)" }}
        >
          <img
            alt='video call sample'
            className='second-image'
            src='https://www.apptunix.com/blog/wp-content/uploads/sites/3/2020/06/Zoom-app-banner.jpg'
          />
          <div className='second-text change-font'>
            <Typography variant='h5'>
              <strong style={{ fontWeight: "bolder" }}>CALL : </strong>
            </Typography>
            <span> &nbsp; &nbsp;</span>
            <Typography variant='h6'>
              Share your opinion and catch up with your group...
            </Typography>
          </div>
        </div>
        <div
          className='details'
          style={{ backgroundColor: "rgb(254,245,240)" }}
        >
          <div className='third-text change-font'>
            <Typography variant='h5'>
              <strong style={{ fontWeight: "bolder" }}>CHAT : </strong>
            </Typography>
            <span> &nbsp; &nbsp;</span>
            <Typography variant='h6'>
              Send messages without disrupting the flow of the meeting...
            </Typography>
          </div>
          <img
            alt='chat sample'
            className='first-image'
            src='https://thumbs.dreamstime.com/b/online-video-chat-cartoon-happy-young-friend-characters-chatting-videoconference-desktop-app-online-video-chat-flat-vector-195813393.jpg'
          />
        </div>
        <div className='details'>
          <img
            alt='screen share sample'
            className='second-image'
            src='https://eztalks.com/res/2021/03-16/13/00c4114b40f827b2b217ec0a0624490f.png'
          />
          <div className='second-text change-font'>
            <Typography variant='h5'>
              <strong style={{ fontWeight: "bolder" }}>SCREEN SHARE : </strong>
            </Typography>
            <span> &nbsp; &nbsp;</span>
            <Typography variant='h6'>
              Collaborate easily with the screen share option...
            </Typography>
          </div>
        </div>
        <div
          className='last-div'
          style={{
            backgroundImage:
              "linear-gradient(to bottom, white , rgb(227,241,254) 90%)",
          }}
        >
          <Typography variant='h5'>
            <Link
              color='textPrimary'
              href='/signup'
              onClick={(e) => e.preventDefault}
            >
              <strong style={{ fontWeight: "bolder" }}>SIGN UP NOW !!</strong>
            </Link>
          </Typography>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    room: state.room,
    auth: state.auth,
  };
}

export default connect(mapStateToProps)(Home);
