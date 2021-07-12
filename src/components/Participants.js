// the component to display the participants list in the room
import React, { Component } from "react";
import { Typography } from "@material-ui/core";

import "../styles/participants.scss";

// react class component
class Participants extends Component {
  render() {
    const participants = this.props.participants;
    return (
      <div className='participants-container' style={{ width: "100%" }}>
        {/* Heading */}
        <Typography variant='h5' align='center'>
          PARTICIPANTS
        </Typography>
        <div className='participants-list'>
          {/* Display me at the top */}
          <div
            className='participant-video-call'
            onClick={() => this.props.focusVideoOf(this.props.socketID)}
          >
            <div className='logo'>
              <h2>M</h2>
            </div>
            <div className='name'>
              <Typography variant='subtitle1'>ME</Typography>
            </div>
          </div>
          {/* Display all the participants */}
          {/* Add a onClick event listener to pin the video of the participant */}
          {participants.map((p) => {
            return (
              <div
                className='participant-video-call'
                onClick={() => this.props.focusVideoOf(p.socketid)}
              >
                <div className='logo'>
                  <h2>{p.username.substr(0, 1).toUpperCase()}</h2>
                </div>
                <div className='name'>
                  <Typography variant='subtitle1'>{p.username}</Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Participants;
