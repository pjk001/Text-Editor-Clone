import React, { useState, useEffect, useRef } from 'react';
import {ref, set } from "firebase/database";
import { ToastContainer, toast } from 'react-toastify';

import { getDatabase } from "firebase/database";

import { DocumentSnapshot, addDoc, collection, getFirestore, onSnapshot } from 'firebase/firestore';

import { doc, setDoc, getDoc } from "firebase/firestore"; 
import {app, database} from "./firebaseConfig.js"


var uidemailmap = {};


export async function AddUser(user){
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
	if(roles[user] === "owner"){return false;}
	roles[user] = "writer";
	return true;
}

export function makeReader(roles, user){
	if(roles[user] === "owner"){return false;}
	roles[user] = "reader";
	return true;
}

export function removeAccess(roles, user){
	if(roles[user] === "owner"){return false;}
	if(!(user in roles)){return false;}
	delete roles[user];
	return true;
}

export function changeOwner(roles, user){
	const owner = Object.keys(roles).find(key => roles[key] === "owner");
	delete roles[owner];
	roles[user] = "owner";
	return true;
}