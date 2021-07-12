// the ask beofre entering component which shows the screen to set video and audio before entering the room
import React from "react";
import { Toolbar, IconButton, Button } from "@material-ui/core";
import { Mic, Videocam, MicOff, VideocamOff } from "@material-ui/icons";

// ask before entering component (functional)
const AskBeforeEntering = (props) => {
  const {
    toggleMicState,
    toggleCameraState,
    myVideoRef,
    handleJoinCall,
    micOn,
    videoOn,
    loading,
    username,
  } = props;
  return (
    <div className='flex-row'>
      {/* My video div */}
      <div id='my-video'>
        <video
          ref={myVideoRef}
          autoPlay
          muted
          className={videoOn ? "video-element" : "blank-video"}
        ></video>
        <div
          className={videoOn ? "dont-show" : "no-video-container curved-radius"}
          style={{ width: "100%", height: "100%" }}
        >
          <div className='logo'>
            <h1>{username.toUpperCase().substr(0, 1)}</h1>
          </div>
        </div>
        {/* All the actions */}
        <Toolbar
          className='options-bar join-call'
          style={{ background: "#5a5a5a" }}
        >
          <div className='call-options'>
            <IconButton color='inherit' onClick={toggleMicState}>
              {micOn ? <Mic /> : <MicOff />}
            </IconButton>
            <IconButton color='inherit' onClick={toggleCameraState}>
              {videoOn ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </div>
        </Toolbar>
      </div>
      {/* Enter room button */}
      <Button
        style={{ height: "auto" }}
        onClick={handleJoinCall}
        disabled={loading}
        size='large'
      >
        Enter room
      </Button>
    </div>
  );
};

export default AskBeforeEntering;
