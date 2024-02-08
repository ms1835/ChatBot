import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Chat from './components/Chat/Chat';

const App = () => {
  // const socket = useMemo(() => io("http://localhost:3000",{
  //   withCredentials: true
  // }),[]);

  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />}/>
      </Routes>
    </Router>
  )
}

export default App;