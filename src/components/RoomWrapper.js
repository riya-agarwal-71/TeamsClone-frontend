import React, { Component } from "react";
import { io } from "socket.io-client";
import { connect } from "react-redux";
// import { Redirect } from "react-router";

import { server_url } from "../helper/urls";
import { AskBeforeEntering, Room } from ".";
import "../styles/room.scss";

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

    this.state = {
      infoModalOpen: false,
      isAccepted: false,
      videoOn: false,
      micOn: false,
      loading: true,
    };

    this.url = window.location.href;
    this.roomID = props.history.location.pathname.split("/");
    this.roomID = this.roomID[this.roomID.length - 1];

    this.getUserPermissions();
    if (localStorage.token) {
      this.username = this.props.auth.user.name;
    } else {
      this.username = this.props.guest.username;
    }
  }

  getCssStyleForVideos = () => {
    var { width, height } = document
      .getElementById("main")
      .getBoundingClientRect();
    var videos = [...document.getElementsByClassName("video")];
    var max_height;
    var max_width;
    if (videos.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        videos[i].style.display = "block";
      }
    }
    var myVideo;
    if (videos.length > 1) {
      myVideo = videos[0];
      videos.splice(0, 1);
      var videoTag = myVideo.getElementsByTagName("video")[0];
      console.log(videoTag);
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
      console.log(videoTag);
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

  getCallMedia = () => {
    const self = this;
    if (self.state.videoOn || self.state.micOn) {
      navigator.mediaDevices
        .getUserMedia({ video: self.state.videoOn, audio: self.state.micOn })
        .then((stream) => {
          try {
            window.myStream.getTracks().forEach((track) => track.stop());
          } catch (error) {}
          window.myStream = stream;
          self.myVideoRef.current.srcObject = stream;
          self.sendStreamToPeer(window.myStream);
        })
        .then(() => {})
        .catch((error) => console.log("ERROR ", error));
    } else {
      try {
        window.myStream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.log("ERROR ", error);
      }
      window.myStream = self.silence();
      self.myVideoRef.current.srcObject = window.myStream;
      self.sendStreamToPeer(window.myStream);
    }
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
    clients.forEach((socketid, ind) => {
      var username = usernames[ind];
      self.connections[socketid] = new RTCPeerConnection(peerConfig);
      self.connections[socketid].onicecandidate = function (event) {
        if (event.candidate) {
          self.socket.emit("add-ice", socketid, event.candidate);
        }
      };
      self.connections[socketid].ontrack = (event) => {
        var searchVideo = document.querySelector(`[data-socket="${socketid}"]`);
        if (searchVideo === null || searchVideo === undefined) {
          var main = document.getElementById("main");
          var videoContainer = document.createElement("div");
          videoContainer.setAttribute("data-socket", socketid);
          videoContainer.setAttribute("class", "video");
          var videoElement = document.createElement("video");
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          videoElement.srcObject = event.streams[0];
          videoElement.setAttribute("class", "video-element-call");
          videoContainer.append(videoElement);
          var overlayUsername = document.createElement("div");
          overlayUsername.setAttribute("class", "username-video");
          var usernameHeading = document.createElement("h3");
          usernameHeading.innerHTML = username.toUpperCase();
          overlayUsername.append(usernameHeading);
          videoContainer.append(overlayUsername);
          var noVideoDiv = document.createElement("div");
          var logoDiv = document.createElement("div");
          logoDiv.setAttribute("class", "logo");
          var usernameLetter = document.createElement("h1");
          usernameLetter.innerHTML = username.toUpperCase().substr(0, 1);
          logoDiv.append(usernameLetter);
          noVideoDiv.append(logoDiv);
          videoContainer.append(noVideoDiv);
          if (event.streams[0].getVideoTracks().length <= 0) {
            noVideoDiv.setAttribute("class", "no-video-container");
          } else {
            noVideoDiv.setAttribute("class", "dont-show");
          }
          main.append(videoContainer);
        } else {
          var vid = searchVideo.getElementsByTagName("video")[0];
          vid.srcObject = event.streams[0];
          var noVidDiv = searchVideo.children[searchVideo.children.length - 1];
          if (event.streams[0].getVideoTracks().length <= 0) {
            noVidDiv.setAttribute("class", "no-video-container");
          } else {
            noVidDiv.setAttribute("class", "dont-show");
          }
        }
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

  connectToSocket = () => {
    const socket = io(server_url);
    const self = this;
    this.socket = socket;
    socket.on("connect", () => {
      self.socketID = socket.id;
      self.getMediaDevicesFromNavigator();
      socket.emit("join-call", window.location.href, self.username);
    });

    socket.on("set-description", this.changeDescriptionEventHandler);

    socket.on("user-left", (socketid) => {
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
  };

  getMediaDevicesFromNavigator = () => {
    const self = this;
    try {
      window.myStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}
    if (self.state.videoOn || self.state.micOn) {
      navigator.mediaDevices
        .getUserMedia({
          audio: self.state.micOn,
          video: self.state.videoOn,
        })
        .then((stream) => {
          window.myStream = stream;
          self.myVideoRef.current.srcObject = stream;
        })
        .catch((error) => console.log("ERROR", error));
    } else {
      window.myStream = self.silence();
      self.myVideoRef.current.srcObject = window.myStream;
    }
  };

  handleInfoModalOpen = () => this.setState({ infoModalOpen: true });

  handleInfoModalClose = () => this.setState({ infoModalOpen: false });

  handleJoinCall = () => {
    this.setState({ isAccepted: true });
    this.getCallMedia();
    this.connectToSocket();
    this.getCssStyleForVideos();
  };

  toggleMicState = async () => {
    this.setState({
      loading: true,
    });
    if (this.state.micOn) {
      await this.setState({
        micOn: false,
      });
    } else {
      if (this.audioAvailable) {
        await this.setState({
          micOn: true,
        });
      } else {
        return;
      }
    }
    if (this.state.isAccepted) {
      this.getCallMedia();
    } else {
      this.getMediaDevicesFromNavigator();
    }
    this.setState({
      loading: false,
    });
  };

  toggleCameraState = async () => {
    this.setState({
      loading: true,
    });
    if (this.state.videoOn) {
      await this.setState({
        videoOn: false,
      });
    } else {
      if (this.videoAvailable) {
        await this.setState({
          videoOn: true,
        });
      } else {
        return;
      }
    }
    if (this.state.isAccepted) {
      this.getCallMedia();
      this.getCssStyleForVideos();
    } else {
      this.getMediaDevicesFromNavigator();
    }
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

  render() {
    return (
      <div>
        {this.state.isAccepted ? (
          <Room
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
  };
}

export default connect(mapStateToProps)(RoomWrapper);
