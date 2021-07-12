// the component to show the groups and the chat
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { startSocketConnection, connectToSocket } from "../actions/socket";
import { baseUrl } from "../helper/urls";
import randstr from "crypto-random-string";

import { Navbar } from ".";
import "../styles/chats.scss";
import {
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Add, VideoCall, Send, GroupAdd, People } from "@material-ui/icons";
import { getGroups } from "../actions/auth";
import {
  createGroup,
  getMessages,
  addMember,
  clearGroupState,
  getParticipants,
  removeMember,
} from "../actions/groups";
import { sendMessage } from "../actions/message";
import { startRoom, createRoom } from "../actions/room";

// the chat class component
class Chats extends Component {
  constructor(props) {
    super(props);
    this.socket = null;
    this.socketID = null;
    this.prevDate = null;
    // the local state of this component
    this.state = {
      inProgress: null,
      groups: [],
      messages: [],
      selectedGrp: null,
      msgInput: "",
      createGroup: false,
      newGrpName: "",
      showAddParticipant: false,
      newParticipantsEmail: "",
      showParticipantsList: false,
      participants: [],
      admin: null,
    };
  }

  // dispatch the connect to socket method action
  componentDidMount = () => {
    this.props.dispatch(startSocketConnection());
    this.props.dispatch(connectToSocket());
  };

