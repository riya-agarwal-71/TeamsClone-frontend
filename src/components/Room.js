import React, { Component } from "react";
import { Toolbar, IconButton, Modal, Button } from "@material-ui/core";
import {
  CallEnd,
  Mic,
  Videocam,
  Info,
  Chat,
  FileCopy,
  MicOff,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
} from "@material-ui/icons";
import { ChatBox } from "./";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatboxVisible: false,
      screenShare: false,
    };
  }

  displayChatbox = (e) => {
    e.preventDefault();
    this.setState((prevState) => {
      return { chatboxVisible: !prevState.chatboxVisible };
    });
    window.setTimeout(() => {
      this.props.getCssStyleForVideos();
    }, 50);
  };

  // handleScreenShare = () => {
  //   this.setState(
  //     (prevState) => {
  //       return { screenShare: !prevState.screenShare };
  //     },
  //     () => {
  //       this.props.handleScreenShare(this.props.screenShare);
  //     }
  //   );
  // };

  render() {
    const {
      socketID,
      myVideoRef,
      videoOn,
      handleInfoModalOpen,
      infoModalOpen,
      handleInfoModalClose,
      url,
      copyJoiningInfo,
      toggleMicState,
      endCall,
      toggleCameraState,
      micOn,
      username,
      socket,
      handleScreenShare,
      screenShare,
    } = this.props;
    return (
      <div className='room-container'>
        <div className='video-chat-container'>
          <div
            id='main'
            className={
              this.state.chatboxVisible
                ? "video-components width-less"
                : "video-components width-full"
            }
          >
            <div className='video' data-socket={`${socketID}`}>
              <video
                ref={myVideoRef}
                autoPlay
                muted
                className='video-element-call'
              ></video>
              <div className='username-video'>
                <h3>ME</h3>
              </div>
              <div className={videoOn ? "dont-show" : "no-video-container"}>
                <div className='logo'>
                  <h1>{username.toUpperCase().substr(0, 1)}</h1>
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              this.state.chatboxVisible
                ? "chatbox-visible"
                : "chatbox-not-visible"
            }
          >
            <ChatBox username={username} socket={socket} />
          </div>
        </div>
        <Toolbar
          className='options-bar in-call'
          style={{ background: "#5a5a5a" }}
        >
          <div>
            <IconButton color='inherit' onClick={handleInfoModalOpen}>
              <Info />
            </IconButton>
            <Modal open={infoModalOpen} onClose={handleInfoModalClose}>
              <div className='joining-info'>
                <h4>Copy Joining Info</h4>
                <div className='joining-info-details'>
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      marginBottom: "4%",
                    }}
                  >
                    URL
                  </div>
                  <div id='url' className='room-id'>
                    {url}
                  </div>
                  <Button
                    variant='outlined'
                    startIcon={<FileCopy />}
                    onClick={copyJoiningInfo}
                  >
                    Copy Joining Info
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
          <div className='call-options'>
            <IconButton
              color='inherit'
              onClick={toggleMicState}
              disabled={screenShare}
            >
              {micOn ? <Mic /> : <MicOff />}
            </IconButton>
            <IconButton color='inherit' onClick={endCall}>
              <CallEnd />
            </IconButton>
            <IconButton
              color='inherit'
              onClick={toggleCameraState}
              disabled={screenShare}
            >
              {videoOn ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </div>
          <div
            style={{
              width: "10%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <IconButton color='inherit' onClick={handleScreenShare}>
              {screenShare ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
            <IconButton color='inherit' onClick={this.displayChatbox}>
              <Chat />
            </IconButton>
          </div>
        </Toolbar>
      </div>
    );
  }
}

export default Room;
