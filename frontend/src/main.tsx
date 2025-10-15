import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { TabsProvider } from './contexts/TabsContext.tsx';
import { ThemeProvider } from '@mui/material/styles'; 
import { theme } from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Envolve toda a aplicação com o ThemeProvider */}
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <TabsProvider>
            <App />
          </TabsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);