# Linked/Post - Social Media Application

A modern, feature-rich social media platform built with React, featuring real-time interactions, infinite scroll, and a beautiful dark/light theme interface.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.16-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-5.90.10-FF4154?style=flat&logo=react-query&logoColor=white)

## ✨ Features

### 🔐 Authentication & User Management

- **Secure Authentication**: Email and password-based authentication with JWT tokens
- **User Registration**: Create new accounts with comprehensive validation
- **Profile Management**: Update profile pictures and change passwords
- **Protected Routes**: Secure pages accessible only to authenticated users

### 📱 Social Features

- **Create Posts**: Share your thoughts with text and images
- **Infinite Scroll**: Seamless browsing experience with lazy-loaded posts
- **Comments System**: Engage with posts through comments
- **Post Management**: Edit and delete your own posts
- **User Profiles**: View user-specific posts and information
- **Real-time Updates**: Automatic feed refresh when creating new content

### 🎨 User Experience

- **Dark/Light Theme**: Toggle between dark and light modes with persistent preferences
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Smooth Animations**: Polished transitions and hover effects
- **Loading States**: Skeleton screens and loading indicators for better UX
- **Error Handling**: Comprehensive error messages and fallback UI
- **Data Prefetching**: Smart prefetching for faster navigation

### ⚡ Performance Optimizations

- **React Query Caching**: Efficient data caching and synchronization
- **Infinite Query**: Optimized pagination for large datasets
- **Query Prefetching**: Preload data on hover for instant navigation
- **Lazy Loading**: Load content as needed to reduce initial bundle size

## 🛠️ Tech Stack

### Frontend Framework

- **React 19.1.1**: Latest React with modern hooks and concurrent features
- **React Router DOM 7.9.4**: Client-side routing and navigation
- **Vite 7.1.7**: Lightning-fast build tool and dev server

### State Management & Data Fetching

- **TanStack React Query 5.90.10**: Powerful data synchronization and caching
- **React Context API**: Global state for authentication and theme
- **React Hook Form 7.65.0**: Performant form validation and handling

### Styling

- **TailwindCSS 4.1.16**: Utility-first CSS framework
- **DaisyUI 5.3.10**: Beautiful component library for Tailwind
- **Custom CSS**: Additional styling for unique components

### Validation & Forms

- **Zod 4.1.12**: TypeScript-first schema validation
- **@hookform/resolvers 5.2.2**: Form validation integration

### UI Components & Feedback

- **React Hot Toast 2.6.0**: Beautiful toast notifications
- **React Spinners 0.17.0**: Loading indicators and spinners

### HTTP Client

- **Axios 1.13.1**: Promise-based HTTP client for API requests

## 📁 Project Structure

```
social-app/
├── src/
│   ├── components/
│   │   ├── Home/              # Home feed with infinite scroll
│   │   ├── Profile/           # User profile and posts
│   │   ├── Login/             # Login page
│   │   ├── Register/          # Registration page
│   │   ├── Navbar/            # Navigation bar with theme toggle
│   │   ├── Layout/            # App layout wrapper
│   │   ├── createPost/        # Post creation component
│   │   ├── singlePost/        # Individual post display
│   │   ├── postDetails/       # Detailed post view
│   │   ├── commentitem/       # Comment component
│   │   ├── PostSkeleton/      # Loading skeleton
│   │   ├── loader/            # Loading spinner
│   │   ├── errorpage/         # Error page component
│   │   ├── Notfound/          # 404 page
│   │   ├── protectedRoute/    # Route protection HOC
│   │   ├── protectedAuth/     # Auth protection HOC
│   │   └── api/               # API service functions
│   │       ├── allpost.js
│   │       ├── getuserpost.js
│   │       ├── createpost.js
│   │       ├── updatepost.js
│   │       ├── deletepost.js
│   │       ├── singlepost.js
│   │       ├── addcomment.js
│   │       ├── updatecomment.js
│   │       ├── deletecomment.js
│   │       ├── getpostcomments.js
│   │       ├── uploadprofilephoto.js
│   │       ├── changepassword.js
│   │       └── getloggeduse.js
│   ├── context/
│   │   ├── tokenContext.jsx   # Authentication context
│   │   └── ThemeContext.jsx   # Theme management context
│   ├── assets/                # Static assets
│   ├── index.css              # Global styles
│   └── main.jsx               # App entry point
├── public/                    # Public assets
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── vercel.json                # Vercel deployment config
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🔌 API Integration

The application connects to the backend API at:

```
https://linked-posts.routemisr.com
```

### API Endpoints Used

#### Authentication

- `POST /users/signin` - User login
- `POST /users/signup` - User registration
- `GET /users/profile-data` - Get logged-in user data

#### Posts

- `GET /posts` - Get all posts (with pagination)
- `GET /posts/:id` - Get single post
- `GET /users/:userId/posts` - Get user-specific posts
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

#### Comments

- `GET /posts/:postId/comments` - Get post comments
- `POST /comments` - Add comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

#### User Profile

- `PUT /users/upload-photo` - Upload profile picture
- `PATCH /users/change-password` - Change password

## 🎨 Theme System

The application features a comprehensive theme system with:

- **Dark Mode**: Default theme with dark backgrounds
- **Light Mode**: Clean light theme for daytime use
- **Persistent Preferences**: Theme choice saved to localStorage
- **Forced Dark Mode**: Login and Register pages always use dark theme

Toggle theme using the sun/moon icon in the navbar.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Unauthorized users redirected to login
- **Password Validation**: Strong password requirements enforced
- **Secure Storage**: Tokens stored in localStorage with proper cleanup
- **Input Validation**: Form inputs validated using Zod schemas

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (#?!@$%^&\*-)

## 📱 Responsive Design

The application is fully responsive with breakpoints for:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚢 Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration for easy deployment:

1. Install Vercel CLI

   ```bash
   npm i -g vercel
   ```

2. Deploy
   ```bash
   vercel
   ```

### Manual Build

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ by Hamza

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [DaisyUI](https://daisyui.com/) - Component library
- [TanStack Query](https://tanstack.com/query) - Data fetching library
- [React Hook Form](https://react-hook-form.com/) - Form library
- [Zod](https://zod.dev/) - Validation library

---

**Note**: This is a frontend application that requires the backend API to be running. Make sure the API endpoint is accessible before using the application.
