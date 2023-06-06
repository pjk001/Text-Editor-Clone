import React, { useState, useEffect, useRef } from 'react';
import {ref, set } from "firebase/database";
import { ToastContainer, toast } from 'react-toastify';

import { getDatabase } from "firebase/database";

import { DocumentSnapshot, addDoc, collection, getFirestore, onSnapshot } from 'firebase/firestore';

import { doc, setDoc, getDoc } from "firebase/firestore"; 
import {app, database} from "./firebaseConfig.js"
import { getAuth } from 'firebase/auth';


var uidemailmap = {};

var auth = getAuth();
var cuser = auth.currentUser
export async function AddUser(user){
	auth = getAuth();
	cuser = auth.currentUser
	const docRef = doc(database, "users", "Users");
	const docSnap = await getDoc(docRef);
	const map = docSnap.data().uidemail;
	map[user.uid] = user.email;
	setDoc(docRef, {
		uidemail: map
	});
	uidemailmap = map;
}


export function transemail(email){
	const map = uidemailmap;
	const uid = Object.keys(map).find(key => map[key] === email);
	return uid;
}

export function transuid(uid){
	console.log("translating");
	console.log(uid);
	const map = uidemailmap;
	return map[uid];
}

//"user" in the below functions refer to the email of a user
//You can only change users with the changeOwner function, to prevent incorrect documents from being formed
//The roles parameter is the roles field of the document.


export function makeWriter(roles, user){
	// const auth = getAuth();
	// const cuser = auth.currentUser
	if(roles[cuser.uid] !== "owner"){return 2;}
	if(roles[user] === "owner"){return 1;}
	roles[user] = "writer";
	return 0;
}

export function makeReader(roles, user){
	// const auth = getAuth();
	// const cuser = auth.currentUser
	if(roles[cuser.uid] !== "owner"){return 2;}
	if(roles[user] === "owner"){return 1;}
	roles[user] = "reader";
	return 0;
}

export function removeAccess(roles, user){
	console.log("Remove access")

	if(roles[cuser.uid] !== "owner" && cuser.uid !== user){
		console.log("Remove access")
		console.log(cuser.uid !== user)
		console.log(cuser.uid)
		console.log(user)
		return 2;
	}
	if(roles[user] === "owner"){return 1;}
	if(!(user in roles)){return 3;}
	delete roles[user];
	return 0;
}

export function changeOwner(roles, user){
	// const auth = getAuth();
	// const cuser = auth.currentUser
	if(roles[cuser.uid] !== "owner"){return 2;}
	const owner = Object.keys(roles).find(key => roles[key] === "owner");
	// delete roles[owner];
	roles[owner] = "writer";
	roles[user] = "owner";
	return 0;
}