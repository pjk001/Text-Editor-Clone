import { useState, useEffect, React, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function DocEditor({ database }) {
  const isMounted = useRef();
  let params = useParams();

  const collectionRef = collection(database, 'docInfo');

  const [docContent, setDocContent] = useState('');

  const [isSaving, setIsSaving] = useState(false); // State to track saving status

  const getQuillData = (value) => {
    setDocContent(value);
  };

  const getData = () => {
    const targetDoc = doc(collectionRef, params.id);
    onSnapshot(targetDoc, (docs) => {
      const data = docs.data();
      if (data && data.body) {
        setDocContent(data.body);
      }
    });
  };

  useEffect(() => {
    if (isMounted.current) {
      return;
    }
    isMounted.current = true;
    getData();
  }, []);

  useEffect(() => {
    const updateDocument = setTimeout(() => {
      const targetDoc = doc(collectionRef, params.id);
      updateDoc(targetDoc, {
        body: docContent,
      })
        .then(() => {
          setIsSaving(true); // Show saving notification
          setTimeout(() => {
            setIsSaving(false); // Hide saving notification after a short delay
          }, 2000);
        })
        .catch(() => {
          alert('Unable to save');
        });
    }, 1000);

    return () => clearTimeout(updateDocument);
  }, [docContent]);

  return (
    <div>
      <h1>Document Editor</h1>
      {isSaving && (
        <div style={{ color: 'white', padding: '10px', textAlign: 'center' }}>
          Saving...
        </div>
      )}
      <ReactQuill value={docContent} onChange={getQuillData} />
    </div>
  );
}