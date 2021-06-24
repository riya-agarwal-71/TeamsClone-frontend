import React, { Component } from "react";
import { io } from "socket.io-client";
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
  }

  getCssStyleForVideos = () => {
    var { width, height } = document
      .getElementById("main")
      .getBoundingClientRect();
    var videos = [...document.getElementsByTagName("video")];
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
      myVideo.height = 110;
      myVideo.width = 170;
      if (!this.state.videoOn) {
        myVideo.style.display = "none";
      }
      myVideo.style.position = "absolute";
      myVideo.style.top = 0;
      myVideo.style.right = 0;
      myVideo.style.zIndex = 100;
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
      video.height = max_height;
      video.width = max_width;
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

  userJoinedEventHandler = (id, clients) => {
    const self = this;
    clients.forEach((socketid) => {
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
          var VideoElement = document.createElement("video");
          VideoElement.setAttribute("data-socket", socketid);
          VideoElement.autoplay = true;
          VideoElement.playsinline = true;
          VideoElement.srcObject = event.streams[0];
          if (event.streams[0].getVideoTracks().length <= 0) {
            VideoElement.setAttribute("class", "video-element-call no-video");
          } else {
            VideoElement.setAttribute("class", "video-element-call");
          }
          main.append(VideoElement);
        } else {
          searchVideo.srcObject = event.streams[0];
          if (event.streams[0].getVideoTracks().length <= 0) {
            searchVideo.setAttribute("class", "no-video video-element-call");
          } else {
            searchVideo.setAttribute("class", "video-element-call");
          }
        }
        self.getCssStyleForVideos();
      };
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
    });
    if (id === self.socketID) {
      self.sendStreamToPeer(window.stream);
      self.getCssStyleForVideos();
    }
  };

  connectToSocket = () => {
    const socket = io(server_url);
    console.log(server_url);
    const self = this;
    this.socket = socket;
    socket.on("connect", () => {
      self.socketID = socket.id;
      self.getMediaDevicesFromNavigator();
      socket.emit("join-call", window.location.href);
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

export default RoomWrapper;
