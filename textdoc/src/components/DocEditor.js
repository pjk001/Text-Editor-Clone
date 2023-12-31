import { useState, useEffect, React, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './custom-quill.css';
import Modal from './Modal';
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
import DOMPurify from 'dompurify';
import turndown from 'turndown';
    
// Pop-up for list of shared users
function ShareDialog(props) {
    const { onClose, open, user, setUser, sharedUsers, setSharedUsers, permIn, setPermIn, ogMap, shareChange, owner, setOwner, errorAnnouncement } = props;
    let navigate = useNavigate()
    const handleClose = () => {
        setUser('');
        setPermIn('');
        onClose();
    };

    const inUser = (value) => {
        setUser(value);
    };

    const handleAdd = () => {
        const new_email = transemail(user);
        if(new_email === undefined){errorAnnouncement("Invalid user"); return;}

        var ownerChange = false;
        var newList = [];

        switch(String(permIn)) {
            case 'owner':
                const o_error = changeOwner(ogMap, new_email)
                if(o_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(o_error == 2){errorAnnouncement("Insufficient permissions"); return;}
                ownerChange = true;
                // const owner = sharedUsers.find(x => x.perm === 'owner');
                owner.perm = 'writer';
                newList = sharedUsers.slice();
                const newOwner = newList.splice(newList.findIndex(x => x.id === new_email), 1);
                newOwner.perm = 'owner';
                newList.push(owner);
                setOwner(newOwner);
                break;
            case 'writer':
                const w_error = makeWriter(ogMap, new_email)
                if(w_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(w_error == 2){errorAnnouncement("Insufficient permissions"); return;}

                break;
            case 'reader':
                const r_error = makeReader(ogMap, new_email)
                if(r_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(r_error == 2){errorAnnouncement("Insufficient permissions"); return;}
                break;
            default:
                errorAnnouncement("Set permission");
                return;
        }
        if (ownerChange) {
            setSharedUsers(newList);
        } else {
            setSharedUsers([...sharedUsers, {id: new_email, email: user, perm: permIn}]);
        }
        shareChange(ogMap);
        setUser('');
        setPermIn('');
    };

    const handlePermChange = (value, id) => {
        const newList = sharedUsers.slice();
        var ownerChange = false;
        switch(String(value)) {
            case 'owner':
                const o_error = changeOwner(ogMap, id)
                if(o_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(o_error == 2){errorAnnouncement("Insufficient permissions"); return;}
                // const owner = newList.find(x => x.perm === 'owner');
                ownerChange = true;
                owner.perm = 'writer';
                const newOwner = newList.splice(newList.findIndex(x => x.id === id), 1);
                newOwner.perm = 'owner';
                newList.push(owner);
                setOwner(newOwner);
                break;
            case 'writer':
                const w_error = makeWriter(ogMap, id)
                if(w_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(w_error == 2){errorAnnouncement("Insufficient permissions"); return;}
                break;
            case 'reader':
                const r_error = makeReader(ogMap, id)
                if(r_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(r_error == 2){errorAnnouncement("Insufficient permissions"); return;}
                break;
            case 'del':
                console.log("Trying to remove")
                const rem_error = removeAccess(ogMap, id)
                if(rem_error == 1){errorAnnouncement("Document must have an owner"); return;}
                if(rem_error == 2){errorAnnouncement("Insufficient permissions"); return;}
                newList.splice(newList.findIndex(x => x.id === id), 1);
                setSharedUsers(newList);
                shareChange(ogMap);
                navigate('/home')
                return;
            default:
        }
        if (!ownerChange) {
            const sUsr = newList.find(x => x.id === id);
            sUsr.perm = value;
        }
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
                onClick={handleClose}
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
            <ListItem disableGutters key={owner.id}>
                <ListItemButton>
                    <ListItemAvatar>
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                        <PersonIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={owner.email} sx={{ minWidth: '250px', overflowX: 'auto', marginRight: '10px' }}/>
                    <FormControl fullWidth>
                        <InputLabel id="share-select-label">Permission</InputLabel>
                        <Select
                        labelId="share-select-label"
                        id="share-select"
                        value={owner.perm}
                        label="Permission"
                        onChange={(e) => handlePermChange(e.target.value, owner.id)}
                        >
                        <MenuItem value={'owner'}>Owner</MenuItem>
                        <MenuItem value={'writer'}>Editor</MenuItem>
                        <MenuItem value={'reader'}>Viewer</MenuItem>
                        <MenuItem value={'del'}>Remove User</MenuItem>
                        </Select>
                    </FormControl>
                </ListItemButton>
            </ListItem>
            {sharedUsers.map((u) => (
                <ListItem disableGutters key={u.id}>
                <ListItemButton>
                    <ListItemAvatar>
                    <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                        <PersonIcon />
                    </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={u.email} sx={{ minWidth: '250px', overflowX: 'auto', marginRight: '10px' }}/>
                    <FormControl fullWidth>
                        <InputLabel id="share-select-label">Permission</InputLabel>
                        <Select
                        labelId="share-select-label"
                        id="share-select"
                        value={u.perm}
                        label="Permission"
                        onChange={(e) => handlePermChange(e.target.value, u.id)}
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
    owner: PropTypes.any.isRequired,
    setOwner: PropTypes.func.isRequired,
  };

export default function DocEditor({ database }) {
    const auth = getAuth();
    var userID;
    if(auth.currentUser){userID = auth.currentUser.uid;}
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

    const appendContent = (content) => {
        const newContent = docContent + content;
        const userRole = shareUsers[userID];
        if (userRole === "reader") {
            errorAnnouncement("You do not have editing permissions.")
            getData();
            return;
        }
        if(newContent != "") {
            toast.success("Uploaded Content!");
        }
        setDocContent(newContent);
    }

    const errorAnnouncement = (msg) => {
        toast.error(msg);
    }

    var flag = true; //User for getQuillData, but shouldn't be set to true every time
    const getQuillData = (value) => {
        console.log("Quill data");
        const userRole = shareUsers[userID];
        if (userRole === "reader") {
            setTimeout(function(){
                flag = true
            }, 100);
            // alert("You do NOT have editing permissions.");
            if(flag){
                errorAnnouncement("You do not have editing permissions.")
                flag = false;
            }
            getData(); // Need to check if this will also unsubscribe the data
            return;
        }
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
        if(shareUsers[user.uid] != "owner"){errorAnnouncement("Insufficient permissions"); return;}
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
                const currDate = new Date().toLocaleDateString();
                const currTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const targetDoc = doc(collectionRef, params.id);

                console.log(shareUsers);
                
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
            if (savePending) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
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
        const userRole = shareUsers[userID];
        if (userRole === "reader") {
            // alert("You do NOT have editing permissions.");
            errorAnnouncement("You do not have editing permissions.")
            getData(); // Need to check if this will also unsubscribe the data
            return;
        }
        setTitle(newTitle);
        const targetDoc = doc(collectionRef, params.id);
        const currDate = new Date().toLocaleDateString();
        const currTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
        setLastUpdatedDate(currDate);
        setLastUpdatedTime(currTime);
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
        const fileName = docTitle+'.pdf';
        const options = {
            filename: fileName,
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
        }, 2000); 
    };

    const [sharedUsers, setSharedUsers] = useState([]);
    const [owner, setOwner] = useState('');

    useEffect(() => {
        var data = [];
    
        for (const key in shareUsers) {
            if (shareUsers[key] === "owner") {
                setOwner({id: key, email: String(transuid(key)), perm: String(shareUsers[key])});
            } else {
                data.push(
                    {id: key, email: String(transuid(key)), perm: String(shareUsers[key])}
                );
            }
        }
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

        const sanitizedContent = DOMPurify.sanitize(markdownContent);

        const blob = new Blob([sanitizedContent], { type: 'text/markdown' });

        // make download link for Markdown file
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        const fileName = docTitle+'.md';
        downloadLink.download = fileName;

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
            <div className="options-container">
                <span className="last-update-time">{getTheLastUpdatedString()}</span>
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
                {(<button
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
                deleteDoc={deleteDocument}
                exportMD={null}
                exportPDF={null}
                append={null}
                uploadErr={null}
            />
            <Modal
                open={exportOpen}
                setOpen={setExportOpen}
                deleteDoc={null}
                exportMD={exportAsMD}
                exportPDF={exportAsPDF}
                append={null}
                uploadErr={null}
            />
            <Modal
                open={uploadOpen}
                setOpen={setUploadOpen}
                deleteDoc={null}
                exportMD={null}
                exportPDF={null}
                append={appendContent}
                uploadErr={errorAnnouncement}
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
                owner = {owner}
                setOwner = {setOwner}
                errorAnnouncement = {errorAnnouncement}
            />
        </div>
    );
}
