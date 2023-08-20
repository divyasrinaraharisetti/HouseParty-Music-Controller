
import React, { Component } from "react";
import CreateRoomPage from "./CreateRoomPage";
import { Grid, Button, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";


export default class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        votes_to_skip: 2,
        guest_can_pause: false,
        is_host: false,
        show_settings: false,
        spotifyAuthenticated: false,
        song: {}

    };

    this.roomCode= this.props.match.params.roomCode;
    this.renderSettings=this.renderSettings.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.updateShowSettings=this.updateShowSettings.bind(this);
    this.leaveButtonPressed=this.leaveButtonPressed.bind(this);
    this.getRoomDetails=this.getRoomDetails.bind(this);
    this.getRoomDetails();
    this.authenticatedSpotify=this.authenticatedSpotify.bind(this);
  }
// we are passing this method as props to the create Room page, so we need to bind this method to this
  getRoomDetails() {
    fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (!response.ok){
          this.props.leaveRoomCallback();
          this.props.history.push("/");
        }
       return response.json();
     })
      .then((data) => {
        this.setState({
          votes_to_skip: data.votes_to_skip,
          guest_can_pause: data.guest_can_pause,
          is_host: data.is_host,
        });
        if (this.state.is_host){
          this.authenticatedSpotify();
        }
      });
  }
  authenticatedSpotify(){
    fetch('/spotify/is-authenticated').then((response)=>{
      response.json()
    }).then((data)=>{
      console.log(data.status);
      this.setState({
        spotifyAuthenticated : data.status
      });
      console.log(data.status);
      if (!data.status){
        fetch('/spotify/get-auth-url').then((response)=>{
          response.json()
        }).then((data)=>{
            window.location.replace(data.url);
        });
      }
    });
  }

  leaveButtonPressed(){
    const requestOptions = {
      method:"POST",
      headers:{'Content-Type': 'application/json',
    }};
    
      fetch('/api/leave-room',requestOptions)
      .then((_response)=>{
        this.props.leaveRoomCallback();
        this.props.history.push('/');
      });
  } 
  updateShowSettings(value){
      this.setState({
        show_settings : value,
      });
  }
  renderSettingsButton(){
    return(
      <Grid item xs={12} align="center">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={()=>{this.updateShowSettings(true)}}>
          Settings
        </Button>
      </Grid>
    );
  }

  renderSettings(){
      return(
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={this.state.votes_to_skip}
            guestCanPause={this.state.guest_can_pause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
          </Grid>
          <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick = {() => this.updateShowSettings(false)}>
            Close
          </Button>
          </Grid>
        </Grid>
      );
  }

  render() {
    if (this.state.show_settings){
      return this.renderSettings();
    }
    return (
      <Grid container spacing={1}>
        <Grid item align="center" xs={12}> 
        <Typography variant='h4' component="h4">
          Code: {this.roomCode}
        </Typography>
        </Grid>
        
        <Grid item align="center" xs={12}> 
        <Typography variant="h6" component="h6">
        Votes: {this.state.votes_to_skip}
        </Typography>
        </Grid>
        
        <Grid item align="center" xs={12}>
        <Typography variant="h6" component='h6'>
        Guest Can Pause : {this.state.guest_can_pause.toString()}
        </Typography>
        </Grid>
        {this.state.is_host ? this.renderSettingsButton(): null}
        <Grid item align="center" xs={12}>
        <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}


// this is let us the main page after every user uses the code and then joins the room and use the features of the music player. 