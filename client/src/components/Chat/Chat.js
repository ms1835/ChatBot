import React, { useEffect, useMemo, useState } from 'react'
import { user } from '../Login/Login'
import{ io } from 'socket.io-client';
import Message from '../Message/Message';
import './Chat.css'
import ReactScrollToBottom from 'react-scroll-to-bottom';

const Chat = () => {
  const [socketID, setSocketID] = useState("");
  const send = () => {
    const message = document.getElementById('chatMessage').value;
    socket.emit("message",{socketID, message});
    document.getElementById('chatMessage').value = "";
  }

  const socket = useMemo(() => io("http://localhost:3000",{
    withCredentials: true
  }),[]);

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      console.log("Connected");
    });

    socket.emit("joined", { user });

    socket.on("welcome", (data) => {
      console.log(data);
    })

    socket.on("userJoined", (data) => {
      console.log(data.user,data.message);
    })

    socket.on("left", (data) => {
      console.log(data.user,data.message);
    })

    // socket.on("receive-message", (data) => {
    //   console.log(data);
    //   setMessages((messages) => [...messages, data]);
    // })

    return () => {
      socket.emit("disconnect");
      socket.off();
    }
  }, []);

  useEffect(() => {
    socket.on("sendMessage",(data) => {
      console.log(data);
    })
  
    return () => {
      
    }
  }, [])
  

  return (
    <div className='page'>
        <div className='container'>
            <div className='header'></div>
            <ReactScrollToBottom className='chatBody'>
              <Message message={"hello"} />
              <Message message={"hello"} />
              <Message message={"hello"} />
              <Message message={"hello"} />
              <Message message={"hello"} />
            </ReactScrollToBottom>
            <div className='inputBox'>
              <input type='text' id='chatMessage'></input>
              <button className='sendBtn' onClick={send}>Send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat