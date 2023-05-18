import {useState, useEffect, React, useRef} from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {collection, doc, updateDoc, onSnapshot} from 'firebase/firestore';


export default function DocEditor({database}) {
    const isMounted = useRef()
    let params = useParams();
    const collectionRef = collection(database, 'docInfo');
    console.log(params);

    // docContent reflects the content ofo the Document Editor's Quill Component
    const [docContent, setDocContent] = useState('');
    const getQuillData = (value) => {
        setDocContent(value);
    }

    const getData = () => {
        const targetDoc = doc(collectionRef, params.id)
        onSnapshot(targetDoc, (docs) => {
            setDocContent(docs.data().body)
        })
    }
    useEffect(() => {
        if(isMounted.current){
            return;
        }
        isMounted.current = true;
        getData()
    }, [])

    // Save data periodically after typing
    useEffect(() => {
        const updateDocument = setTimeout(() => {
            const targetDoc = doc(collectionRef, params.id);
            updateDoc(targetDoc, {
                body: docContent
            })
            .then(() => {
                alert('Saved');
            })
            .catch(() => {
                alert('Unable to save');
            })
        }, 1000)
        return () => clearTimeout(updateDocument)
    }, [docContent] )

    return (
        <div>
            <h1>Document Editor</h1>
            <ReactQuill
                value={docContent}
                onChange={getQuillData}
            />
        </div>
    )
}