import React from 'react'
import './Chat.css'

const Chat = () => {
  return (
    <div className='page'>
        <div className='container'>
            <div className='header'></div>
            <div className='chatBody'></div>
            <div className='inputBox'>
              <input type='text' id='chatMessage'></input>
              <button className='sendBtn'>Send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat