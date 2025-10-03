// frontend/src/layouts/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, AppBar, Toolbar, Typography, Button, Tabs, Tab, CssBaseline } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';

export const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Início', value: '/inicio' },
    { label: 'Dicionário', value: '/dicionario' },
    { label: 'Usuários', value: '/usuarios' },
    { label: 'Acessos', value: '/acessos' },
  ];
  
  // Encontra a aba atual baseada na URL
  const currentTab = menuItems.find(item => location.pathname.startsWith(item.value))?.value || false;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
    };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DMS App
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Sair
          </Button>
        </Toolbar>
        <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit">
          {menuItems.map((item) => (
            <Tab key={item.value} label={item.label} value={item.value} />
          ))}
        </Tabs>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Outlet /> {/* O conteúdo da página será renderizado aqui */}
      </Box>
    </Box>
  );
};