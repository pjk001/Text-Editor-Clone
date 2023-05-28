import React, {useState} from "react";
import "./login-signup.css"
import { auth, app } from "../firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate('');

  const handleEmail = (event) => {
    setEmail(event.target.value);
  }

  const handlePassword = (event) => {
    setPassword(event.target.value);
  }

  const signIn = (event) => {
    event.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      navigate("/home");
    console.log(userCredential);
  })
  .catch((error) => {
    alert(error);
  });
}

  return (
    <>

      <div className="vertical-container">
      <h1 class="welcome-title">Welcome to Text Editor</h1>
      <section class="box-container">
      <div>
        <h2>Sign In</h2>
      </div>
      <form onSubmit={signIn}>
        <div class="input-container">
          <input type="email" placeholder="Enter your email" class="input-field" value={email} onChange={handleEmail}>
          </input>
        </div>

        <div class="input-container">
          <input type="password" placeholder="Enter your password" class="input-field" value={password} onChange={handlePassword}>
          </input>
        </div>

        <p class="question">Don't have an account? <span><Link to="/signup"> Create one</Link></span></p>

        <div>
          <button type="submit" name="submit" class="submit-button" value="Sign In">Sign In</button>
        </div>
      </form>
      </section>

      </div>
    </>
  );
}

