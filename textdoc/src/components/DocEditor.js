import { useState, useEffect, React, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './custom-quill.css';


export default function DocEditor({ database }) {
    const isMounted = useRef();
    const params = useParams();
    const collectionRef = collection(database, 'docInfo'); // I need to change 'docinfo' to be the user's name! like UID!
    // I think i need to connect authentication to the firebase database

    const [docContent, setDocContent] = useState('');
    const [docTitle, setTitle] = useState('');
    const [savePending, setSavePending] = useState(false);
    const unsubscribeRef = useRef(null);

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
        alert('Deleting Document: ' + docTitle);
        navigate("/home");
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


    const handleHomeButton = () => {
        navigate("/home");
    }

    // RETURN
    return (
        <div>
            <ToastContainer />
            <button // Creates the Delete button
                onClick={() => deleteDocument()}
            > Delete Document
            </button>
            <button className='home' onClick={handleHomeButton}>
                Home
            </button>
            <h1>Document Editor</h1>
            <ReactQuill
                value={docContent}
                onChange={getQuillData}
            />
        </div>
    )
}