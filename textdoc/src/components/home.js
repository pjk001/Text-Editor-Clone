import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { ToastContainer, toast } from 'react-toastify';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { create } from '@mui/material/styles/createTransitions';
// import {user} from '../user.js'

import { auth, app } from "../firebaseConfig"
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";

export default function Home({database}) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
    if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log("here is the 1st user uid: ", uid)
    // ...
    } else {
    // User is signed out
    // ...
    }
    });
    //Sets user to be the currently signed in user.
    //If nobody is signed in, it's set to.
    const user = auth.currentUser;
    const userID = user.uid;
    console.log("here is the user's userID: ", userID);

    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = useState('')
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const collectionRef = collection(database, userID);
    const [docsData, setDocsData] = useState([]);
    let navigate = useNavigate();
    var roles = {};
    roles[user.uid] = "owner";

    const createDoc = () => {
//The roles field contains the data on who can access and edit it.
//Owners have full control over the document (including permissions), 
//writers can read and edit, readers have read-only access.
        if(user){
            addDoc(collectionRef, {
                title: title,
                roles: roles,
            })
            .then(() => {
                toast.success('Document Created');
                handleClose()
            })
            .catch(() => {
                toast.error('Cannot Create Document');
            })
        }
    }

    const getDoc = () => {
        onSnapshot(collectionRef, (data) => {
            setDocsData(data.docs.map((doc) => {
                return {...doc.data(), id: doc.id}
            }))
        })
    }

    const isMounted = useRef()

    useEffect(() => {
        if (isMounted.current) {
            return
        }

        isMounted.current = true;
        getDoc()
    }, [])

    const getID = (id) => {
        navigate(`/documents/${id}`)
    }

    //philip
    const handleSignOut = () => {
        signOut(auth).then(() => {
            navigate("/login");
            console.log('User signed out');
          }).catch((error) => {
            console.log(error);
        });
    }

    // Notifications from other pages
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const notification = searchParams.get('notification');

    useEffect(() => {
        if (notification) {
            toast.success(notification);
        }
    }, [notification]);

    return (
        <div className='docs-main'>
            <ToastContainer />
            <h1>Text Editor</h1>

            <button className='sign-out' onClick={handleSignOut}>
                Sign Out
            </button>

            <button
                className='create-doc'
                onClick={handleOpen}
            >
                Create Document
            </button>

            
            <div className='doc-grid'>
                {docsData.map((doc) => {
                    return (
                        <div
                            key={doc.id} 
                            className='doc-grid-child' 
                            onClick={() => getID(doc.id)}>
                            <p>{doc.title}</p>
                            <p className='doc-description'>{doc.description}</p>
                            <p className='doc-date'>Last Updated: {doc.lastUpdated}</p>
                            <div className='doc-content'>
                                <p>{doc.textSnippet}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <Modal
                open={open}
                setOpen={setOpen}
                title={title}
                setTitle={setTitle}
                createDoc={createDoc}
                deleteDoc={null}
            />            

        </div>
    )
}

