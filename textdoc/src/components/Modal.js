import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { marked } from 'marked';





const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'rgba(250, 250, 250, 1)',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ModalComponent({
    open,
    setOpen,
    deleteDoc,
    exportPDF,
    exportMD,
    append,
    uploadErr,
}) {
    const handleClose = () => setOpen(false);


    const handleUpload = (event) => {
        const file = event.target.files[0];
        if (file.type != 'text/markdown' && file.type != 'text/plain') {
            uploadErr("Incorrect File Type! Upload .md or .txt");
            return;
        }
        const reader = new FileReader();

        reader.onload = () => {
            const fileContent = reader.result;

            let processedContent;
            if (file.type=='text/markdown') {
                processedContent = convertMarkdownToHTML(fileContent);
            } else {
                processedContent = convertPlainTextToHTML(fileContent);
            }

            append(processedContent);
        };

        reader.readAsText(file);
    };

    const convertMarkdownToHTML = (markdown) => {
        const htmlContent = marked(markdown);
        return htmlContent;
    };

    const convertPlainTextToHTML = (plainText) => {
        // Put each line into a paragraph
        const lines = plainText.split('\n');
        const paragraphs = lines.map((line) => `<p>${line}</p>`);
        const htmlContent = paragraphs.join('');

        return htmlContent;
    };


    return (
        <div>
            {deleteDoc && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >

                    <Box sx={{...style, backgroundColor: 'rgba(255, 255, 255, 0.4)', border: 'none', borderRadius: '12px'}}>
                        <div className="delete-container">
                            <body className="confirmation-message" style={{ opacity: 0.7, borderRadius: '12px' }}>
                                Are you sure you want to delete this document?
                            </body>

                            <button className="confirmation-option" onClick={deleteDoc}>
                                Yes
                            </button>
                            <button className="cancel-option" onClick={handleClose}>
                                Cancel
                            </button>
                        </div>
                    </Box>
                </Modal>
            )}

            {exportPDF && exportMD && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >

                    <Box sx={{ ...style, backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '12px' }}>
                        <div className="delete-container">
                            <body className="confirmation-message" style={{ opacity: 0.7, borderRadius: '12px' }}>
                                Choose Output Type
                            </body>

                            <button className="confirmation-option" onClick={exportPDF}>
                                PDF
                            </button>
                            <button className="cancel-option" onClick={exportMD}>
                                Markdown
                            </button>
                        </div>
                    </Box>
                </Modal>
            )}

            {append && uploadErr && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{ ...style, backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '12px' }}>
                        <div className="delete-container">
                            <body className="confirmation-message" style={{ opacity: 0.7, borderRadius: '12px' }}>
                                Upload content (Will be appended)
                            </body>
                            <input type="file" id="fileInput" onChange={handleUpload} style={{ marginTop: '15px', fontSize: '17px' }}/>
                            
                        </div>
                    </Box>
                </Modal>
            )}
        </div>
    );
}