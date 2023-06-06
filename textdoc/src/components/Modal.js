import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { marked } from 'marked';





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
            if (isMarkdown(fileContent)) {
                processedContent = convertMarkdownToHTML(fileContent);
            } else {
                processedContent = convertPlainTextToHTML(fileContent);
            }

            append(processedContent);
        };

        reader.readAsText(file);
    };

    const isMarkdown = (content) => {
        // Check if the content starts with a markdown header
        return content.trim().startsWith('#');
    };

    const convertMarkdownToHTML = (markdown) => {
        // Convert markdown to HTML using your preferred markdown library
        // Replace this with your actual implementation
        // Example using the 'marked' library
        const htmlContent = marked(markdown);
        return htmlContent;
    };

    const convertPlainTextToHTML = (plainText) => {
        // Split the plain text into lines
        const lines = plainText.split('\n');
        // Convert each line to a separate paragraph
        const paragraphs = lines.map((line) => `<p>${line}</p>`);
        // Join the paragraphs together and return as HTML content
        const htmlContent = paragraphs.join('');
        return htmlContent;
    };


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

                    <Box sx={{ ...style, backgroundColor: 'rgba(255, 255, 255, 0.4)', border: 'none', borderRadius: '12px' }}>
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
                    <Box sx={{ ...style, backgroundColor: 'rgba(255, 255, 255, 0.4)', border: 'none', borderRadius: '12px' }}>
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