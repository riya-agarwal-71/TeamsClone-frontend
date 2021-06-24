import React from "react";
import { Toolbar, IconButton, Button } from "@material-ui/core";
import { Mic, Videocam, MicOff, VideocamOff } from "@material-ui/icons";

const AskBeforeEntering = (props) => {
  const {
    toggleMicState,
    toggleCameraState,
    myVideoRef,
    handleJoinCall,
    micOn,
    videoOn,
    loading,
  } = props;
  return (
    <div className="flex-row">
      <div id="my-video">
        <video
          ref={myVideoRef}
          autoPlay
          muted
          className={videoOn ? "video-element" : "blank-video"}
        ></video>
        <Toolbar
          className="options-bar join-call"
          style={{ background: "#5a5a5a" }}
        >
          <div className="call-options">
            <IconButton color="inherit" onClick={toggleMicState}>
              {micOn ? <Mic /> : <MicOff />}
            </IconButton>
            <IconButton color="inherit" onClick={toggleCameraState}>
              {videoOn ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </div>
        </Toolbar>
      </div>
      <Button
        style={{ height: "auto" }}
        onClick={handleJoinCall}
        disabled={loading}
      >
        Enter room
      </Button>
    </div>
  );
};

export default AskBeforeEntering;
