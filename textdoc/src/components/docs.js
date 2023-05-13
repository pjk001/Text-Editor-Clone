import React, { useState } from 'react';
import Modal from './Modal';

export default function Docs() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
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
            />            

        </div>
    )
}