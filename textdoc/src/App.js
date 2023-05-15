import './App.css';
import Home from './components/home';
import DocEditor from './components/DocEditor';
import { app, database } from './firebaseConfig';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home database={database} />} />
      <Route path="/documents/:id" element={<DocEditor database={database}/>} />
    </Routes>
  );
}

export default App;
