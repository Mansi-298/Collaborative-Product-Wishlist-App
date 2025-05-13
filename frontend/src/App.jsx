import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WishlistDetail from './pages/WishlistDetail';
import Navbar from './components/Navbar';

function App() {
  const isAuthenticated = useSelector(state => state.auth.token !== null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <Navbar />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wishlist/:id" 
              element={isAuthenticated ? <WishlistDetail /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 