import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlists, createWishlist } from '../store/slices/wishlistSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { wishlists, loading, error } = useSelector(state => state.wishlist);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlist, setNewWishlist] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchWishlists());
  }, [dispatch]);

  const handleCreateWishlist = (e) => {
    e.preventDefault();
    dispatch(createWishlist(newWishlist));
    setShowCreateModal(false);
    setNewWishlist({ name: '', description: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Wishlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Create New Wishlist
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {wishlists.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          No wishlists yet. Create your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlists.map(wishlist => (
            <Link
              key={wishlist._id}
              to={`/wishlist/${wishlist._id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {wishlist.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {wishlist.description || 'No description'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{wishlist.products?.length || 0} items</span>
                  <span>{wishlist.members?.length || 0} members</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Wishlist</h2>
            <form onSubmit={handleCreateWishlist}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newWishlist.name}
                  onChange={(e) => setNewWishlist({ ...newWishlist, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newWishlist.description}
                  onChange={(e) => setNewWishlist({ ...newWishlist, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;