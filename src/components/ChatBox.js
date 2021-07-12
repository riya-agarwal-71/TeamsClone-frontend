// the chatbox element (chat inside the video call room)
import React, { Component } from "react";
import { IconButton, TextField, Typography } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { connect } from "react-redux";

import "../styles/chatbox.scss";

// the chatbox class component
class ChatBox extends Component {
  constructor(props) {
    super(props);
    // state of the component
    this.state = {
      text: "",
      messages: [],
    };
    // handle the events of sending texts and recieving texts
    this.handleSocketEvents();
  }

  // function to handle message being typed
  handleTextChange = (e) => {
    this.setState({
      text: e.target.value,
    });
  };

  // function to handle the socket event of getting a message
  gotMessageEventHandler = (message, username, fromSocketID) => {
    this.props.gotNewMessage();
    var msgToDispaly = message.split("\n");
    msgToDispaly = msgToDispaly.join("<br/>");
    var msg = { data: msgToDispaly, from: username, fromSocketID };
    var newMsgs = this.state.messages;
    newMsgs.push(msg);
    this.setState({
      messages: newMsgs,
    });
    var allMessages = document.getElementById("chatbox-messages");
    allMessages.scrollTop = allMessages.scrollHeight;
  };

  // function to handle all the socket events
  handleSocketEvents = () => {
    const { socket } = this.props;

    socket.on("message", this.gotMessageEventHandler);
  };

  // function to send a message
  sendMessage = (e) => {
    e.preventDefault();
    var message = this.state.text;
    // only send if msg is empty or not just spaces
    if (message.trim() !== "") {
      this.setState({
        text: "",
      });
      // emit the socket event to send the message
      this.props.socket.emit(
        "message",
        message,
        window.location.href,
        this.props.username,
        this.props.socket.id
      );
    }
  };

  // function to send the message with enter key
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
        {/* The heading */}
        <Typography variant='h5' align='center'>
          CHAT
        </Typography>
        {/* show no msgs if messages array is empty else show the messages */}
        <div id='chatbox-messages' className='messages-container'>
          {this.state.messages.length <= 0 ? (
            <div className='message'>No msgs to show ...</div>
          ) : (
            this.state.messages.map((msg) => {
              return (
                <div className='message'>
                  <div className='user'>
                    {msg.fromSocketID === this.props.socket.id
                      ? "Me"
                      : `${msg.from}`}
                  </div>
                  <div
                    className='data'
                    dangerouslySetInnerHTML={{
                      __html: msg.data,
                    }}
                  ></div>
                </div>
              );
            })
          )}
        </div>
        {/* If user is guest then dont give the input box to send messages else give the input box */}
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

// get access to the guest state in the props
function mapStateToProps(state) {
  return {
    guest: state.guest,
  };
}

export default connect(mapStateToProps)(ChatBox);
