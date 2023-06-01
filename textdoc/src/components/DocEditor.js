import { useState, useEffect, React, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './custom-quill.css';
import Modal from './Modal';
import jsPDF from 'jspdf';
import { PDFExport } from 'react-html2pdf';
import { Preview, print } from 'react-html2pdf';
import html2pdf from 'html2pdf.js';

import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { blue } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const emails = ['username@gmail.com', 'user02@gmail.com'];

function ShareDialog(props) {
    const { onClose, open, emailsIn } = props;
  
    const handleClose = () => {
      onClose();
    };
  
    const handleListItemClick = () => {
      onClose();
    };
  
    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>
            Shared Users
            {onClose ? (
                <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
                >
                <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
        
        <List sx={{ pt: 0 }}>
          {emailsIn.map((email) => (
            <ListItem disableGutters>
              <ListItemButton onClick={() => handleListItemClick(email)} key={email}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={email} />
              </ListItemButton>
            </ListItem>
          ))}
  
          <ListItem disableGutters>
            <ListItemButton
              autoFocus
              onClick={() => handleListItemClick('addAccount')}
            >
              <ListItemAvatar>
                <Avatar>
                  <AddIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Add user" />
            </ListItemButton>
          </ListItem>
        </List>
      </Dialog>
    );
  }
  
  ShareDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    emailsIn: PropTypes.array.isRequired,
  };

export default function DocEditor({ database }) {
    const isMounted = useRef();
    const params = useParams();
    const collectionRef = collection(database, 'docInfo'); // I need to change 'docinfo' to be the user's name! like UID!
    // I think i need to connect authentication to the firebase database

    const [docContent, setDocContent] = useState('');
    const [docTitle, setTitle] = useState('');
    const [shareUsers, setShareUsers] = useState('');
    const [savePending, setSavePending] = useState(false);
    const unsubscribeRef = useRef(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [open, setOpen] = useState(false);

    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const [shareOpen, setShareOpen] = useState(false);

    const getQuillData = (value) => {
        setDocContent(value);
        if (!savePending) {
            setSavePending(true);
        }
    }

    // Function to delete a Document
    const deleteDocument = () => {
        deleteDoc(doc(collectionRef, params.id));
        console.log("Deleting Doc. ID: ", params.id);
        console.log("Deleting Title: ", docTitle);
        toast.error('Deleting Document: ' + docTitle);
        const notification = 'Document \"'+ docTitle +'\" Deleted';
        navigate(`/home?notification=${encodeURIComponent(notification)}`);
        console.log("Doc is DELETED");

        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }
    }

    // LOAD DATA
    const getData = () => {
        console.log("getdata");
        const targetDoc = doc(collectionRef, params.id)
        const unsubscribe = onSnapshot(targetDoc, (docs) => {
            setDocContent(docs.data().body);
            setTitle(docs.data().title);
            setShareUsers(docs.data().roles);
        });

        unsubscribeRef.current = unsubscribe;
    }

    useEffect(() => {
        if (isMounted.current) {
            return;
        }
        isMounted.current = true;
        getData()

        // Cleanup function to detach the listener
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [])

    // Save data with debounce
    useEffect(() => {
        let debounceTimer;
        if (savePending) {
            debounceTimer = setTimeout(() => {
                const targetDoc = doc(collectionRef, params.id);
                updateDoc(targetDoc, {
                    body: docContent,
                })
                    .then(() => {
                        showSaveToast();
                        setSavePending(false);
                    })
                    .catch(() => {
                        toast.error('Unable To Save Document', {
                            autoClose: 2000,
                        });
                        setSavePending(false);
                    });
            }, 1000);
        }
        return () => clearTimeout(debounceTimer)
    }, [savePending, docContent]);

    // Warn user when leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // if (savePending) {
            //     event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            // }
        };

        window.onbeforeunload = handleBeforeUnload;

        return () => {
            window.onbeforeunload = null;
        };
    }, [savePending]);

    // Save Message
    const showSaveToast = () => {
        if (toast.isActive('saveToast')) {
            // If a toast with the ID 'myToast' exists, update its autoclose duration
            toast.update('saveToast', { autoClose: 2000 }); // Update the autoclose duration to 5000 milliseconds (5 seconds)
        } else {
            // Otherwise, create a new toast with the desired autoclose duration
            toast.success('Document Saved', { toastId: 'saveToast', autoClose: 2000 });
        }
    };

    let navigate = useNavigate();

    // Home Button
    const handleHomeButton = () => {
        navigate("/home");
    };

    // Changing the title
    const titleChange = (newTitle) => {
        setTitle(newTitle);
        const targetDoc = doc(collectionRef, params.id);
        updateDoc(targetDoc, {
            title: newTitle,
        })
            .then(() => {
                showSaveToast();
            })
            .catch(() => {
                toast.error('Unable To Update Title', {
                    autoClose: 2000,
                });
            });
    };


    // Export as PDF
    const pdfExportComponent = useRef(null);
    const exportAsPDF = () => {
        const options = {
            filename: 'document.pdf',
            html2canvas: { scale: 1 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };

        const style = `
        <style>
            body {
            font-family: Helvetica, sans-serif;
            font-size: 14px;
            color: #333;
            padding: 1in;
            }
        </style>
        `;

        const content = `
        <html>
            <head>${style}</head>
            <body>${docContent}</body>
        </html>
        `;

        html2pdf().set(options).from(content).save();
        console.log("Finished pdf export function");
    };

    const handleShare = () => {
        
    };


    // RETURN
    return (
        <div>
            <ToastContainer />
            <div className="doc-heading">
                <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => titleChange(e.target.value)}
                    class="doc-title-input"
                />
                <div className="options-container">
                <button 
                    className="editor-menu-button" onClick={handleOpen}
                    >
                    Delete Document
                </button>
                <button 
                    className="editor-menu-button" onClick={handleShareOpen}
                    >
                    Share
                </button>
                {docContent && (<button 
                    className="editor-menu-button"
                    onClick={exportAsPDF}
                    >
                        Export as PDF
                </button>
                )}
                 <button 
                    className="editor-menu-button" onClick={handleHomeButton}
                    >
                    Home
                </button>
                </div>

            </div>

            <div id="doc-content">
                <ReactQuill value={docContent} onChange={getQuillData} />
            </div>

            <Modal
                open={open}
                setOpen={setOpen}
                title={null}
                setTitle={null}
                createDoc={null}
                deleteDoc={deleteDocument}
            />

            <ShareDialog
                open={shareOpen}
                onClose={handleShareClose}
                emailsIn={emails}
            />
        </div>
    )
}