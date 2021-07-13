// the wrapper component for the room component where most of the work happens
import React, { Component } from "react";
import { io } from "socket.io-client";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import { server_url } from "../helper/urls";
import { AskBeforeEntering, Room } from ".";
import "../styles/room.scss";
import { checkExistingRoom } from "../actions/room";
import { Button, Typography } from "@material-ui/core";

const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

class RoomWrapper extends Component {
  constructor(props) {
    super(props);
    this.username = "";
    this.myVideoRef = React.createRef();
    this.videoAvailable = false;
    this.audioAvailable = false;
    this.socket = null;
    this.socketID = null;
    this.connections = {};
    this.audioTrack = null;
    this.videoTrack = null;

    // the local state of the component
    this.state = {
      infoModalOpen: false,
      isAccepted: false,
      videoOn: false,
      micOn: false,
      loading: true,
      roomExist: true,
      redirectHome: false,
      screenShare: false,
      screenShareBy: "",
      screenShareOther: false,
      showSSModal: false,
      members: [],
      focusOn: null,
    };

    this.url = window.location.href;
    this.roomID = props.history.location.pathname.split("/");
    this.roomID = this.roomID[this.roomID.length - 1];

    // if the user is logged in then use the username from the auth state else from the guest state
    if (localStorage.token) {
      this.username = this.props.auth.user.name;
    } else {
      this.username = this.props.guest.username;
    }
    this.checkIfRoomExists();
  }

  // function to check if the room exists
  checkIfRoomExists = () => {
    let url = window.location.href;
    let roomCode = url.split("/");
    roomCode = roomCode[roomCode.length - 1];
    const self = this;
    this.props.dispatch(checkExistingRoom(roomCode)).then(() => {
      // if its doesnt toggle the roomExists in state
      if (!self.props.room.success) {
        self.setState({
          roomExist: false,
        });
      } else {
        // else get permissions to use the camera and mic
        self.getUserPermissions();
      }
    });
  };

  // get the css style for the room
  getCssStyleForVideos = () => {
    var main = document.getElementById("main");
    if (!main) {
      return;
    }
    var { width, height } = main.getBoundingClientRect();
    var videos = [...document.getElementsByClassName("video")];
    var max_height;
    var max_width;
    var videoTag;

    // if any video is pinned then show its in the whole main div
    if (this.state.focusOn !== null) {
      for (let i = 0; i < videos.length; i++) {
        videos[i].style.display = "none";
      }
      var focus = this.state.focusOn;
      var video = document.querySelector(`[data-socket="${focus}"]`);
      if (video) {
        videoTag = video.getElementsByTagName("video")[0];
        video.style.display = "block";
        videoTag.height = height;
        videoTag.width = width;
        video.style.height = height + "px";
        video.style.width = width + "px";
      }
    }

    // if screen share is on (my screen share) then show the screen share div
    if (this.state.screenShare) {
      let ssScreen = document.getElementById("screen-share");
      ssScreen.style.display = "flex";
      ssScreen.style.zIndex = 10;
    } else {
      let ssScreen = document.getElementById("screen-share");
      ssScreen.style.display = "none";
      ssScreen.style.zIndex = -1;
    }

    // if i didnt pin myself show my video at the top right corner
    if (this.state.focusOn !== this.socketID) {
      var myVideo;
      if (videos.length > 1) {
        myVideo = videos[0];
        videos.splice(0, 1);
        myVideo.style.display = "block";
        videoTag = myVideo.getElementsByTagName("video")[0];
        videoTag.height = 110;
        videoTag.width = 170;
        var logo = myVideo.getElementsByClassName("logo")[0];
        logo.style.width = 50 + "px";
        logo.style.height = 50 + "px";
        var heading = logo.getElementsByTagName("h1")[0];
        heading.style.fontSize = "2rem";
        myVideo.style.height = 110 + "px";
        myVideo.style.width = 170 + "px";
        myVideo.style.position = "absolute";
        myVideo.style.top = 0;
        myVideo.style.right = 0;
        myVideo.style.zIndex = 10;
      }
    }

    // if anybody is pinned dont perform the next tasks
    if (this.state.focusOn !== null) {
      return;
    }

    // if screen share is on but its not mine then show their video in the whole main div
    if (!this.state.screenShare && this.state.screenShareOther) {
      for (let i = 0; i < videos.length; i++) {
        videos[i].style.display = "none";
      }
      var ssid = this.state.screenShareBy;
      let video = document.querySelector(`[data-socket="${ssid}"]`);
      if (video) {
        videoTag = video.getElementsByTagName("video")[0];
        video.style.display = "block";
        videoTag.height = height;
        videoTag.width = width;
        video.style.height = height + "px";
        video.style.width = width + "px";
      } else {
        console.log("Video not found !");
      }
      return;
    }

    // if there are more than 1 person in the group then change the ui accordingly
    if (videos.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        videos[i].style.display = "block";
      }
    }

