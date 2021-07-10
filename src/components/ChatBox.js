import React, { Component } from "react";
import { IconButton, TextField, Typography } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { connect } from "react-redux";

import "../styles/chatbox.scss";

class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      msgThere: false,
    };
    this.handleSocketEvents();
  }

  handleTextChange = (e) => {
    this.setState({
      text: e.target.value,
    });
  };

  gotMessageEventHandler = (message, username, fromSocketID) => {
    this.setState({
      msgThere: true,
    });
    this.props.gotNewMessage();
    var msgToDispaly = message.split("\n");
    msgToDispaly = msgToDispaly.join("<br/>");
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
    dataContainer.innerHTML = msgToDispaly;
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
    if (message.trim() !== "") {
      this.setState({
        text: "",
      });
      this.props.socket.emit(
        "message",
        message,
        window.location.href,
        this.props.username,
        this.props.socket.id
      );
    }
  };

  sendMessageEnter = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      return;
    } else if (e.key === "Enter") {
      this.sendMessage(e);
    }
  };

  render() {
    return (
      <div className='chatbox'>
        <Typography variant='h5' align='center'>
          CHAT
        </Typography>
        <div id='chatbox-messages' className='messages-container'>
          {!this.state.msgThere && (
            <div className='message'>No msgs to show ...</div>
          )}
        </div>
        {this.props.guest.isLoggedIn ? (
          <div className='send-text-form'>
            <div className='guest-chatbox'>
              Please login to send messages...
            </div>
          </div>
        ) : (
          <form
            className='send-text-form'
            onSubmit={this.sendMessage}
            onKeyPress={this.sendMessageEnter}
          >
            <div className='textbox'>
              <TextField
                classes={{ root: "message-input" }}
                placeholder='Start typing...'
                multiline
                rowsMax={3}
                fullWidth
                autoFocus
                onChange={this.handleTextChange}
                value={this.state.text}
              />
            </div>
            <div className='send-message-btn'>
              <IconButton type='submit'>
                <Send fontSize='small' />
              </IconButton>
            </div>
          </form>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    guest: state.guest,
  };
}

export default connect(mapStateToProps)(ChatBox);
