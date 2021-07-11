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

class Chats extends Component {
  constructor(props) {
    super(props);
    this.socket = null;
    this.socketID = null;
    this.prevDate = null;
    this.state = {
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

  handleSocketEvents = () => {
    this.socket.on("participant-add-grp", (email, grpID) => {
      if (email === this.props.auth.user.email) {
        this.props.dispatch(getGroups(this.props.auth.user.email)).then(() => {
          if (this.props.auth.groups != null) {
            this.setState({
              groups: this.props.auth.groups,
            });
          }
        });
      } else {
        return;
      }
    });

    this.socket.on("message-recieved-group", (groupID) => {
      if (
        this.state.selectedGrp === null ||
        this.state.selectedGrp._id !== groupID
      ) {
        let grpDiv = document.querySelector(`[data-grpid="${groupID}"]`);
        if (!grpDiv || grpDiv === null || grpDiv === undefined) {
          return;
        }
        let notification = grpDiv.getElementsByTagName("div")[0];
        notification.style.display = "block";
      } else {
        let grpDiv = document.querySelector(`[data-grpid="${groupID}"]`);
        if (!grpDiv || grpDiv === null || grpDiv === undefined) {
          return;
        }
        let notification = grpDiv.getElementsByTagName("div")[0];
        notification.style.display = "none";
        this.props.dispatch(getMessages(groupID)).then(() => {
          console.log(this.props.group.messages);
          this.setState(
            {
              messages: this.props.group.messages,
            },
            () => {
              this.props.dispatch(clearGroupState());
            }
          );
        });
      }
    });

    this.socket.on("remove-participant-group", (email, grpID) => {
      if (email !== this.props.auth.user.email) {
        return;
      }
      this.props.dispatch(getGroups(this.props.auth.user.email)).then(() => {
        if (this.props.auth.groups != null) {
          this.setState({
            groups: this.props.auth.groups,
          });
        }
      });
      if (this.state.selectedGrp === null) {
        return;
      }
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

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.socket.socket !== this.props.socket.socket &&
      this.props.socket.socket !== null
    ) {
      this.socket = this.props.socket.socket;
      this.socketID = this.props.socket.socketID;
      this.handleSocketEvents();
      this.props.dispatch(getGroups(this.props.auth.user.email)).then(() => {
        if (this.props.auth.groups != null) {
          this.setState({
            groups: this.props.auth.groups,
          });
        }
      });
    }

    var chatBox = document.getElementById("chat-box");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  handleCreateGroup = () => {
    this.setState({
      createGroup: true,
    });
  };

  componentDidMount = () => {
    this.props.dispatch(startSocketConnection());
    this.props.dispatch(connectToSocket());
  };

  focusOn = (grp) => {
    this.setState({
      selectedGrp: grp,
    });
    var notiDiv = document.querySelector(`[data-grpid="${grp._id}"]`);
    if (notiDiv && notiDiv !== null) {
      notiDiv = notiDiv.getElementsByTagName("div")[0];
      notiDiv.style.display = "none";
    }
    this.props.dispatch(getMessages(grp._id)).then(() => {
      console.log(this.props.group.messages);
      this.setState(
        {
          messages: this.props.group.messages,
        },
        () => {
          this.props.dispatch(clearGroupState());
        }
      );
    });
  };

  handleMsgInputChange = (e) => {
    this.setState({
      msgInput: e.target.value,
    });
  };

  handleGroupNameChange = (e) => {
    this.setState({
      newGrpName: e.target.value,
    });
  };

  sendAMessage = (e) => {
    e.preventDefault();
    if (this.state.msgInput.trim() === "") {
      return;
    }
    this.props
      .dispatch(
        sendMessage(
          this.props.auth.user.email,
          this.state.selectedGrp._id,
          this.state.msgInput
        )
      )
      .then(() => {
        this.socket.emit("send-message-group", this.state.selectedGrp._id);
        this.props
          .dispatch(getMessages(this.state.selectedGrp._id))
          .then(() => {
            console.log(this.props.group.messages);
            this.setState(
              {
                messages: this.props.group.messages,
              },
              () => {
                this.props.dispatch(clearGroupState());
              }
            );
          });
      });
    this.setState({
      msgInput: "",
    });
  };

  handleCreateGroupRequest = (e) => {
    // e.preventDeafult();
    if (this.state.newGrpName.trim() === "") {
      return;
    }
    this.props
      .dispatch(createGroup(this.props.auth.user.email, this.state.newGrpName))
      .then(() => {
        this.props.dispatch(getGroups(this.props.auth.user.email)).then(() => {
          if (this.props.auth.groups != null) {
            this.setState(
              {
                groups: this.props.auth.groups,
              },
              () => {
                this.props.dispatch(clearGroupState());
              }
            );
          }
        });
      });
    this.setState({
      createGroup: false,
      newGrpName: "",
    });
  };

  handleCancelGrpCreation = (e) => {
    e.preventDefault();
    this.setState({
      newGrpName: "",
      createGroup: false,
    });
  };

  createInstantMeeting = (e) => {
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
        window.open(`${baseUrl}/room/${newRoomUrl}`);
      } else {
        console.log(self.props.room.error);
      }
    });
  };

  handleParticipantEmailChange = (e) => {
    this.setState({
      newParticipantsEmail: e.target.value,
    });
  };

  addParticipant = (e) => {
    e.preventDefault();
    this.setState({
      showAddParticipant: true,
    });
  };

  addParticipantEvent = (e) => {
    e.preventDefault();
    if (this.state.newParticipantsEmail.trim() === "") {
      return;
    }
    this.props
      .dispatch(
        addMember(
          this.props.auth.user.email,
          this.state.newParticipantsEmail,
          this.state.selectedGrp._id
        )
      )
      .then(() => {
        this.socket.emit(
          "add-participant-group",
          this.state.newParticipantsEmail,
          this.state.selectedGrp._id
        );
        setTimeout(() => {
          var newmail = this.state.newParticipantsEmail;
          this.setState({
            showAddParticipant: false,
            newParticipantsEmail: "",
          });
          var success = this.props.group.success;
          this.props.dispatch(clearGroupState());
          if (success !== null) {
            this.props
              .dispatch(
                sendMessage(
                  this.props.auth.user.email,
                  this.state.selectedGrp._id,
                  `Added a participant ${newmail}`
                )
              )
              .then(() => {
                this.socket.emit(
                  "send-message-group",
                  this.state.selectedGrp._id
                );
                this.props
                  .dispatch(getMessages(this.state.selectedGrp._id))
                  .then(() => {
                    console.log(this.props.group.messages);
                    this.setState(
                      {
                        messages: this.props.group.messages,
                      },
                      () => {
                        this.props.dispatch(clearGroupState());
                      }
                    );
                  });
              });
          }
        }, 2000);
      });
  };

  showParticipantsList = (e) => {
    e.preventDefault();
    this.setState({
      showParticipantsList: true,
    });
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

  handleCancelParticipantAddition = (e) => {
    e.preventDefault();
    this.setState({
      showAddParticipant: false,
      newParticipantsEmail: "",
    });
  };

  closeParticipantsList = (e) => {
    e.preventDefault();
    this.setState({
      showParticipantsList: false,
    });
  };

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
            this.socket.emit("send-message-group", this.state.selectedGrp._id);
          });
      } else {
        console.log(self.props.room.error);
      }
    });
  };

  handleRemoveParticipant = (by, to) => {
    this.props
      .dispatch(removeMember(by, to, this.state.selectedGrp._id))
      .then(() => {
        if (this.props.group.success !== null) {
          this.socket.emit(
            "remove-participant-group",
            to,
            this.state.selectedGrp._id
          );
          this.props
            .dispatch(
              sendMessage(
                this.props.auth.user.email,
                this.state.selectedGrp._id,
                `removed ${to} from the group`
              )
            )
            .then(() => {
              this.socket.emit(
                "send-message-group",
                this.state.selectedGrp._id
              );
              this.props
                .dispatch(getMessages(this.state.selectedGrp._id))
                .then(() => {
                  console.log(this.props.group.messages);
                  this.setState(
                    {
                      messages: this.props.group.messages,
                    },
                    () => {
                      this.props.dispatch(clearGroupState());
                    }
                  );
                });
            });
        }
      });
    this.setState({
      showParticipantsList: false,
    });
  };

  render() {
    if (!this.props.auth.isLoggedIn) {
      return <Redirect to='/' />;
    }
    return (
      <div>
        <Navbar />
        <div className='container'>
          {this.state.createGroup && (
            <div className='create-group-modal'>
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
            <div className='grp-container'>
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
          </div>
          <div className='group-messages'>
            {this.state.selectedGrp === null ? (
              <div>Select a group to view messages</div>
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

                <form onSubmit={this.sendAMessage} className='send-text-form'>
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

function mapStateToProps(state) {
  return {
    auth: state.auth,
    socket: state.socket,
    group: state.group,
    room: state.room,
  };
}

export default connect(mapStateToProps)(Chats);
