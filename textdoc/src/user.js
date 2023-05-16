import { getAuth, createUserWithEmailAndPassword, 
	signInWithEmailAndPassword, signOut } from "firebase/auth";

const auth = getAuth();
//Pass the email and password into this function to create a new user
//who is then signed in
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });


  //Use email and password to sign in
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

  //Use to sign out.
  signOut(auth).then(() => {
	//Success
  }).catch((error) => {
	//Error
  });
