import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import { ReaderProvider } from './lib/ReaderProvider.jsx';
import { ThemeProvider } from './lib/ThemeProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ReaderProvider>
        <App />
      </ReaderProvider>
    </ThemeProvider>
  </StrictMode>,
)
