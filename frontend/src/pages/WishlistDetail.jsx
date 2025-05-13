import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchWishlistById, 
  addProduct, 
  addMember,
  deleteProduct,
  deleteWishlist 
} from '../store/slices/wishlistSlice';
import io from 'socket.io-client';

const WishlistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentWishlist, loading, error } = useSelector(state => state.wishlist);
  const user = useSelector(state => state.auth.user);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    imageUrl: '',
    price: ''
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const canDeleteProduct = (product) => {
    if (!user || !currentWishlist || !product) return false;
    
    const isCreator = currentWishlist.creator?._id === user.id;
    const isProductAdder = product.addedBy?._id === user.id;
    
    console.log('Delete Permission Check:', {
      userId: user.id,
      creatorId: currentWishlist.creator?._id,
      productAdderId: product.addedBy?._id,
      isCreator,
      isProductAdder
    });
    
    return isCreator || isProductAdder;
  };

  const canDeleteWishlist = () => {
    if (!user || !currentWishlist) return false;
    return currentWishlist.creator?._id === user.id;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join-wishlist', id);
    
    socket.on('refresh-wishlist', () => {
      dispatch(fetchWishlistById(id));
    });

    socket.on('product-deleted', ({ wishlistId, productId }) => {
      if (wishlistId === id) {
        dispatch(fetchWishlistById(id));
      }
    });

    dispatch(fetchWishlistById(id));

    return () => {
      socket.emit('leave-wishlist', id);
      socket.disconnect();
    };
  }, [dispatch, id, user, navigate]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    dispatch(addProduct({
      wishlistId: id,
      productData: {
        ...newProduct,
        price: parseFloat(newProduct.price)
      }
    }));
    setShowAddProductModal(false);
    setNewProduct({ name: '', imageUrl: '', price: '' });
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    dispatch(addMember({
      wishlistId: id,
      email: newMemberEmail
    }));
    setShowAddMemberModal(false);
    setNewMemberEmail('');
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeleteError(null);
    setDeleteInProgress(true);
    
    console.log('Attempting to delete product:', {
      productId,
      wishlistId: id,
      userId: user?.id,
      currentWishlist: {
        creator: currentWishlist?.creator?._id,
        members: currentWishlist?.members?.map(m => m._id)
      }
    });
    
    try {
      await dispatch(deleteProduct({ wishlistId: id, productId })).unwrap();
      // Refresh the wishlist data
      dispatch(fetchWishlistById(id));
    } catch (err) {
      console.error('Delete product error:', err);
      setDeleteError(err.message || 'Failed to delete product');
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleDeleteWishlist = async () => {
    if (!window.confirm('Are you sure you want to delete this wishlist? This action cannot be undone.')) {
      return;
    }

    setDeleteError(null);
    setDeleteInProgress(true);
    
    try {
      await dispatch(deleteWishlist(id)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete wishlist');
      setDeleteInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentWishlist) {
    return (
      <div className="text-center text-gray-600 mt-8">
        Wishlist not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {deleteError}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentWishlist.name}</h1>
          <p className="text-gray-600">{currentWishlist.description}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            disabled={deleteInProgress}
          >
            Add Product
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            disabled={deleteInProgress}
          >
            Add Member
          </button>
          {canDeleteWishlist() && (
            <button
              onClick={handleDeleteWishlist}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
              disabled={deleteInProgress}
            >
              {deleteInProgress ? 'Deleting...' : 'Delete Wishlist'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentWishlist.products?.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="relative pt-[100%]">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="absolute top-0 left-0 w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                {canDeleteProduct(product) && (
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Delete product"
                    disabled={deleteInProgress}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                Added by: {product.addedBy?.username || 'Unknown'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistDetail; 