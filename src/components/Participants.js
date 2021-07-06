import React, { Component } from "react";
import { Typography } from "@material-ui/core";

import "../styles/participants.scss";
class Participants extends Component {
  render() {
    const participants = this.props.participants;
    console.log(participants);
    return (
      <div className='participants-container'>
        <Typography variant='h5' align='center'>
          PARTICIPANTS
        </Typography>
        <div className='participants-list'>
          <div
            className='participant'
            onClick={() => this.props.focusVideoOf(this.props.socketID)}
          >
            <div className='logo'>
              <h2>M</h2>
            </div>
            <div className='name'>
              <Typography variant='subtitle1'>ME</Typography>
            </div>
          </div>
          {participants.map((p) => {
            return (
              <div
                className='participant'
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
