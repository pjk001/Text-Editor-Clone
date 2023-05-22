import React, {useState} from "react";
import "./login-signup.css"
import { auth, app } from "../firebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate('');

  const handleEmail = (event) => {
    setEmail(event.target.value);
  }

  const handlePassword = (event) => {
    setPassword(event.target.value);
  }

  const signUp = (event) => {
    event.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    navigate("/login");
    console.log(userCredential);
  })
  .catch((error) => {
    alert(error);
  });
}

  return (
    <>
      <div className="vertical-container">
      <section class="box-container">
      <div class="heading">
        <h1 class="text text-large">Create an Account</h1>
      </div>
      <form onSubmit={signUp}>
        <div class="input-container">
          <input type="email" placeholder="Enter your email" class="input-field" value={email} onChange={handleEmail}>
          </input>
        </div>

        <div class="input-container">
          <input type="password" placeholder="Enter your password" class="input-field" value={password} onChange={handlePassword}>
          </input>
        </div>

        <p class="text text-normal">Already a user? <span><a href="/login">Sign In</a></span>
        </p>

        <div>
          <button type="submit" name="submit" class="submit-button" value="Sign In">Submit</button>
        </div>
      </form>
      </section>

      </div>
    </>
  );
}
