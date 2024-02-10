import React, { useEffect, useState } from 'react'
import { user } from '../Login/Login'
import { io } from 'socket.io-client';
import Message from '../Message/Message';
import './Chat.css'
import ReactScrollToBottom from 'react-scroll-to-bottom';

let socket;

const Chat = () => {
  const [id, setId] = useState("");
  const [messages, setMessages] = useState([]);

  const send = () => {
    const message = document.getElementById('chatMessage').value;
    console.log("SocketID: ", id);
    socket.emit("message", { message, id });
    document.getElementById('chatMessage').value = "";
  }

  console.log(messages);
  console.log("User: ", user);

  useEffect(() => {
    socket = io( process.env.SERVER_URL , {
      transports: ["websocket"]    
    });

    socket.on("connect", () => {
      setId(socket.id);
      console.log("Connected");
    });

    socket.emit("joined", { user });

    socket.on("welcome", (data) => {
      setMessages([...messages, data]);
      console.log(data);
    })

    socket.on("userJoined", (data) => {
      setMessages([...messages, data]);
      console.log(data.user, data.message);
    })

    socket.on("left", (data) => {
      setMessages([...messages, data]);
      console.log(data.user, data.message);
    })

    socket.on("receive-message", (data) => {
      console.log(data);
      setMessages((messages) => [...messages, data]);
    })

    return () => {
      socket.emit("disconnect");
      socket.off();
    }
  });

  useEffect(() => {
    socket.on("sendMessage", (data) => {
      setMessages([...messages, data]);
      console.log(data);
    })

    return () => {
      socket.off();
    }
  }, [messages])



  return (
    <div className='page'>
      <div className='container'>
        <div className='header'>
          <h3>CHIT-CHAT</h3>
          <p>x</p>
        </div>
        <ReactScrollToBottom className='chatBody'>
          {
            messages.map((item, index) =>
              <Message key={index} user={item.id === id ? '' : item.user} message={item.message} person={item.id === id ? "right" : "left"} />
            )
          }
        </ReactScrollToBottom>
        <div className='inputBox'>
          <input type='text' id='chatMessage' onKeyDown={(event) => event.key === 'Enter' ? send() : null} placeholder='Message'></input>
          <button className='sendBtn' onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default Chat