import React, { Component } from "react";
import { IconButton, TextField } from "@material-ui/core";
import { ScreenLockLandscapeTwoTone, Send } from "@material-ui/icons";

import "../styles/chatbox.scss";

class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
    };
    this.handleSocketEvents();
  }

  handleTextChange = (e) => {
    this.setState({
      text: e.target.value,
    });
  };

  gotMessageEventHandler = (message, username, fromSocketID) => {
    console.log("got message from", username);
    var messageContainer = document.createElement("div");
    messageContainer.setAttribute("class", "message");
    var userContainer = document.createElement("div");
    userContainer.setAttribute("class", "user");
    if (fromSocketID === this.props.socket.id) {
      userContainer.innerHTML = "Me";
    } else {
      userContainer.innerHTML = username;
    }
    messageContainer.append(userContainer);
    var dataContainer = document.createElement("div");
    dataContainer.setAttribute("class", "data");
    dataContainer.innerHTML = message;
    messageContainer.append(dataContainer);
    var allMessages = document.getElementById("chatbox-messages");
    allMessages.append(messageContainer);
    allMessages.scrollTop = allMessages.scrollHeight;
  };

  handleSocketEvents = () => {
    const { socket } = this.props;

    socket.on("message", this.gotMessageEventHandler);
  };

  sendMessage = (e) => {
    e.preventDefault();
    var message = this.state.text;
    if (message !== "") {
      this.setState({
        text: "",
      });
    }
    this.props.socket.emit(
      "message",
      message,
      window.location.href,
      this.props.username,
      this.props.socket.id
    );
  };

  render() {
    return (
      <div className='chatbox'>
        <div id='chatbox-messages' className='messages-container'></div>
        <form className='send-text-form' onSubmit={this.sendMessage}>
          <div className='textbox'>
            <TextField
              classes={{ root: "message-input" }}
              placeholder='Start typing...'
              multiline
              rowsMax={3}
              fullWidth
              onChange={this.handleTextChange}
              value={this.state.text}
            />
          </div>
          <IconButton type='submit'>
            <Send fontSize='small' />
          </IconButton>
        </form>
      </div>
    );
  }
}

export default ChatBox;
