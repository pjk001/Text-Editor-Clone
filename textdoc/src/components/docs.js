import React, { useState } from 'react';
import Modal from './Modal';
import { addDoc, collection } from 'firebase/firestore';
import { create } from '@mui/material/styles/createTransitions';

export default function Docs({database}) {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = useState('')
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const collectionRef = collection(database, 'docInfo')

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

    return (
        <div className='docs-main'>
            <h1>Docs Clone</h1>

            <button
                className='create-doc'
                onClick={handleOpen}
            >
                Create Document
            </button>

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

