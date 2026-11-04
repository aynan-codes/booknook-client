# 📚 BookNook — A Small Online Library

### Discover Books, Share Knowledge, and Enjoy Reading!

BookNook is a modern online library application where book lovers can explore books, add their own books, manage their collections, and borrow or return books easily. It provides a user-friendly platform for discovering and sharing books.

---

## 🌐 Live Website

🔗 **Live Site:** Coming Soon (Deployment in Progress)

---

## ✨ Key Features

- 📖 **Explore Books:** Browse a collection of books and discover new reads with detailed information.
- 🔐 **Secure Authentication:** Register and log in using email and password or Google Sign-In.
- ➕ **Add New Books:** Authenticated users can contribute books to the library.
- 📝 **Manage Your Books:** Edit and delete books added by you.
- 📚 **Borrow Books:** Borrow available books and manage your borrowing records.
- 🔄 **Return Books:** Easily return borrowed books through the My Borrows section.
- 🆕 **New Arrivals:** Discover the latest books added to the library.
- 👤 **Personalized Experience:** Access your profile and manage your library activities.
- 📱 **Fully Responsive:** Enjoy a smooth experience on desktop, tablet, and mobile devices.

---

## 🛠️ Technology Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Authentication
- Better Auth
- MongoDB Adapter
- Google OAuth

### Backend & Database
- Express.js
- MongoDB

### Additional Tools
- Git & GitHub
- npm
- Toast Notifications
- Swiper.js

---

## 📂 Project Structure

```text
booknook-client/
│
├── public/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

---

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/aynan-codes/booknook-client.git
```

### 2. Navigate to the Project Directory

```bash
cd booknook-client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory and configure the environment variables required by the application.

Add the appropriate values for:

- Better Auth configuration
- Authentication secret
- MongoDB connection (if required by the client configuration)
- Google OAuth credentials
- Backend API URL

**Note:** Never share or upload private credentials, API secrets, or database passwords to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Open in Browser

Visit:

```text
http://localhost:3000
```

---

## 🔑 Authentication & Authorization

BookNook provides authentication features to protect user accounts and private routes.

- Email and password registration.
- Email and password login.
- Google Sign-In.
- Protected routes for authenticated users.
- User-specific book management.
- User-specific borrowing records.

---

## 📚 Main Application Sections

| Section | Description |
|---|---|
| Home | Explore featured books and new arrivals. |
| All Books | Browse the available book collection. |
| Add Book | Add new books to the library. |
| My Books | Manage books added by the logged-in user. |
| My Borrows | View and manage borrowed books. |
| Login | Sign in to your account. |
| Register | Create a new account. |

---

## 🎯 Project Purpose

The main purpose of BookNook is to make book sharing and borrowing easier through a simple digital library platform.

Users can discover books, contribute to the collection, manage their own books, and keep track of borrowed books in one place.

---

## 👨‍💻 Developer

**Project Name:** BookNook — A Small Online Library

**Developer:** Abu Baten Mohammad Aynan

**GitHub:** https://github.com/aynan-codes

**Client Repository:** https://github.com/aynan-codes/booknook-client

---

## 📄 License

This project was developed for educational purposes.