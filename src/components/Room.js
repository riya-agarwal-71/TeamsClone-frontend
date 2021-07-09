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
  PausePresentation,
  People,
} from "@material-ui/icons";
import { ChatBox, Participants } from "./";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatboxVisible: false,
      screenShare: false,
      participantsListVisible: false,
    };
  }

  componentDidMount = () => {
    const self = this;
    var main = document.getElementById("main");
    const resize = new ResizeObserver(() => {
      self.props.getCssStyleForVideos();
    });
    console.log(main);
    if (main !== null) {
      resize.observe(main);
    }
  };

  displayChatbox = (e) => {
    e.preventDefault();
    this.setState(
      (prevState) => {
        return {
          chatboxVisible: !prevState.chatboxVisible,
          participantsListVisible: false,
        };
      },
      () => {
        this.props.getCssStyleForVideos();
      }
    );
  };

  displayParticipantsList = (e) => {
    e.preventDefault();
    this.setState(
      (prevState) => {
        return {
          chatboxVisible: false,
          participantsListVisible: !prevState.participantsListVisible,
        };
      },
      () => {
        this.props.getCssStyleForVideos();
      }
    );
  };

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
      showSSModal,
      handleSSModalClose,
      participants,
      focusVideoOf,
      cancelFocusOn,
      focusOn,
    } = this.props;
    return (
      <div className='room-container'>
        <div className='video-chat-container'>
          <div id='screen-share' className='my-ss-screen'>
            <div>
              <h2>You are currently Presenting</h2>
            </div>
            <div>
              <Button
                variant='contained'
                color='secondary'
                startIcon={<PausePresentation />}
                onClick={handleScreenShare}
              >
                Stop Presenting
              </Button>
            </div>
          </div>
          <div
            id='main'
            className={
              (this.state.chatboxVisible ||
                this.state.participantsListVisible) &&
              screenShare
                ? "video-components width-less-ss"
                : (this.state.chatboxVisible ||
                    this.state.participantsListVisible) &&
                  !screenShare
                ? "video-components width-less"
                : screenShare
                ? "video-components width-full-ss"
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
                {focusOn !== null ? (
                  <div className='focus-on-container'>
                    <div className='focuson-icon'>
                      <IconButton onClick={cancelFocusOn} size='large'>
                        <img
                          alt='unpin'
                          src='https://img.icons8.com/ios-glyphs/30/ffffff/unpin.png'
                        />
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <div className='focus-on-container'>
                    <div className='focuson-icon'>
                      <IconButton
                        onClick={() => {
                          focusVideoOf(socketID);
                        }}
                        size='large'
                      >
                        <img
                          alt='pin'
                          src='https://img.icons8.com/ios-glyphs/30/ffffff/pin3--v1.png'
                        />
                      </IconButton>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={
                  videoOn || screenShare ? "dont-show" : "no-video-container"
                }
              >
                <div className='logo'>
                  <h1>{username.toUpperCase().substr(0, 1)}</h1>
                </div>
              </div>
            </div>

            {participants.map((p) => {
              return (
                <div className='video' data-socket={`${p.socketid}`}>
                  <video autoPlay className='video-element-call'></video>
                  <div className='username-video'>
                    <h3>{p.username}</h3>
                    {focusOn !== null ? (
                      <div className='focus-on-container'>
                        <div className='focuson-icon'>
                          <IconButton onClick={cancelFocusOn} size='large'>
                            <img
                              alt='unpin'
                              src='https://img.icons8.com/ios-glyphs/30/ffffff/unpin.png'
                            />
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <div className='focus-on-container'>
                        <div className='focuson-icon'>
                          <IconButton
                            onClick={() => {
                              focusVideoOf(p.socketid);
                            }}
                            size='large'
                          >
                            <img
                              alt='pin'
                              src='https://img.icons8.com/ios-glyphs/30/ffffff/pin3--v1.png'
                            />
                          </IconButton>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className='logo'>
                      <h1>{p.username.toUpperCase().substr(0, 1)}</h1>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className={
              this.state.participantsListVisible
                ? "chatbox-visible"
                : "chatbox-not-visible"
            }
          >
            <Participants
              participants={participants}
              socketID={socketID}
              focusVideoOf={focusVideoOf}
            />
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
            <IconButton color='inherit' onClick={toggleMicState}>
              {micOn ? <Mic /> : <MicOff />}
            </IconButton>
            <IconButton color='inherit' onClick={endCall}>
              <CallEnd />
            </IconButton>
            <IconButton color='inherit' onClick={toggleCameraState}>
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
            <Modal open={showSSModal} onClose={handleSSModalClose}>
              <div className='ss-modal'>
                A participant is already sharing screen
              </div>
            </Modal>
            <IconButton color='inherit' onClick={this.displayParticipantsList}>
              <People />
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
