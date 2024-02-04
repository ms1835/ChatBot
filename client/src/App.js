import react, { useEffect, useMemo, useState } from "react";
import { io } from 'socket.io-client';
import { Container, Typography, TextField, Button, Stack } from '@mui/material';

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000",{
    withCredentials: true
  }),[]);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [socketID, setSocketID] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message",{ room, message});
    setMessage("");
    setRoom("");
  }

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  }

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      console.log("Connected", socketID);
    })

    socket.on("welcome", (s) => {
      console.log(s);
    })

    socket.on("receive-message", (data) => {
      console.log(data);
      setMessages((messages) => [...messages, data]);
    })

    return () => {
      socket.disconnect();
    }
  }, []);

  return (
    <Container>
      <Typography variant="h3" component={"div"}>
        Welcome to Socket.IO
      </Typography>

      <form onSubmit={joinRoomHandler}>
        <TextField
        label="Room Name" 
          value={roomName} 
          onChange={e => setRoomName(e.target.value)} 
          variant="outlined"
        />
        <Button type="submit" variant="contained">
          Join
        </Button>
      </form>

      <form onSubmit={handleSubmit}>
        <TextField
        label="Message" 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          variant="outlined"
        />
        <TextField 
        label="Room"
          value={room} 
          onChange={e => setRoom(e.target.value)} 
          variant="outlined"
        />
        <Button type="submit" variant="contained">
          Click Me!
        </Button>
      </form>

      <Stack>
        {
          messages.map((msg, index) => (
            <Typography component={"div"} key={index} variant="h5" gutterBottom>
              { msg }
            </Typography>
          )
        )}
      </Stack>
    </Container>
  )
}

export default App;