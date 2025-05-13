const router = require('express').Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const { sendInvitation } = require('../services/emailService');

// Create a new wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const wishlist = new Wishlist({
      name,
      description,
      creator: req.user.userId,
      members: [req.user.userId]
    });
    const savedWishlist = await wishlist.save();
    res.status(201).json(savedWishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all wishlists for a user
router.get('/', auth, async (req, res) => {
  try {
    const wishlists = await Wishlist.find({
      members: req.user.userId
    }).populate('creator', 'username email');
    res.json(wishlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific wishlist
router.get('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('members', 'username email')
      .populate('products.addedBy', 'username email');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    if (!wishlist.members.some(member => member._id.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to view this wishlist' });
    }
    
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a product to wishlist
router.post('/:id/products', auth, async (req, res) => {
  try {
    const { name, imageUrl, price } = req.body;
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('members', 'username email')
      .populate('products.addedBy', 'username email');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    if (!wishlist.members.some(member => member._id.toString() === req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to add to this wishlist' });
    }
    
    wishlist.products.push({
      name,
      imageUrl,
      price,
      addedBy: req.user.userId
    });
    
    const updatedWishlist = await wishlist.save();
    
    // Re-fetch the wishlist with populated fields
    const populatedWishlist = await Wishlist.findById(updatedWishlist._id)
      .populate('creator', 'username email')
      .populate('members', 'username email')
      .populate('products.addedBy', 'username email');

    // Emit socket event for real-time update
    req.app.get('io').to(req.params.id).emit('product-added', {
      wishlistId: req.params.id,
      product: populatedWishlist.products[populatedWishlist.products.length - 1]
    });
    
    res.json(populatedWishlist);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add member to wishlist
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Attempting to add member with email:', email);
    
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('members', 'username email');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    if (wishlist.creator._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the creator can add members' });
    }
    
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found. Please make sure the user is registered.' });
    }
    
    if (wishlist.members.some(member => member._id.toString() === invitedUser._id.toString())) {
      return res.status(400).json({ message: 'User is already a member of this wishlist' });
    }
    
    wishlist.members.push(invitedUser._id);
    const updatedWishlist = await wishlist.save();
    
    // Emit socket event for real-time update
    req.app.get('io').to(req.params.id).emit('member-added', {
      wishlistId: req.params.id,
      member: {
        id: invitedUser._id,
        username: invitedUser.username,
        email: invitedUser.email
      }
    });
    
    res.json({
      wishlist: updatedWishlist,
      message: 'Member added successfully'
    });
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).json({ message: 'Failed to add member. Please try again.' });
  }
});

// Add comment to product
router.post('/:wishlistId/products/:productId/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const product = wishlist.products.id(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.comments.push({
      text,
      user: req.user.userId
    });
    
    const updatedWishlist = await wishlist.save();
    res.json(updatedWishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add reaction to product
router.post('/:wishlistId/products/:productId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const product = wishlist.products.id(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Remove existing reaction from this user if any
    product.reactions = product.reactions.filter(
      reaction => reaction.user.toString() !== req.user.userId
    );
    
    // Add new reaction
    product.reactions.push({
      emoji,
      user: req.user.userId
    });
    
    const updatedWishlist = await wishlist.save();
    res.json(updatedWishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a wishlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    if (wishlist.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the creator can delete this wishlist' });
    }
    
    await wishlist.deleteOne();
    res.json({ message: 'Wishlist deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product from wishlist
router.delete('/:wishlistId/products/:productId', auth, async (req, res) => {
  try {
    console.log('Delete product request:', {
      wishlistId: req.params.wishlistId,
      productId: req.params.productId,
      userId: req.user.userId
    });

    const wishlist = await Wishlist.findById(req.params.wishlistId)
      .populate('creator', 'username email')
      .populate('members', 'username email')
      .populate('products.addedBy', 'username email');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Debug log for members check
    console.log('Members check:', {
      members: wishlist.members.map(m => ({
        id: m._id.toString(),
        username: m.username
      })),
      userId: req.user.userId
    });
    
    // Check if user is a member of the wishlist
    const isMember = wishlist.members.some(member => 
      member._id.toString() === req.user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to modify this wishlist' });
    }
    
    const productIndex = wishlist.products.findIndex(
      product => product._id.toString() === req.params.productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = wishlist.products[productIndex];

    // Debug log for delete permission check
    console.log('Delete permission check:', {
      creatorId: wishlist.creator._id.toString(),
      productAdderId: product.addedBy._id.toString(),
      userId: req.user.userId,
      isCreator: wishlist.creator._id.toString() === req.user.userId,
      isProductAdder: product.addedBy._id.toString() === req.user.userId
    });
    
    // Only creator or product adder can delete
    const canDelete = 
      wishlist.creator._id.toString() === req.user.userId || 
      product.addedBy._id.toString() === req.user.userId;

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    // Remove the product from the array
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();
    
    // Re-fetch the wishlist with populated fields
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('creator', 'username email')
      .populate('members', 'username email')
      .populate('products.addedBy', 'username email');
    
    // Try to emit socket event if Socket.io is available
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(req.params.wishlistId).emit('product-deleted', {
          wishlistId: req.params.wishlistId,
          productId: req.params.productId
        });
      }
    } catch (socketErr) {
      console.log('Socket.io event emission failed:', socketErr);
      // Continue with the response even if socket emission fails
    }
    
    res.json(populatedWishlist);
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 