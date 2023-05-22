import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { create } from '@mui/material/styles/createTransitions';
import { signOut } from "firebase/auth";
import { auth, app } from "../firebaseConfig"

export default function Home({database}) {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = useState('')
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const collectionRef = collection(database, 'docInfo')
    const [docsData, setDocsData] = useState([]);
    let navigate = useNavigate();

    const createDoc = () => {
        addDoc(collectionRef, {
            title: title
        })
        .then(() => {
            alert('Document created')
            handleClose()
        })
        .catch(() => {
            alert('Cannot create document')
        })
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

    return (
        <div className='docs-main'>
            <h1>Docs Clone</h1>

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
                        <div className='doc-grid-child' onClick={() => getID(doc.id)}>
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
            />            

        </div>
    )
}

