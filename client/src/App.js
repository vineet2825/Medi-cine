import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import './App.css';

// Lazy loading components for performance optimization
const AddMedicine = lazy(() => import('./components/AddMedicine'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AdminUserList = lazy(() => import('./components/AdminUserList'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-brand">MediStock</div>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/">Order Medicine</Link>
            {user.role === 'admin' && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/users">Users</Link>
              </>
            )}
            <span className="user-name">Welcome, {user.name}</span>
            <button onClick={logout} className="btn btn-sm btn-outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          
          <main className="main-content">
            <Suspense fallback={<Loader fullPage />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <AddMedicine />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminUserList />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
