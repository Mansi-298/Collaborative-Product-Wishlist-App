# 🛍️ Collaborative Product Wishlist App

A real-time shared wishlist application where multiple users can create, manage, and interact with wishlists collaboratively — perfect for planning shopping sprees together!

---

### 🚀 Features

- 👤 **User Authentication (Mock)**
  - Sign up and log in (dummy authentication system).
  
- 📝 **Wishlist Management**
  - Create, update, delete wishlists.
  - Add, edit, remove products with:
    - Name
    - Image URL
    - Price
  - Track who added or edited each item.
  
- 👥 **Collaborative Experience**
  - Invite others to join a wishlist (mock invitation).
  - See who contributed what using usernames/emails.
  
- 🔄 **Real-Time Synchronization**
  - Real-time updates across users using WebSockets.
  
- 📱 **Responsive UI**
  - Mobile-friendly design using React.

---

### 🧱 Tech Stack

#### 🖥️ Frontend
- React.js
- Axios (for API calls)
- Socket.IO-client (for real-time features)

#### 🛠️ Backend
- Node.js
- Express.js
- Socket.IO (WebSocket support)

#### 💾 Database
- MongoDB with Mongoose

---

### 📁 Folder Structure

```
  shared-wishlist-app/
│
├── client/ # React Frontend
│ ├── public/
│ └── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page-level components (Login, Wishlist, etc.)
│ ├── App.js # Main React app entry
│ ├── index.js # React DOM rendering
│ └── socket.js # Socket.IO client setup
│
├── server/ # Node.js/Express Backend
│ ├── controllers/ # Logic for routes
│ ├── models/ # Mongoose schemas for User, Wishlist, Product
│ ├── routes/ # API routes
│ ├── socket/ # Socket.IO server setup
│ ├── utils/ # Utility functions
│ └── index.js # Entry point for backend server
│
├── .env # Environment variables
├── package.json # Root project metadata
└── README.md

```
---

### 🌐 WebSockets

- Real-time sync using Socket.IO.
- Users receive live updates when someone:
  - Adds a new product
  - Edits product details
  - Deletes a product

---

### ✅ To-Do / Future Improvements

- ✉️ **Real invitation system** using email or invite links  
- 🔐 **Authentication using JWT** for secure login and protected routes  
- 🛡️ **Role-based access control**: Owner, Editor, Viewer  
- 🚀 **Deployment**:
  - Frontend on **Vercel**
  - Backend on **Render** or **Heroku**
- 💬 Add **commenting feature** on wishlist items  
- 📦 Drag & drop product reordering in wishlists  
- 🧾 Export wishlist as PDF or shareable link  

---

### 📸 Screenshots

> Add screenshots or screen recordings here to demonstrate key features like:

> - Login / Sign up
![Image](https://github.com/user-attachments/assets/e06e2900-c507-4f6a-933b-ff98ed0a00ea)

![Image](https://github.com/user-attachments/assets/2f759fc8-e088-42a7-9738-e53e6b49554e)

> - Dashboard UI
![Image](https://github.com/user-attachments/assets/e43977d8-4d02-4e85-b4cd-2844bed43c35)

> - Creating/editing a wishlist
![Image](https://github.com/user-attachments/assets/92839ae1-35e9-4cf6-985c-2e8c1fac7f4f)

![Image](https://github.com/user-attachments/assets/3e0d0fa5-5da1-4392-a2ac-988d22481d97)

![Image](https://github.com/user-attachments/assets/e0c3d30e-17d9-452f-9a0d-357a9ce1ef90)

> - add / delete a product
![Image](https://github.com/user-attachments/assets/4de5d14c-6f27-483a-ba02-513236d2349e)

![Image](https://github.com/user-attachments/assets/f33617dd-1e3e-4a1b-84bd-468bdf84f890)

![Image](https://github.com/user-attachments/assets/a4ccd08b-361a-4649-a728-3bea4fb2d058)

> - invite member
![Image](https://github.com/user-attachments/assets/8af87557-1de1-4e36-949f-a520260b251b)

> - Demo Video
[▶️ Watch Demo Video on Google Drive](https://drive.google.com/file/d/1Lnr8N0anjZQFIiUq9wiyQrBxJU4lzx2G/view?usp=sharing)
