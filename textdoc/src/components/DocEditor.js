import React from 'react';
import { useParams } from 'react-router-dom';

export default function DocEditor() {
    let params = useParams();
    console.log(params)
    return (
        <div>Document Editor</div>
    )
}