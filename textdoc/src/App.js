import './App.css';
import Home from './components/home';
import DocEditor from './components/DocEditor';
import { app, database } from './firebaseConfig';
import { auth } from './firebaseConfig'
import { Routes, Route } from "react-router-dom";
import Login from './components/login_page';
import Signup from './components/signup_page';

function App() {
  
  return (
    <Routes>
      <Route path="/home" element={<Home database={database} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/documents/:id" element={<DocEditor database={database}/>} />
    </Routes>
  );
}

export default App;
