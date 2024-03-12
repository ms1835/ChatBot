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
      return <Navigate to={'/auth/sign_in'} />
    }
    else if(isLoggedIn && ['/auth/sign_in', '/auth/sign_up'].includes(window.location.pathname)){
      return <Navigate to={'/'} />
    }

    return children;
  }

  return (
    <Routes>
      <Route path="/auth/sign_in" element={
        <ProtectedRoute>
          <SignIn />
        </ProtectedRoute>
      } />
      <Route path="/auth/sign_up" element={
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