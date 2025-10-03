import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { TabsProvider } from './contexts/TabsContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TabsProvider>
          <App />
        </TabsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);