  // if socket is connected then get the groups of the user (only if the socket changes in any manner)
  componentDidUpdate = (prevProps) => {
    if (
      prevProps.socket.socket !== this.props.socket.socket &&
      this.props.socket.socket !== null
    ) {
      this.socket = this.props.socket.socket;
      this.socketID = this.props.socket.socketID;
      this.handleSocketEvents();
      this.setState({
        inProgress: "group",
      });
      this.props.dispatch(getGroups(this.props.auth.user.email)).then(() => {
        if (this.props.auth.groups != null) {
          this.setState({
            groups: this.props.auth.groups,
            inProgress: null,
          });
        }
      });
    }

    // each time the dom updates then scroll to the bottom of the chat box
    var chatBox = document.getElementById("chat-box");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  // function to handle the socket events
  handleSocketEvents = () => {
    // event of addign a participant to the group
    this.socket.on("participant-add-grp", (email, grp) => {
      if (email === this.props.auth.user.email) {
        // update the group array in the state
        var grpArray = this.state.groups;
        grpArray.push(grp);
        this.setState({
          groups: grpArray,
        });
      } else {
        return;
      }
    });

    // event of recieving a new msg on group
    this.socket.on("message-recieved-group", (groupID, message) => {
      if (
        this.state.selectedGrp === null ||
        this.state.selectedGrp._id !== groupID
      ) {
        // handle the notification div display
        let grpDiv = document.querySelector(`[data-grpid="${groupID}"]`);
        if (!grpDiv || grpDiv === null || grpDiv === undefined) {
          return;
        }
        let notification = grpDiv.getElementsByTagName("div")[0];
        notification.style.display = "block";
      } else {
        // handle the notification div display
        let grpDiv = document.querySelector(`[data-grpid="${groupID}"]`);
        if (!grpDiv || grpDiv === null || grpDiv === undefined) {
          return;
        }
        let notification = grpDiv.getElementsByTagName("div")[0];
        notification.style.display = "none";
        // upadte teh messages array if this group is in focus
        var msgsArray = this.state.messages;
        msgsArray.push(message);
        this.setState({
          messages: msgsArray,
        });
      }
    });

    // event of removing participant from a group
    this.socket.on("remove-participant-group", (email, grpID) => {
      if (email !== this.props.auth.user.email) {
        return;
      }

      // delete the group from the groups array in state
      var newGroups = this.state.groups.filter((g) => {
        return g._id !== grpID;
      });
      this.setState({
        groups: newGroups,
      });
      // if selected group is null then return
      if (this.state.selectedGrp === null) {
        return;
      }
      // if this was the selected group then unselect the group
      if (
        this.state.selectedGrp !== null &&
        this.state.selectedGrp !== undefined &&
        this.state.selectedGrp._id === grpID
      ) {
        this.setState({
          messages: [],
          selectedGrp: null,
        });
      }
    });
  };

  // function to handle the create group modal show
  handleCreateGroup = () => {
    this.setState({
      createGroup: true,
    });
  };

  // function to focus on a group (ie show its messages in the message container)
  focusOn = (grp) => {
    this.setState({
      selectedGrp: grp,
    });
    // if any notification remove the notification bar
    var notiDiv = document.querySelector(`[data-grpid="${grp._id}"]`);
    if (notiDiv && notiDiv !== null) {
      notiDiv = notiDiv.getElementsByTagName("div")[0];
      notiDiv.style.display = "none";
    }
    this.setState({
      inProgress: "messages",
    });
    this.props.dispatch(getMessages(grp._id)).then(() => {
      this.setState(
        {
          messages: this.props.group.messages,
          inProgress: null,
        },
        () => {
          this.props.dispatch(clearGroupState());
        }
      );
    });
  };

  // track the message input change
  handleMsgInputChange = (e) => {
    this.setState({
      msgInput: e.target.value,
    });
  };

  // track the group name input change
  handleGroupNameChange = (e) => {
    this.setState({
      newGrpName: e.target.value,
    });
  };

  // function to send the message
  sendAMessage = (e) => {
    e.preventDefault();
    // dont send message if its empty or just spaces
    if (this.state.msgInput.trim() === "") {
      return;
    }
    var msgToSend = this.state.msgInput.split("\n").join("<br/>");
    this.props
      .dispatch(
        sendMessage(
          this.props.auth.user.email,
          this.state.selectedGrp._id,
          msgToSend
        )
      )
      .then(() => {
        // after successfully sending the message
        if (this.props.message.success) {
          this.socket.emit(
            "send-message-group",
            this.state.selectedGrp._id,
            this.props.message.msg
          );
        }
      });
    // set the msg input as empty string
    this.setState({
      msgInput: "",
    });
  };

  // function to create a group
  handleCreateGroupRequest = (e) => {
    e.preventDefault();
    // if group name is empty or just spaces dont create the group
    if (this.state.newGrpName.trim() === "") {
      return;
    }
    this.props
      .dispatch(createGroup(this.props.auth.user.email, this.state.newGrpName))
      .then(() => {
        // update the groups array in the state if group successfully created
        if (this.props.group.success) {
          var grpsArray = this.state.groups;
          grpsArray.push({
            name: this.props.group.id.name,
            _id: this.props.group.id._id,
          });
          this.setState({
            groups: grpsArray,
          });
        }
        // clear the groupstate
        this.props.dispatch(clearGroupState());
      });
    // clear the group name and dont show the group create modal
    this.setState({
      createGroup: false,
      newGrpName: "",
    });
  };

  // if group creation aborted
  handleCancelGrpCreation = (e) => {
    e.preventDefault();
    this.setState({
      newGrpName: "",
      createGroup: false,
    });
  };

  // function to handle the instant meeting event
  createInstantMeeting = (e) => {
    e.preventDefault();
    const newRoomUrl =
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" });
    const self = this;
    // create a room and open a new window with the url
    this.props.dispatch(startRoom());
    this.props.dispatch(createRoom(newRoomUrl)).then(() => {
      if (self.props.room.success) {
        window.open(`${baseUrl}/room/${newRoomUrl}`);
      }
    });
  };

  // track the participant email input change
  handleParticipantEmailChange = (e) => {
    this.setState({
      newParticipantsEmail: e.target.value,
    });
  };

  // handle the show add particpinat modal
  addParticipant = (e) => {
    e.preventDefault();
    this.setState({
      showAddParticipant: true,
    });
  };

  // add participant event
  addParticipantEvent = (e) => {
    e.preventDefault();
    // dont add if email is null or is just spaces
    if (this.state.newParticipantsEmail.trim() === "") {
      return;
    }
    // dispatch add memeber
    this.props
      .dispatch(
        addMember(
          this.props.auth.user.email,
          this.state.newParticipantsEmail,
          this.state.selectedGrp._id
        )
      )
      .then(() => {
        // emit the add participant event
        if (this.props.group.success) {
          this.socket.emit(
            "add-participant-group",
            this.state.newParticipantsEmail,
            this.state.selectedGrp
          );
        }
        // display the div fro 2 secs with the error or success notification
        setTimeout(() => {
          var newmail = this.state.newParticipantsEmail;
          this.setState({
            showAddParticipant: false,
            newParticipantsEmail: "",
          });
          var success = this.props.group.success;
          // clear the group state
          this.props.dispatch(clearGroupState());
          if (success !== null) {
            // send the message in group of adding a new participant
            this.props
              .dispatch(
                sendMessage(
                  this.props.auth.user.email,
                  this.state.selectedGrp._id,
                  `Added a participant ${newmail}`
                )
              )
              .then(() => {
                if (this.props.message.success) {
                  this.socket.emit(
                    "send-message-group",
                    this.state.selectedGrp._id,
                    this.props.message.msg
                  );
                }
              });
          }
        }, 2000);
      });
  };

  // handle the show participants list modal
  showParticipantsList = (e) => {
    e.preventDefault();
    this.setState({
      showParticipantsList: true,
    });
    // get the participants and update the state
    this.props
      .dispatch(getParticipants(this.state.selectedGrp._id))
      .then(() => {
        if (this.props.group.success !== null) {
          this.setState({
            participants: this.props.group.messages,
            admin: this.props.group.admin,
          });
        } else {
          this.setState({
            showParticipantsList: false,
          });
        }
        this.props.dispatch(clearGroupState());
      });
  };

  // function to abort the participant addition
  handleCancelParticipantAddition = (e) => {
    e.preventDefault();
    this.setState({
      showAddParticipant: false,
      newParticipantsEmail: "",
    });
  };

  // function to close the participants list
  closeParticipantsList = (e) => {
    e.preventDefault();
    this.setState({
      showParticipantsList: false,
    });
  };

  // function to create a meet in the group
  createAMeetInGroup = (e) => {
    e.preventDefault();
    const newRoomUrl =
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" }) +
      "-" +
      randstr({ length: 5, type: "alphanumeric" });
    const self = this;
    this.props.dispatch(startRoom());
    this.props.dispatch(createRoom(newRoomUrl)).then(() => {
      if (self.props.room.success) {
        // open the window with the meet and send the meet url to the group as a msg
        window.open(`${baseUrl}/room/${newRoomUrl}`);
        this.props
          .dispatch(
            sendMessage(
              this.props.auth.user.email,
              this.state.selectedGrp._id,
              `I am inviting you to a meeting. Click on the url to join !! <br> <a href = '${baseUrl}/room/${newRoomUrl}'>${baseUrl}/room/${newRoomUrl}</a>`
            )
          )
          .then(() => {
            if (this.props.message.success) {
              this.socket.emit(
                "send-message-group",
                this.state.selectedGrp._id,
                this.props.message.msg
              );
            }
          });
      } else {
        console.log(self.props.room.error);
      }
    });
  };

  // function to remove a participant
  handleRemoveParticipant = (by, to) => {
    this.props
      .dispatch(removeMember(by, to, this.state.selectedGrp._id))
      .then(() => {
        if (this.props.group.success !== null) {
          // if removed successfully then emit the sokcet event as well as
          // send a message to the group that participant has been removed
          this.socket.emit(
            "remove-participant-group",
            to,
            this.state.selectedGrp._id
          );
          this.props.dispatch(clearGroupState());
          this.props
            .dispatch(
              sendMessage(
                this.props.auth.user.email,
                this.state.selectedGrp._id,
                `removed ${to} from the group`
              )
            )
            .then(() => {
              if (this.props.message.success) {
                this.socket.emit(
                  "send-message-group",
                  this.state.selectedGrp._id,
                  this.props.message.msg
                );
              }
            });
        }
      });
    this.setState({
      showParticipantsList: false,
    });
  };

  // function to send the message with enter key
  sendMessageEnter = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      return;
    } else if (e.key === "Enter") {
      this.sendAMessage(e);
    }
  };

  render() {
    // redirect to home if not logged in
    if (!this.props.auth.isLoggedIn) {
      return <Redirect to='/' />;
    }
    return (
      <div>
        <Navbar />
        <div className='container'>
          {this.state.createGroup && (
            <div className='create-group-modal'>
              {/* Create a group modal */}
              <Paper className='create-group-paper'>
                <Typography variant='h4'>CREATE A GROUP</Typography>
                <TextField
                  placeholder='Enter the name of the group'
                  fullWidth
                  onChange={this.handleGroupNameChange}
                  value={this.state.newGrpName}
                />
                <div className='create-room-buttons'>
                  <div>
                    <Button
                      onClick={this.handleCreateGroupRequest}
                      variant='contained'
                      color='primary'
                    >
                      Create
                    </Button>
                  </div>
                  <div>
                    <Button
                      onClick={this.handleCancelGrpCreation}
                      variant='contained'
                      color='secondary'
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Paper>
            </div>
          )}

          {this.state.showParticipantsList && (
            <div className='create-group-modal'>
              {/* Participant slist modal */}
              <Paper className='create-group-paper'>
                <Typography variant='h4'>PARTICIPANTS</Typography>
                <div className='participants-container'>
                  {this.state.participants.map((p) => {
                    return (
                      <div
                        className='participant'
                        style={{ position: "relative" }}
                      >
                        <div>
                          {p.name}{" "}
                          {p.email === this.props.auth.user.email ? "(ME)" : ""}
                          <div
                            style={{
                              position: "absolute",
                              right: "2rem",
                              top: "1rem",
                            }}
                          >
                            {this.state.admin !== null &&
                              this.state.admin.email === p.email &&
                              "ADMIN"}
                          </div>
                        </div>
                        <div
                          style={{ fontWeight: "lighter", fontSize: "0.8rem" }}
                        >
                          {p.email}
                        </div>
                        {this.state.admin.email ===
                          this.props.auth.user.email &&
                          p.email !== this.props.auth.user.email && (
                            <div
                              style={{ position: "absolute", right: "1rem" }}
                            >
                              <Button
                                size='small'
                                variant='contained'
                                color='secondary'
                                onClick={() => {
                                  this.handleRemoveParticipant(
                                    this.state.admin.email,
                                    p.email
                                  );
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={this.closeParticipantsList}
                  variant='contained'
                  color='secondary'
                >
                  Close
                </Button>
              </Paper>
            </div>
          )}

          {this.state.showAddParticipant && (
            <div className='create-group-modal'>
              {/* Add participnat modal */}
              <Paper className='create-group-paper'>
                {this.props.group.success !== null && (
                  <Alert severity='success'>{this.props.group.success}</Alert>
                )}
                {this.props.group.error !== null && (
                  <Alert severity='error'>{this.props.group.error}</Alert>
                )}
                <Typography variant='h4'>ADD A PARTICIPANT</Typography>
                <TextField
                  placeholder='Enter the Email Id of the person'
                  fullWidth
                  type='email'
                  onChange={this.handleParticipantEmailChange}
                  value={this.state.newParticipantsEmail}
                />
                <div className='create-room-buttons'>
                  <div>
                    <Button
                      onClick={this.addParticipantEvent}
                      variant='contained'
                      color='primary'
                    >
                      Add
                    </Button>
                  </div>
                  <div>
                    <Button
                      onClick={this.handleCancelParticipantAddition}
                      variant='contained'
                      color='secondary'
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Paper>
            </div>
          )}

          <div className='group-names'>
            <div className='centerd'>
              <Button onClick={this.handleCreateGroup} startIcon={<Add />}>
                Create a group
              </Button>
            </div>
            <div style={{ height: 15, width: 10 }}></div>
            <div className='centerd'>
              <Button
                onClick={this.createInstantMeeting}
                color='secondary'
                startIcon={<VideoCall />}
              >
                Start An Instant Meeting
              </Button>
            </div>
            <div style={{ height: 15, width: 10 }}></div>
            <div className='centerd'>
              <Typography variant='h4'>GROUPS</Typography>
            </div>
            {/* Groups of user */}
            {this.state.inProgress === "group" ? (
              <div className='centerd' style={{ marginTop: "2rem" }}>
                <CircularProgress />
              </div>
            ) : (
              <div className='grp-container'>
                {this.state.groups.length <= 0 && (
                  <div style={{ padding: "0.5rem" }}>No groups to show</div>
                )}
                {this.state.groups.map((group) => {
                  return (
                    <div
                      className={
                        this.state.selectedGrp !== null &&
                        this.state.selectedGrp._id === group._id
                          ? "grp selected"
                          : "grp"
                      }
                      style={{ position: "relative" }}
                      data-grpid={group._id}
                      onClick={() => this.focusOn(group)}
                    >
                      {group.name}
                      <div className='new-msg-noti-visible'>NEW MESSAGE !</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Messages in the group */}
          <div className='group-messages'>
            {this.state.selectedGrp === null ? (
              <div style={{ padding: "1rem" }}>
                Select a group to view messages
              </div>
            ) : this.state.inProgress === "messages" ? (
              <div className='centerd' style={{ marginTop: "2rem" }}>
                <CircularProgress />
              </div>
            ) : (
              <div>
                <div className='buttons-grp-settings'>
                  <IconButton onClick={this.addParticipant}>
                    <GroupAdd color='primary' fontSize='medium' />
                  </IconButton>
                  <IconButton onClick={this.createAMeetInGroup}>
                    <VideoCall color='secondary' fontSize='medium' />
                  </IconButton>
                  <IconButton onClick={this.showParticipantsList}>
                    <People fontSize='medium' />
                  </IconButton>
                </div>
                <div className='centerd'>
                  <Typography variant='h4'>
                    {this.state.selectedGrp.name}
                  </Typography>
                </div>
                <div style={{ height: "1rem", width: "1rem" }}></div>
                <div className='all-msgs' id='chat-box'>
                  {this.state.messages.length >= 1 ? (
                    this.state.messages.map((msg) => {
                      return (
                        <div
                          className={
                            msg.from.email === this.props.auth.user.email
                              ? "my-text msg"
                              : "msg"
                          }
                        >
                          <div className='date'>
                            {
                              new Date(msg.createdAt)
                                .toString("YYYY-MM-dd")
                                .split("GMT")[0]
                            }
                          </div>
                          <div className='from-user'>
                            {msg.from.email === this.props.auth.user.email
                              ? "ME"
                              : msg.from.name}
                          </div>
                          <div
                            className='msg-data'
                            dangerouslySetInnerHTML={{ __html: msg.message }}
                          ></div>
                        </div>
                      );
                    })
                  ) : (
                    <div>No messages to show</div>
                  )}
                </div>

                {/* Send a message to group form */}
                <form
                  onSubmit={this.sendAMessage}
                  onKeyPress={this.sendMessageEnter}
                  className='send-text-form'
                >
                  <div className='textbox'>
                    <TextField
                      classes={{ root: "message-input" }}
                      placeholder='Start typing...'
                      multiline
                      rowsMax={2}
                      fullWidth
                      autoFocus
                      onChange={this.handleMsgInputChange}
                      value={this.state.msgInput}
                    />
                  </div>
                  <div className='send-message-btn'>
                    <IconButton type='submit'>
                      <Send fontSize='small' />
                    </IconButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// get the access of the required state in the props
function mapStateToProps(state) {
  return {
    auth: state.auth,
    socket: state.socket,
    group: state.group,
    room: state.room,
    message: state.message,
  };
}

export default connect(mapStateToProps)(Chats);
