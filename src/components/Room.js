import React from "react";
import { Toolbar, IconButton, Modal, Button } from "@material-ui/core";
import {
  CallEnd,
  Mic,
  Videocam,
  Info,
  // Chat,
  FileCopy,
  MicOff,
  VideocamOff,
} from "@material-ui/icons";

const Room = (props) => {
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
  } = props;
  return (
    <div className='room-container'>
      <div id='main' className='video-components'>
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
        <div>
          {/* <IconButton color="inherit">
              <Chat />
            </IconButton> */}
        </div>
      </Toolbar>
    </div>
  );
};

export default Room;
