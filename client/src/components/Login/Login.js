import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'

let user;

const sendUser = () => {
  user = document.getElementById('loginInput').value;
  document.getElementById('loginInput').value="";
}

const Login = () => {
  const [name, setName] = useState("");
  return (
    <div className='container' >
        <div className='form' >
            <h1 className='header'>Chit-Chat</h1>
            <input id='loginInput' type='text' placeholder='Enter Your Name' value={name} onChange={(e) => setName(e.target.value)}/>
            <Link to="/chat" onClick={(e) => !name ? e.preventDefault() : null}><button className='loginBtn' onClick={sendUser}>Login</button></Link>
        </div>
        
    </div>
    
  )
}

export {user}
export default Login;