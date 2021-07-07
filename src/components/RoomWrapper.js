import React, { Component } from "react";
import { io } from "socket.io-client";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import { server_url } from "../helper/urls";
import { AskBeforeEntering, Room } from ".";
import "../styles/room.scss";
import { checkExistingRoom } from "../actions/room";
import { Button } from "@material-ui/core";

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

    if (localStorage.token) {
      this.username = this.props.auth.user.name;
    } else {
      this.username = this.props.guest.username;
    }
    this.checkIfRoomExists();
  }

  checkIfRoomExists = () => {
    let url = window.location.href;
    let roomCode = url.split("/");
    roomCode = roomCode[roomCode.length - 1];
    const self = this;
    this.props.dispatch(checkExistingRoom(roomCode)).then(() => {
      if (!self.props.room.success) {
        self.setState({
          roomExist: false,
        });
      } else {
        self.getUserPermissions();
      }
    });
  };

  getCssStyleForVideos = () => {
    var { width, height } = document
      .getElementById("main")
      .getBoundingClientRect();
    var videos = [...document.getElementsByClassName("video")];
    var max_height;
    var max_width;
    var videoTag;

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
      } else {
        console.log("Video not found !");
      }
    }

    if (this.state.screenShare) {
      let ssScreen = document.getElementById("screen-share");
      ssScreen.style.display = "flex";
      ssScreen.style.zIndex = 10;
    } else {
      let ssScreen = document.getElementById("screen-share");
      ssScreen.style.display = "none";
      ssScreen.style.zIndex = -1;
    }

    if (this.state.focusOn !== this.socketID) {
      var myVideo;
      if (videos.length > 1) {
        myVideo = videos[0];
        videos.splice(0, 1);
        myVideo.style.display = "block";
        if (this.state.screenShare) {
          myVideo.style.display = "none";
        }
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
        myVideo.style.zIndex = 5;
      }
    }

    if (this.state.focusOn !== null) {
      return;
    }

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

  getUserPermissions = async () => {
    try {
      await navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => (this.videoAvailable = true))
        .catch(() => (this.videoAvailable = false));

      await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => (this.audioAvailable = true))
        .catch(() => (this.audioAvailable = false));

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

  sendStreamToPeer = (stream) => {
    const self = this;
    if (stream === undefined || stream === null) {
      stream = this.silence();
    }
    for (let id in self.connections) {
      if (id === self.socketID) continue;
      self.connections[id].getSenders().forEach((sender) => {
        self.connections[id].removeTrack(sender);
      });
      stream.getTracks().forEach((track) => {
        self.connections[id].addTrack(track, stream);
      });
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

  getCallMedia = async () => {
    const self = this;

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

    if (!self.state.videoOn && !self.state.micOn) {
      var stream = self.silence();
      window.myStream.addTrack(stream.getTracks()[0]);
    }

    self.myVideoRef.current.srcObject = window.myStream;

    if (self.state.isAccepted) {
      self.sendStreamToPeer(window.myStream);
      self.getCssStyleForVideos();
    }

    // if (self.state.videoOn || self.state.micOn) {
    //   navigator.mediaDevices
    //     .getUserMedia({ video: self.state.videoOn, audio: self.state.micOn })
    //     .then((stream) => {
    //       try {
    //         window.myStream.getTracks().forEach((track) => track.stop());
    //       } catch (error) {}
    //       window.myStream = stream;
    //       self.myVideoRef.current.srcObject = stream;
    //       self.sendStreamToPeer(window.myStream);
    //     })
    //     .then(() => {})
    //     .catch((error) => console.log("ERROR ", error));
    // } else {
    //   try {
    //     window.myStream.getTracks().forEach((track) => track.stop());
    //   } catch (error) {
    //     console.log("ERROR ", error);
    //   }
    //   window.myStream = self.silence();
    //   self.myVideoRef.current.srcObject = window.myStream;
    //   self.sendStreamToPeer(window.myStream);
    // }
  };

  changeDescriptionEventHandler = (from, description) => {
    const self = this;
    if (from !== self.socketID) {
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
                  .catch((error) => console.log("ERROR ", error));
              })
              .catch((error) => console.log("ERORR ", error));
          }
        })
        .catch((error) => console.log("ERROR ", error));
    }
  };

  userJoinedEventHandler = (id, usernames, clients) => {
    const self = this;
    if (self.state.screenShare) {
      self.socket.emit("screen-share", self.url);
    }
    clients.forEach((socketid, ind) => {
      self.connections[socketid] = new RTCPeerConnection(peerConfig);
      self.connections[socketid].onicecandidate = function (event) {
        if (event.candidate) {
          self.socket.emit("add-ice", socketid, event.candidate);
        }
      };
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

      self.connections[socketid].ontrack = (event) => {
        var searchVideo = document.querySelector(`[data-socket="${socketid}"]`);
        // if (searchVideo === null || searchVideo === undefined) {
        //   var main = document.getElementById("main");
        //   var videoContainer = document.createElement("div");
        //   videoContainer.setAttribute("data-socket", socketid);
        //   videoContainer.setAttribute("class", "video");
        //   var videoElement = document.createElement("video");
        //   videoElement.autoplay = true;
        //   videoElement.playsInline = true;
        //   videoElement.srcObject = event.streams[0];
        //   videoElement.setAttribute("class", "video-element-call");
        //   videoContainer.append(videoElement);
        //   var overlayUsername = document.createElement("div");
        //   overlayUsername.setAttribute("class", "username-video");
        //   var usernameHeading = document.createElement("h3");
        //   usernameHeading.innerHTML = username.toUpperCase();
        //   overlayUsername.append(usernameHeading);
        //   var unpinButton = document.createElement("div");
        //   unpinButton.innerHTML = "UNPIN";
        //   unpinButton.addEventListener("click", this.cancelFocusOn);
        //   overlayUsername.append(unpinButton);
        //   videoContainer.append(overlayUsername);
        //   var noVideoDiv = document.createElement("div");
        //   var logoDiv = document.createElement("div");
        //   logoDiv.setAttribute("class", "logo");
        //   var usernameLetter = document.createElement("h1");
        //   usernameLetter.innerHTML = username.toUpperCase().substr(0, 1);
        //   logoDiv.append(usernameLetter);
        //   noVideoDiv.append(logoDiv);
        //   videoContainer.append(noVideoDiv);
        //   if (event.streams[0].getVideoTracks().length <= 0) {
        //     noVideoDiv.setAttribute("class", "no-video-container");
        //   } else {
        //     noVideoDiv.setAttribute("class", "dont-show");
        //   }
        //   main.append(videoContainer);
        // } else {
        var vid = searchVideo.getElementsByTagName("video")[0];
        vid.srcObject = event.streams[0];
        var noVidDiv = searchVideo.children[searchVideo.children.length - 1];
        if (event.streams[0].getVideoTracks().length <= 0) {
          noVidDiv.setAttribute("class", "no-video-container");
        } else {
          noVidDiv.setAttribute("class", "dont-show");
        }
        // }
        self.getCssStyleForVideos();
      };
      if (id === self.socketID) return;
      if (window.myStream !== undefined && window.myStream !== null) {
        // console.log("SENT", window.myStream.getTracks(), " to ", socketid);
        window.myStream.getTracks().forEach((track) => {
          self.connections[socketid].addTrack(track, window.myStream);
        });
      } else {
        // console.log("SENT EMPTY", window.myStream.id, " to ", socketid);
        window.myStream = self.silence();
        window.myStream.getTracks().forEach((track) => {
          self.connections[socketid].addTrack(track, window.myStream);
        });
      }
    });
    if (id === self.socketID) self.sendStreamToPeer(window.myStream);
  };

  screenShareEventHandler = (fromid) => {
    const self = this;
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

  endScreenShareEventHandler = () => {
    const self = this;
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

  focusVideoOf = (socketid) => {
    this.setState(
      {
        focusOn: socketid,
      },
      () => {
        this.getCssStyleForVideos();
      }
    );
  };

  cancelFocusOn = () => {
    this.setState(
      {
        focusOn: null,
      },
      () => {
        this.getCssStyleForVideos();
      }
    );
  };

  connectToSocket = () => {
    const socket = io(server_url);
    const self = this;
    this.socket = socket;
    socket.on("connect", () => {
      self.socketID = socket.id;
      self.getCallMedia();
      // self.getMediaDevicesFromNavigator();
      socket.emit("join-call", window.location.href, self.username);
    });

    socket.on("set-description", this.changeDescriptionEventHandler);

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
      var videoElement = document.querySelector(`[data-socket="${socketid}"]`);
      if (videoElement) {
        videoElement.parentNode.removeChild(videoElement);
      }
      self.getCssStyleForVideos();
    });

    socket.on("add-ice", (from, cand) => {
      self.connections[from]
        .addIceCandidate(new RTCIceCandidate(cand))
        .catch((error) => console.log("ERROR ", error));
    });

    socket.on("user-joined", this.userJoinedEventHandler);

    socket.on("screen-share", this.screenShareEventHandler);

    socket.on("end-screen-share", this.endScreenShareEventHandler);
  };

  // getMediaDevicesFromNavigator = () => {
  //   const self = this;
  //   try {
  //     window.myStream.getTracks().forEach((track) => track.stop());
  //   } catch (e) {}
  //   if (self.state.videoOn || self.state.micOn) {
  //     navigator.mediaDevices
  //       .getUserMedia({
  //         audio: self.state.micOn,
  //         video: self.state.videoOn,
  //       })
  //       .then((stream) => {
  //         window.myStream = stream;
  //         self.myVideoRef.current.srcObject = stream;
  //       })
  //       .catch((error) => console.log("ERROR", error));
  //   } else {
  //     window.myStream = self.silence();
  //     self.myVideoRef.current.srcObject = window.myStream;
  //   }
  // };

  handleInfoModalOpen = () => this.setState({ infoModalOpen: true });

  handleInfoModalClose = () => this.setState({ infoModalOpen: false });

  handleJoinCall = () => {
    this.setState({ isAccepted: true });
    this.getCallMedia();
    this.connectToSocket();
  };

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
        // if (this.state.isAccepted) {
        //   this.getCallMedia();
        //   this.getCssStyleForVideos();
        // } else {
        //   this.getMediaDevicesFromNavigator();
        // }
      }
    );
    this.setState({
      loading: false,
    });
  };

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
        // if (this.state.isAccepted) {
        //   this.getCallMedia();
        //   this.getCssStyleForVideos();
        // } else {
        //   this.getMediaDevicesFromNavigator();
        // }
      }
    );
    this.setState({
      loading: false,
    });
  };

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

  copyJoiningInfo = () => {
    navigator.clipboard.writeText(this.url);
    this.setState({
      infoModalOpen: false,
    });
  };

  endCall = () => {
    window.myStream.getTracks().forEach((track) => track.stop());
    window.location.href = "/";
  };

  redirectToHome = () => {
    this.setState({
      redirectHome: true,
    });
  };

  handleScreenShare = () => {
    if (this.state.screenShareOther) {
      this.setState({
        showSSModal: true,
      });
      // console.log(
      //   "Other person sharing screen ask them to stop presenting to present "
      // );
      return;
    }
    this.setState(
      (prevState) => {
        return { screenShare: !prevState.screenShare };
      },
      () => {
        if (this.state.screenShare) {
          if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices
              .getDisplayMedia({ video: true, audio: true })
              .then((stream) => {
                var newStream = new MediaStream();
                try {
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
                window.myStream.getAudioTracks().forEach((track) => {
                  newStream.addTrack(track);
                });
                window.myStream = newStream;
                this.myVideoRef.current.srcObject = window.myStream;
                this.sendStreamToPeer(window.myStream);
                this.socket.emit("screen-share", this.url);
                stream.getTracks().forEach((track) => {
                  track.onended = () => {
                    this.setState(
                      {
                        screenShare: false,
                      },
                      () => {
                        try {
                          window.myStream.removeTrack(track);
                          // this.myVideoRef.current.srcObject = window.myStream;
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
                console.log(e);
                this.setState({
                  screenShare: false,
                });
              });
          }
        } else {
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

  handleSSModalClose = () => {
    this.setState({
      showSSModal: false,
    });
  };

  render() {
    if (this.state.redirectHome) {
      return <Redirect to={"/"} />;
    }
    if (!this.state.roomExist) {
      return (
        <div>
          This room does not exist !
          <Button onClick={this.redirectToHome}> Home </Button>
        </div>
      );
    }
    return (
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
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    guest: state.guest,
    room: state.room,
  };
}

export default connect(mapStateToProps)(RoomWrapper);
