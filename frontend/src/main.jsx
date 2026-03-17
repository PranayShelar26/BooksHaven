import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from "./context/UserContext";
import { BookProvider } from './context/BookContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <BookProvider>
        <App /> 
      </BookProvider>
    
    </UserProvider>
    
  </StrictMode>,
)
