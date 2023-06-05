import { useState, useEffect, React, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import ReactDOM from "react-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, doc, getDoc, updateDoc, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './custom-quill.css';
import Modal from './Modal';
// import jsPDF from 'jspdf';
// import { PDFExport } from 'react-html2pdf';
// import { Preview, print } from 'react-html2pdf';
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
import DialogContent from '@mui/material/DialogContent';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { transemail, transuid, makeWriter, makeReader, changeOwner, removeAccess } from '../sharing.js'
import Markdown from 'marked-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import turndown from 'turndown';
import getIndentLevel from 'turndown';
    
// Pop-up for list of shared users
function ShareDialog(props) {
    const { onClose, open, user, setUser, sharedUsers, setSharedUsers, permIn, setPermIn, ogMap, shareChange } = props;

    const handleClose = () => {
      onClose();
    };

    const inUser = (value) => {
        setUser(value);
    };

    const handleAdd = () => {
        const new_email = transemail(user);
        if(new_email === undefined){alert("Invalid user"); return;}

        switch(String(permIn)) {
            case 'owner':
                if(!changeOwner(ogMap, new_email)){alert("Document must have an owner"); return;}
                const owner = sharedUsers.find(x => x.perm === 'owner');
                owner.perm = 'writer';
                break;
            case 'writer':
                if(!makeWriter(ogMap, new_email)){alert("Document must have an owner"); return;}
                break;
            case 'reader':
                if(!makeReader(ogMap, new_email)){alert("Document must have an owner"); return;}
                break;
            default:
                alert("Set permission");
        }

        setSharedUsers([...sharedUsers, {id: new_email, email: user, perm: permIn}]);
        shareChange(ogMap);
        setUser('');
        setPermIn('');
    };

    const handlePermChange = (value, id) => {
        const newList = sharedUsers.slice();
        switch(String(value)) {
            case 'owner':
                if(!changeOwner(ogMap, id)){alert("Document must have an owner"); return;}
                const owner = newList.find(x => x.perm === 'owner');
                owner.perm = 'writer';
                break;
            case 'writer':
                if(!makeWriter(ogMap, id)){alert("Document must have an owner"); return;}
                break;
            case 'reader':
                if(!makeReader(ogMap, id)){alert("Document must have an owner"); return;}
                break;
            case 'del':
                if(!removeAccess(ogMap, id)){alert("Document must have an owner"); return;}
                newList.splice(newList.findIndex(x => x.id === id), 1);
                setSharedUsers(newList);
                shareChange(ogMap);
                return;
            default:
        }
        const sUsr = newList.find(x => x.id === id);
        sUsr.perm = value;
        setSharedUsers(newList);
        shareChange(ogMap);
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
        
        
        <DialogContent dividers={true}>
        <List sx={{ pt: 0 }}>
            {sharedUsers.map((u) => (
                <ListItem disableGutters key={u.id}>
                <ListItemButton>
                    <ListItemAvatar>
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                        <PersonIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={u.email} className="share-user-text"/>
                    <FormControl fullWidth>
                        <InputLabel id="share-select-label">Permission</InputLabel>
                        <Select
                        labelId="share-select-label"
                        id="share-select"
                        value={u.perm}
                        label="Permission"
                        onChange={(e) => handlePermChange(e.target.value, u.id)}
                        // sx = {{float: 'right'}}
                        >
                        <MenuItem value={'owner'}>Owner</MenuItem>
                        <MenuItem value={'writer'}>Editor</MenuItem>
                        <MenuItem value={'reader'}>Viewer</MenuItem>
                        <MenuItem value={'del'}>Remove User</MenuItem>
                        </Select>
                    </FormControl>
                </ListItemButton>
                </ListItem>
            ))}
        </List>
        </DialogContent>
        <List sx={{ pt: 0 }}>
          <ListItem disableGutters>
            <ListItemButton
              autoFocus
            >
              <ListItemAvatar onClick={handleAdd}>
                <Avatar>
                  <AddIcon />
                </Avatar>
              </ListItemAvatar>
              <input
                    placeholder="Add User"
                    type="text"
                    value={user}
                    onChange={(e) => inUser(e.target.value)}
                    className="share-input"
                />
                <FormControl fullWidth>
                    <InputLabel id="share-select-label">Permission</InputLabel>
                    <Select
                    labelId="share-select-label"
                    id="share-select"
                    value={permIn}
                    label="Permission"
                    onChange={(e) => setPermIn(e.target.value)}
                    >
                    <MenuItem value={'owner'}>Owner</MenuItem>
                    <MenuItem value={'writer'}>Editor</MenuItem>
                    <MenuItem value={'reader'}>Viewer</MenuItem>
                    </Select>
                </FormControl>
            </ListItemButton>
          </ListItem>
        </List>
      </Dialog>
    );
  }
  
  ShareDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    user: PropTypes.string.isRequired,
    setUser: PropTypes.func.isRequired,
    sharedUsers: PropTypes.array.isRequired,
    setSharedUsers: PropTypes.func.isRequired,
    permIn: PropTypes.string.isRequired,
    setPermIn: PropTypes.func.isRequired,
    ogMap: PropTypes.any.isRequired,
    shareChange: PropTypes.func.isRequired,
  };

