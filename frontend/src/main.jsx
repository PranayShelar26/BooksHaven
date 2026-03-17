import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from "./context/UserContext";
import { BookProvider } from './context/BookContext.jsx';

/**
 * Application entry point
 * Renders React app with global context providers
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* User context - manages authentication and user state */}
    <UserProvider>
      {/* Book context - manages book data and filtering */}
      <BookProvider>
        {/* Main app component with routing */}
        <App /> 
      </BookProvider>
    </UserProvider>
  </StrictMode>,
)