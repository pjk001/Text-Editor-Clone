import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { create } from '@mui/material/styles/createTransitions';

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

    return (
        <div className='docs-main'>
            <h1>Docs Clone</h1>

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

