import './App.css';
import Home from './components/home';
import DocEditor from './components/DocEditor';
import { database } from './firebaseConfig';
import { Routes, Route } from "react-router-dom";
import Login from './components/login_page';
import Signup from './components/signup_page';

function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home database={database} />} />
      <Route path="/documents/:id" element={<DocEditor database={database}/>} />
    </Routes>
  );
}

export default App;
