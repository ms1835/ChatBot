import React from 'react';
import './Message.css';

const Message = ({user, message, person}) => {
  if(user){
    return (
      <div className={`messageBox ${person}`}>
          {`${user}: ${message}`}
      </div>
    )
  } 
  else{
    return (
      <div className={`messageBox ${person}`}>
          {`You: ${message}`}
      </div>
    )
  }
  
}

export default Message;