export default function DocEditor({ database }) {
    const auth = getAuth();
    const userID = auth.currentUser.uid;
    console.log("here is the user's userID: ", userID);

    const isMounted = useRef();
    const params = useParams();
    // const collectionRef = collection(database, userID);
    const collectionRef = collection(database, 'docInfo');


    const [doclastUpdatedDate, setLastUpdatedDate] = useState('');
    const [doclastUpdatedTime, setLastUpdatedTime] = useState('');

    const [docContent, setDocContent] = useState('');
    const [docTitle, setTitle] = useState('');
    const [shareUsers, setShareUsers] = useState('');
    const [savePending, setSavePending] = useState(false);
    const unsubscribeRef = useRef(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [open, setOpen] = useState(false);

    const handleExportOpen = () => setExportOpen(true);
    const handleExportClose = () => setExportOpen(false);
    const [exportOpen, setExportOpen] = useState(false);

    const handleUploadOpen = () => setUploadOpen(true);
    const handleUploadClose = () => setUploadOpen(false);
    const [uploadOpen, setUploadOpen] = useState(false);

    const [shareOpen, setShareOpen] = useState(false);
    const handleShareOpen = () => setShareOpen(true);
    const handleShareClose = () => setShareOpen(false);
    const [user, setUser] = useState('');
    const [permIn, setPermIn] = useState('');

    // const [sharedUsers, setSharedUsers] = useState([]);

    // const data = [
    //     {id: 0, email:'username@gmail.com', perm: 'owner'}, 
    //     {id: 1, email:'user02@gmail.com', perm: 'view'},
    //     {id: 2, email:'user03@gmail.com', perm: 'edit'}
    // ];

    const appendContent = (content) => {
        const newContent = docContent + content;
        if(newContent != "") {
            toast.success("Uploaded Content!");
        }
        setDocContent(newContent);
    }
    const uploadError = (msg) => {
        toast.error(msg);
    }
    const getQuillData = (value) => {
        setDocContent(value);
        if (!savePending) {
            setSavePending(true);
        }
        // lastUpdatedChange();
    };

    // Function to delete a Document
    const deleteDocument = () => {
        let auth = getAuth();
        let user = auth.currentUser;
        if(shareUsers[user.uid] != "owner"){alert("Insufficient permissions"); return;}
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
    };

    
    // Function to create the string for the last updated time
    const getTheLastUpdatedString = () => {
        if ((doclastUpdatedDate === "") && (doclastUpdatedTime === "")) {
            return "";
        }
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          };
        
        const date = new Date(doclastUpdatedDate).toLocaleDateString(undefined, options);
        const updateString = `Last updated on ${date} at ${doclastUpdatedTime}`;
        console.log(updateString);
        return updateString;
    }
    
    // LOAD DATA
    const getData = () => {
        console.log("getdata");
        const targetDoc = doc(collectionRef, params.id)
        const unsubscribe = onSnapshot(targetDoc, (docs) => {
            setDocContent(docs.data().body);
            setTitle(docs.data().title);
            setShareUsers(docs.data().roles);
            setLastUpdatedDate(docs.data().lastUpdatedDate);
            setLastUpdatedTime(docs.data().lastUpdatedTime);
        });
        console.log("the last updated day: ", doclastUpdatedDate);
        console.log("the last updated time: ", doclastUpdatedTime);

        console.log(doc.docContent);
        unsubscribeRef.current = unsubscribe;
    };

    useEffect(() => {
        if (isMounted.current) {
            return;
        }
        isMounted.current = true;
        getData();

        // Cleanup function to detach the listener
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    // Save data with debounce
    useEffect(() => {
        let debounceTimer;
        if (savePending) {
            debounceTimer = setTimeout(() => {
                const targetDoc = doc(collectionRef, params.id);
                const currDate = new Date().toLocaleDateString();
                const currTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                updateDoc(targetDoc, {
                    body: docContent,
                    lastUpdatedDate: currDate,
                    lastUpdatedTime: currTime,
                    docContent: docContent,
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
                setLastUpdatedDate(currDate);
                setLastUpdatedTime(currTime);
            }, 1000);
        }
        return () => clearTimeout(debounceTimer);
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

    const shareChange = (newUsers) => {
        const targetDoc = doc(collectionRef, params.id);
        updateDoc(targetDoc, {
            roles: newUsers,
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
    const exportAsPDF = () => {
        const options = {
            filename: 'document.pdf',
            html2canvas: { scale: 2.5 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };

        const style = `
    <style>
      body {
        font-family: Helvetica, sans-serif;
        font-size: 12px;
        color: #333;
        margin: 1in;
        letter-spacing: 0.01px;
      }

      .content {
        padding: 0.5in;
      }

      body h1, body h2, body h3, body h4, body h5, body h6 {
        margin: 1em 0;
        font-weight: bold;
      }
      
      body h1 {
      font-size: 28px;
    }

    body h2 {
      font-size: 24px;
    }

    body h3 {
      font-size: 22px;
    }

    body h4 {
      font-size: 18px;
    }

    body h5 {
      font-size: 16px;
    }

    body h6 {
      font-size: 14px;
    }

    body ul, ol {
      margin: 1em 0;
      padding-left: 1em;
    }

    body ul li {
      margin-bottom: 0.5em;
    }

    body ol li {
      margin-bottom: 0.5em;
    }
    </style>
  `;

        const content = `
    <html>
      <head>${style}</head>
      <body>
        <div class="content">${docContent}</div>
      </body>
    </html>
  `;
        console.log(docContent);
        html2pdf().set(options).from(content).save();
        console.log("Finished pdf export function");

        // Delay before allowing the next export
        setTimeout(() => {
            console.log("Ready for the next export");
        }, 2000); // Adjust the delay time (in milliseconds) as needed
    };

    // Convert shareUsers, an associative array, to sharedUsers, a normal array
    // This will make it easier to do real-time updates
    const [sharedUsers, setSharedUsers] = useState([]);

    useEffect(() => {
        var data = [];
    
        for (const key in shareUsers) {
            data.push(
                {id: key, email: String(transuid(key)), perm: String(shareUsers[key])}
            );
        }
        setSharedUsers(data);
        setSharedUsers(data);
      },[shareUsers]);



// Export as markdown

    const turndownService = new turndown();

    turndownService.addRule('underlineHeaders', {
    filter: ['h1','h2'],
        replacement: function (content, node, options) {
            const headerLevel = node.tagName === 'H1' ? '#' : '##';
            return headerLevel + ' ' + content + '\n\n';
        }
    });


    const exportAsMD = () => {
        const markdownContent = turndownService.turndown(docContent);

        // Sanitize the Markdown content using DOMPurify
        const sanitizedContent = DOMPurify.sanitize(markdownContent);

        // Create a Blob from the sanitized Markdown content
        const blob = new Blob([sanitizedContent], { type: 'text/markdown' });

        // Create a download link for the Markdown file
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'document.md'; // Specify the filename for the downloaded Markdown file

        // Trigger the file download
        downloadLink.click();
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
                    className="doc-title-input"
                />
                <span className="last-update-time">{getTheLastUpdatedString()}</span>
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
                    onClick={handleExportOpen}
                    >
                        Export
                </button>
                )}
                {docContent && (<button
                    className="editor-menu-button"
                        onClick={handleUploadOpen}
                >
                    Upload
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
                exportMD={null}
                exportPDF={null}
                append={null}
                uploadErr={null}
            />
            <Modal
                open={exportOpen}
                setOpen={setExportOpen}
                title={null}
                setTitle={null}
                createDoc={null}
                deleteDoc={null}
                exportMD={exportAsMD}
                exportPDF={exportAsPDF}
                append={null}
                uploadErr={null}
            />
            <Modal
                open={uploadOpen}
                setOpen={setUploadOpen}
                title={null}
                setTitle={null}
                createDoc={null}
                deleteDoc={null}
                exportMD={null}
                exportPDF={null}
                append={appendContent}
                uploadErr={uploadError}
            />

            <ShareDialog
                open={shareOpen}
                user = {user}
                setUser = {setUser}
                onClose = {handleShareClose}
                sharedUsers = {sharedUsers}
                setSharedUsers = {setSharedUsers}
                permIn = {permIn}
                setPermIn = {setPermIn}
                ogMap = {shareUsers}
                shareChange = {shareChange}
            />
        </div>
    );
}