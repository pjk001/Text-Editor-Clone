import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ModalComponent({
    open,
    setOpen,
    title,
    setTitle,
    createDoc,
    deleteDoc,
}) {
    const handleClose = () => setOpen(false);

    return (
        <div>
            {createDoc && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <input
                            placeholder="Add the Title"
                            className="add-input"
                            onChange={(event) => setTitle(event.target.value)}
                            value={title}
                        />
                        <div className="button-container">
                            <button className="create-doc" onClick={createDoc}>
                                Add
                            </button>
                        </div>
                    </Box>
                </Modal>
            )}



            {deleteDoc && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >

                    <Box sx={style}>
                        <div className="delete-container">
                            <body className="confirmation-message">
                                Are you sure you want to delete this document?
                            </body>

                            <button className="confirmation-option" onClick={deleteDoc}>
                                Yes
                            </button>
                            <button className="cancel-option" onClick={handleClose}>
                                No
                            </button>
                        </div>
                    </Box>
                </Modal>
            )}
        </div>
    );
}