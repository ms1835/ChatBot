import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Chat from './components/Chat/Chat';
import SignIn from './components/SignIn';
import SignUp from './components/SingUp';
import Dashboard from './components/Dashboard';

const App = () => {
  const ProtectedRoute = ({children, auth=false}) => {
    const isLoggedIn = localStorage.getItem('user:token') != null;

    if(!isLoggedIn && auth){
      return <Navigate to={'/api/login'} />
    }
    else if(isLoggedIn && ['/api/login', '/api/register'].includes(window.location.pathname)){
      return <Navigate to={'/'} />
    }

    return children;
  }

  return (
    <Routes>
      <Route path="/api/login" element={
        <ProtectedRoute>
          <SignIn />
        </ProtectedRoute>
      } />
      <Route path="/api/register" element={
        <ProtectedRoute>
         <SignUp />
        </ProtectedRoute>
      }/>
      <Route path='/' element={
        <ProtectedRoute auth={true}>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App;