    if (videos.length <= 2) {
      max_height = height - 5;
      max_width = width / videos.length - 5;
    } else if (videos.length <= 4) {
      max_height = height / 2 - 5;
      max_width = width / 2 - 5;
    } else if (videos.length <= 6) {
      max_height = height / 2 - 5;
      max_width = width / 3 - 5;
    } else if (videos.length <= 9) {
      max_height = height / 3 - 5;
      max_width = width / 3 - 5;
    } else {
      max_height = height / 3 - 5;
      max_width = width / 3 - 5;
      // show only the first 9 videos except mine
      for (let i = 9; i < videos.length; i++) {
        videos[i].style.display = "none";
      }
    }
    videos.forEach((video) => {
      var videoTag = video.getElementsByTagName("video")[0];
      videoTag.height = max_height;
      videoTag.width = max_width;
      video.style.height = max_height + "px";
      video.style.width = max_width + "px";
    });
  };

  // function to get the permissions to use the camera and mic
  getUserPermissions = async () => {
    try {
      // get camera permissions and upadte videoAvailable accordingly
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => (this.videoAvailable = true))
        .catch(() => (this.videoAvailable = false));

      // get mic permissions and upadte videoAvailable accordingly
      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => (this.audioAvailable = true))
        .catch(() => (this.audioAvailable = false));

      // get the audio and video tracks and send it to myVideoRef and myStream
      if (this.videoAvailable || this.audioAvailable) {
        navigator.mediaDevices
          .getUserMedia({
            audio: this.audioAvailable,
            video: this.videoAvailable,
          })
          .then((stream) => {
            window.myStream = stream;
            this.audioTrack = stream.getAudioTracks()[0];
            this.videoTrack = stream.getVideoTracks()[0];
            this.myVideoRef.current.srcObject = stream;
          })
          .catch((error) => console.log("ERROR ", error));
        this.setState({
          videoOn: this.videoAvailable,
          micOn: this.audioAvailable,
        });
      } else {
        window.myStream = this.silence();
        this.myVideoRef.current.srcObject = window.myStream;
      }
      this.setState({
        loading: false,
      });
    } catch (error) {
      console.log("ERROR ", error);
    }
  };

  // function to send my stream to peer (RTCPeerConnection)
  sendStreamToPeer = (stream) => {
    const self = this;
    if (stream === undefined || stream === null) {
      stream = this.silence();
    }
    // for id in connections add the track in the RTCPeerConnection for each peer
    for (let id in self.connections) {
      if (id === self.socketID) continue;
      self.connections[id].getSenders().forEach((sender) => {
        self.connections[id].removeTrack(sender);
      });
      stream.getTracks().forEach((track) => {
        self.connections[id].addTrack(track, stream);
      });
      // update the description for each connection
      self.connections[id].createOffer().then((desc) => {
        self.connections[id]
          .setLocalDescription(desc)
          .then(() => {
            self.socket.emit(
              "set-description",
              id,
              self.connections[id].localDescription
            );
          })
          .catch((error) => console.log("ERROR ", error));
      });
    }
  };

  // function to get the media stream
  getCallMedia = async () => {
    const self = this;
    // if mic on get audio and update the audioTrack
    if (self.state.micOn) {
      let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (self.audioTrack !== null) {
        try {
          let track = window.myStream.getTrackById(self.audioTrack.id);
          track.stop();
          window.myStream.removeTrack(track);
        } catch (error) {
          console.log(error);
        }
      }
      let tracks = stream.getTracks();
      let newtrack = tracks[0];
      window.myStream.addTrack(newtrack);
      self.audioTrack = newtrack;
    } else {
      // else dont add any audio track
      if (self.audioTrack !== null) {
        try {
          let track = window.myStream.getTrackById(self.audioTrack.id);
          track.stop();
          window.myStream.removeTrack(track);
        } catch (error) {
          console.log(error);
        }
      }
      self.audioTrack = null;
    }

    // if video on or screen share on then update the videoTrack
    if (self.state.videoOn && !self.state.screenShare) {
      let stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (self.videoTrack !== null) {
        try {
          let track = window.myStream.getTrackById(self.videoTrack.id);
          track.stop();
          window.myStream.removeTrack(track);
        } catch (error) {
          console.log(error);
        }
      }
      let tracks = stream.getTracks();
      let newtrack = tracks[0];
      window.myStream.addTrack(newtrack);
      self.videoTrack = newtrack;
    } else {
      // else delete the video track
      if (self.videoTrack !== null) {
        try {
          let track = window.myStream.getTrackById(self.videoTrack.id);
          track.stop();
          window.myStream.removeTrack(track);
        } catch (error) {
          console.log(error);
        }
      }
      self.videoTrack = null;
    }

    // if neither audio nor video is on then add silence media stream to the track
    if (!self.state.videoOn && !self.state.micOn) {
      var stream = self.silence();
      window.myStream.addTrack(stream.getTracks()[0]);
    }

    self.myVideoRef.current.srcObject = window.myStream;

    // if call is accepted then send the stream to peer and get the css style
    if (self.state.isAccepted) {
      self.sendStreamToPeer(window.myStream);
      self.getCssStyleForVideos();
    }
  };

  // the event handler for change description socket event
  changeDescriptionEventHandler = (from, description) => {
    const self = this;
    if (from !== self.socketID) {
      // if from is not me then set remote description to the RTCPeerConnection object of connection between me and from
      self.connections[from]
        .setRemoteDescription(new RTCSessionDescription(description))
        .then(() => {
          if (description.type === "offer") {
            self.connections[from]
              .createAnswer()
              .then((desc) => {
                self.connections[from]
                  .setLocalDescription(desc)
                  .then(() => {
                    self.socket.emit(
                      "set-description",
                      from,
                      self.connections[from].localDescription
                    );
                  })
                  .catch((error) => {});
              })
              .catch((error) => {});
          }
        })
        .catch((error) => {});
    }
  };

  // handle user joined socket event
  userJoinedEventHandler = (id, usernames, clients) => {
    const self = this;
    // if i am sharing screen then emit teh screen share event
    if (self.state.screenShare) {
      self.socket.emit("screen-share", self.url);
    }
    // add the event listerners to every RTCPeerConnection object
    clients.forEach((socketid) => {
      self.connections[socketid] = new RTCPeerConnection(peerConfig);
      // add ice candidate event listener
      self.connections[socketid].onicecandidate = function (event) {
        if (event.candidate) {
          self.socket.emit("add-ice", socketid, event.candidate);
        }
      };
      // update the participants array to contain all the users
      var participants = [];
      usernames.forEach((username, index) => {
        if (clients[index] === self.socketID) {
          return;
        }
        participants.push({ username, socketid: clients[index] });
      });
      participants.sort((p1, p2) =>
        p1.username > p2.username ? 1 : p1.username < p2.username ? -1 : 0
      );
      self.setState({
        members: participants,
      });

      // add on track event listener
      self.connections[socketid].ontrack = (event) => {
        // set the stream to the video elemnet of the user (identified by socketid)
        var searchVideo = document.querySelector(`[data-socket="${socketid}"]`);
        var vid = searchVideo.getElementsByTagName("video")[0];
        vid.srcObject = event.streams[0];
        var noVidDiv = searchVideo.children[searchVideo.children.length - 1];
        if (event.streams[0].getVideoTracks().length <= 0) {
          noVidDiv.setAttribute("class", "no-video-container");
        } else {
          noVidDiv.setAttribute("class", "dont-show");
        }
        self.getCssStyleForVideos();
      };
      // send my stream to the person being added if i am not the one added
      if (window.myStream !== undefined && window.myStream !== null) {
        window.myStream.getTracks().forEach((track) => {
          self.connections[socketid].addTrack(track, window.myStream);
        });
      } else {
        window.myStream = self.silence();
        window.myStream.getTracks().forEach((track) => {
          self.connections[socketid].addTrack(track, window.myStream);
        });
      }
      self.getCssStyleForVideos();
    });
  };

  // function to handle teh screen share socket event
  screenShareEventHandler = (fromid) => {
    const self = this;
    // if i am sharign screen then set state accordingly
    if (fromid === self.socketID) {
      this.setState(
        () => {
          return {
            screenShareBy: `${fromid}`,
          };
        },
        () => {
          self.getCssStyleForVideos();
        }
      );
      return;
    }
    // if i am not teh one sharing screen then set state accordingly
    this.setState(
      () => {
        return {
          screenShareOther: true,
          screenShareBy: `${fromid}`,
        };
      },
      () => {
        self.getCssStyleForVideos();
      }
    );
  };

  // function to handle the end screen share socket event
  endScreenShareEventHandler = () => {
    const self = this;
    // make all the appropriate changes in the state
    this.setState(
      () => {
        return {
          screenShare: false,
          screenShareOther: false,
          screenShareBy: "",
        };
      },
      () => {
        self.getCssStyleForVideos();
      }
    );
  };

  // handle the pin event
  focusVideoOf = (socketid) => {
    // set the focusOn in state to the socketid of the participant pinned
    this.setState(
      {
        focusOn: socketid,
      },
      () => {
        this.getCssStyleForVideos();
      }
    );
  };

  // handle cancel focus on event
  cancelFocusOn = () => {
    // set the focusOn in state as null
    this.setState(
      {
        focusOn: null,
      },
      () => {
        this.getCssStyleForVideos();
      }
    );
  };

  // teh connect to socket function
  connectToSocket = () => {
    // get a new socket connection with the server url
    const socket = io(server_url);
    const self = this;
    this.socket = socket;
    // on connect emit the join call event and get the media
    socket.on("connect", () => {
      self.socketID = socket.id;
      self.getCallMedia();
      socket.emit("join-call", window.location.href, self.username);
    });

    // on set description event call the set description event handler
    socket.on("set-description", this.changeDescriptionEventHandler);

    // on user left event delete the video of the participant
    // delete them from member
    // if they were sharing their screens then make appropriate chanegs in the state
    socket.on("user-left", (socketid) => {
      if (
        this.state.screenShareOther &&
        this.state.screenShareBy === socketid
      ) {
        this.setState({
          screenShareOther: false,
          screenShareBy: "",
        });
      }
      var participants = this.state.members;
      var newParticipants = participants.filter((p) => p.socketid !== socketid);
      this.setState({
        members: newParticipants,
      });
      if (socketid !== self.socketID) self.sendStreamToPeer();
      self.getCssStyleForVideos();
    });

    // on add ice candidate event add a new ice connection to the TRCPeerConnection
    socket.on("add-ice", (from, cand) => {
      self.connections[from]
        .addIceCandidate(new RTCIceCandidate(cand))
        .catch((error) => console.log("ERROR ", error));
    });

    // on user joined event call the user joined event handler
    socket.on("user-joined", this.userJoinedEventHandler);

    // on screen share event call the screen share event handler
    socket.on("screen-share", this.screenShareEventHandler);

    // on end screen hsare event call teh end screen shar eevent handler
    socket.on("end-screen-share", this.endScreenShareEventHandler);
  };

  // handle the info modal open
  handleInfoModalOpen = () => this.setState({ infoModalOpen: true });

  // handle the info modal close
  handleInfoModalClose = () => this.setState({ infoModalOpen: false });

  // handle the join call event
  // call the get media and connect to socket
  handleJoinCall = () => {
    this.setState({ isAccepted: true });
    this.getCallMedia();
    this.connectToSocket();
  };

  // handle toggleing of the mic
  toggleMicState = () => {
    this.setState({
      loading: true,
    });

    this.setState(
      (prevState) => {
        return {
          micOn: !prevState.micOn && this.audioAvailable,
        };
      },
      () => {
        this.getCallMedia();
      }
    );
    this.setState({
      loading: false,
    });
  };

  // handle toggeling of the camera
  toggleCameraState = () => {
    this.setState({
      loading: true,
    });

    this.setState(
      (prevState) => {
        return {
          videoOn: !prevState.videoOn && this.videoAvailable,
        };
      },
      () => {
        this.getCallMedia();
      }
    );
    this.setState({
      loading: false,
    });
  };

  // if no stream is present then create a silence stream and send it to users
  silence = () => {
    let audctx = new AudioContext();
    let osc = audctx.createOscillator();
    let dstn = osc.connect(audctx.createMediaStreamDestination());
    osc.start();
    audctx.resume();
    return new MediaStream([
      Object.assign(dstn.stream.getAudioTracks()[0], { enabled: false }),
    ]);
  };

  // handle the copy joining info button click
  // copy the url to the clipboard
  copyJoiningInfo = () => {
    navigator.clipboard.writeText(this.url);
    this.setState({
      infoModalOpen: false,
    });
  };

  // handle the end call event (cleick on teh end call button)
  endCall = () => {
    window.myStream.getTracks().forEach((track) => track.stop());
    window.location.href = "/";
  };

  // function to redirect to home (if room doesnt exist)
  redirectToHome = () => {
    this.setState({
      redirectHome: true,
    });
  };

  // function to handle the screen share button click
  handleScreenShare = () => {
    // if other person is presenting show the modal saying you cant present
    if (this.state.screenShareOther) {
      this.setState({
        showSSModal: true,
      });
      return;
    }
    // toggle the screen share of the user if any other user is not presenting
    this.setState(
      (prevState) => {
        return { screenShare: !prevState.screenShare };
      },
      () => {
        // get teh screen of the user and show it on the video of the user
        if (this.state.screenShare) {
          if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices
              .getDisplayMedia({ video: true, audio: true })
              .then((stream) => {
                var newStream = new MediaStream();
                try {
                  // end my video stream and place this video stream instead
                  window.myStream
                    .getVideoTracks()
                    .forEach((track) => track.stop());
                  this.videoTrack = null;
                } catch (err) {
                  console.log(err);
                }
                stream.getTracks().forEach((track) => {
                  newStream.addTrack(track);
                });
                // add my previous audio streams
                window.myStream.getAudioTracks().forEach((track) => {
                  newStream.addTrack(track);
                });
                window.myStream = newStream;
                this.myVideoRef.current.srcObject = window.myStream;
                this.sendStreamToPeer(window.myStream);
                // emit the screen share event through socket
                this.socket.emit("screen-share", this.url);
                stream.getTracks().forEach((track) => {
                  track.onended = () => {
                    // if the screen share tracks are ended then end teh screen share and get my media
                    this.setState(
                      {
                        screenShare: false,
                      },
                      () => {
                        try {
                          window.myStream.removeTrack(track);
                        } catch (error) {
                          console.log(error);
                        }
                        window.myStream = new MediaStream();
                        this.audioTrack = null;
                        this.videoTrack = null;
                        this.getCallMedia();
                        this.getCssStyleForVideos();
                        this.socket.emit("end-screen-share", this.url);
                      }
                    );
                  };
                });
              })
              .then(() => {})
              .catch((e) => {
                this.setState({
                  screenShare: false,
                });
              });
          }
        } else {
          // if i am ending teh screen share then get my medai and end previous tracks
          window.myStream.getTracks().forEach((track) => {
            track.stop();
          });
          window.myStream = new MediaStream();
          this.audioTrack = null;
          this.videoTrack = null;
          this.getCallMedia();
          this.getCssStyleForVideos();
          this.socket.emit("end-screen-share", this.url);
        }
      }
    );
  };

  // close the modal of other user presenting
  handleSSModalClose = () => {
    this.setState({
      showSSModal: false,
    });
  };

  render() {
    // redirect to home
    if (this.state.redirectHome) {
      return <Redirect to={"/"} />;
    }
    // show room doesnt exist in case of room not existing
    if (!this.state.roomExist) {
      return (
        <div className='room-doesnt-exist'>
          <Typography variant='h3'> This room does not exist !</Typography>
          <div style={{ width: 30, height: 30 }}></div>
          <Button size='large' onClick={this.redirectToHome}>
            <Typography variant='h6'>Back to Home</Typography>
          </Button>
        </div>
      );
    }
    return (
      // in case of call accepted show the room else show the ask before entering component
      <div>
        {this.state.isAccepted ? (
          <Room
            socket={this.socket}
            socketID={this.socketID}
            myVideoRef={this.myVideoRef}
            videoOn={this.state.videoOn}
            handleInfoModalOpen={this.handleInfoModalOpen}
            infoModalOpen={this.state.infoModalOpen}
            handleInfoModalClose={this.handleInfoModalClose}
            url={this.url}
            copyJoiningInfo={this.copyJoiningInfo}
            toggleMicState={this.toggleMicState}
            endCall={this.endCall}
            toggleCameraState={this.toggleCameraState}
            micOn={this.state.micOn}
            loading={this.state.loading}
            username={this.username}
            getCssStyleForVideos={this.getCssStyleForVideos}
            handleScreenShare={this.handleScreenShare}
            screenShare={this.state.screenShare}
            showSSModal={this.state.showSSModal}
            handleSSModalClose={this.handleSSModalClose}
            participants={this.state.members}
            focusVideoOf={this.focusVideoOf}
            cancelFocusOn={this.cancelFocusOn}
            focusOn={this.state.focusOn}
          />
        ) : (
          <AskBeforeEntering
            toggleCameraState={this.toggleCameraState}
            toggleMicState={this.toggleMicState}
            myVideoRef={this.myVideoRef}
            handleJoinCall={this.handleJoinCall}
            micOn={this.state.micOn}
            videoOn={this.state.videoOn}
            loading={this.state.loading}
            username={this.username}
          />
        )}
      </div>
    );
  }
}

// get access required state in the props
function mapStateToProps(state) {
  return {
    auth: state.auth,
    guest: state.guest,
    room: state.room,
  };
}

export default connect(mapStateToProps)(RoomWrapper);
