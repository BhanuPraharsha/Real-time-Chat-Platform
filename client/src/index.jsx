import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <App />
    </NextThemesProvider>
  </React.StrictMode>
);

reportWebVitals();
