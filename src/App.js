import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

function App() {
  const [newUser, setnewUser] = useState(false);

  const [user, setUser] = useState({
    isSignedIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    success: false
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {

    firebase.auth().signInWithPopup(provider)
    .then(res => {
      console.log(res);
      const {displayName, email, photoURL} = res.user;

      const isSignedIn = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }

      setUser(isSignedIn);

    })
    .catch(error => console.log(error))
  }

  const handleSignOut = () => {

    firebase.auth().signOut()
    .then(response => {
      const signOut = {
        isSignedIn: false,
        name: "",
        email: "",
        photo: "",
        error: ""
      }
      setUser(signOut)
    })

  }

  const handleSubmit = (e) => {

    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(response => {

        const newUserInfo = {...user};
        newUserInfo.error = "";
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserInfo(user.name);

      })
      .catch(error => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      })
    }

    if(!newUser && user.email && user.password){

      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(response => {

        const newUserInfo = {...user};
        newUserInfo.error = "";
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log(response);
      })
      .catch(error => {
        
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      })


    }

    e.preventDefault();
  }

  const handleChange = (event) => {
    
    let isFormValid = true;
    if(event.target.name === "email"){

      isFormValid =  /\S+@\S+\.\S+/.test(event.target.value);
      
    }

    if(event.target.name === "password"){

      const isPasswordValid =  event.target.value.length > 6;
      const isPasswordNum =  /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && isPasswordNum;

    }
    if(isFormValid){

      const newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }

  }

  const updateUserInfo = name => {

    const user = firebase.auth().currentUser;

    user.updateProfile({

      displayName: name

    }).then( () => {

      console.log("User name updated successfully");
      
    }).catch(error => {

      console.log(error);

    });

  }

  const handleFbLogIn = () => {

    firebase.auth().signInWithPopup(fbProvider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });

  }

  return (
    <div>
        {
          user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign In</button>
        }
        <br/>
        <button onClick={handleFbLogIn}>Log in using Facebook</button>
        {
          user.isSignedIn && <div>

          <h2>Welcome {user.name}</h2>
          <h4>email: {user.email}</h4>
          <img src={user.photo} alt=""/>
          </div>
          
        }

        <h2>Our Own Othentication</h2>
        <input type="checkbox" onChange={() => setnewUser(!newUser)} name="newUser" id="newUser"/>
        <label htmlFor="newUser">New user Sign Up</label>

        <form onSubmit={handleSubmit}>
          {newUser && <input type="text" onBlur={handleChange} name="name" id="" placeholder="Your name"/>}
          <br/>
          <input type="text" name="email" onBlur={handleChange} id="" placeholder="Your email" required/>
          <br/>
          <input type="password" name="password" onBlur={handleChange} id="" placeholder="Password" required/>
          <br/>
          <input type="submit" value={newUser ? "Sign Up" : "Sign In"}/>
        </form>
        <p style={{color: "red"}}>{user.error}</p>
        {
          user.success && <p style={{color: "green"}}>User {newUser ? "created" : "Logged in"} successfully</p>
        }
    </div>
  );
}

export default App;
