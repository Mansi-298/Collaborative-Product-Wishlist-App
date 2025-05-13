import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="text-xl font-bold text-gray-800">
            Wishlist App
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 