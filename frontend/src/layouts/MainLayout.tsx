// frontend/src/layouts/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, AppBar, Toolbar, Typography, Button, Tabs, Tab, CssBaseline, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import React, { useState } from 'react';
import api from '../services/api';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const openPasswordDialog = () => {
    handleClose();
    setPasswords({ currentPassword: '', newPassword: '' });
    setPasswordError('');
    setPasswordDialogOpen(true);
  };
  
  const closePasswordDialog = () => setPasswordDialogOpen(false);

  const handlePasswordChange = async () => {
    setPasswordError('');
    try {
      await api.put('/usuarios/change-password', passwords);
      closePasswordDialog();
      alert('Senha alterada com sucesso!');
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Erro ao alterar senha.");
    }
  };

  const menuItems = [
    { label: 'Início', value: '/inicio' },
    { label: 'Dicionário', value: '/dicionario' },
    { label: 'Usuários', value: '/usuarios' },
    { label: 'Acessos', value: '/acessos' },
  ];
  
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
          <div>
            <IconButton size="large" onClick={handleMenu} color="inherit" aria-label="menu do usuário">
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={isMenuOpen} // <-- AQUI ESTAVA O ERRO DE DIGITAÇÃO
              onClose={handleClose}
            >
              <MenuItem disabled sx={{ fontWeight: 'bold' }}>{user?.username}</MenuItem>
              <MenuItem onClick={openPasswordDialog}>Trocar Senha</MenuItem>
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </div>
        </Toolbar>
        <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
          {menuItems.map((item) => (
            <Tab key={item.value} label={item.label} value={item.value} />
          ))}
        </Tabs>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', backgroundColor: '#f4f6f8' }}>
        <Outlet />
      </Box>

      <Dialog open={isPasswordDialogOpen} onClose={closePasswordDialog}>
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="Senha Atual"
            type="password"
            fullWidth
            variant="standard"
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
          <TextField
            required
            margin="dense"
            label="Nova Senha"
            type="password"
            fullWidth
            variant="standard"
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
          {passwordError && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{passwordError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog}>Cancelar</Button>
          <Button onClick={handlePasswordChange}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};