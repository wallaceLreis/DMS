import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTabs } from '../contexts/TabsContext';
import { Box, AppBar, Toolbar, Typography, Tabs, Tab, CssBaseline, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { openTabs, activeTab, setActiveTab, closeTab } = useTabs();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location.pathname, setActiveTab]);
    
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

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        navigate(newValue);
    };

    const handleCloseTab = (e: React.MouseEvent, valueToClose: string) => {
        e.stopPropagation();
        const newPath = closeTab(valueToClose);
        navigate(newPath);
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
                        <IconButton size="large" onClick={handleMenu} color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
                            <MenuItem disabled>{user?.username}</MenuItem>
                            <MenuItem onClick={openPasswordDialog}>Trocar Senha</MenuItem>
                            <MenuItem onClick={handleLogout}>Sair</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    textColor="inherit" 
                    indicatorColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {openTabs.map((tab) => (
                        <Tab 
                            key={tab.value} 
                            value={tab.value}
                            label={
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {tab.label}
                                    {tab.value !== '/inicio' && (
                                        <IconButton 
                                            size="small" 
                                            component="span"
                                            onClick={(e) => handleCloseTab(e, tab.value)}
                                            sx={{ ml: 1.5 }}
                                        >
                                            <CloseIcon fontSize="inherit" sx={{ color: '#fff', opacity: 0.7, '&:hover': { opacity: 1 } }} />
                                        </IconButton>
                                    )}
                                </Box>
                            } 
                        />
                    ))}
                </Tabs>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', backgroundColor: '#f4f6f8' }}>
                <Outlet />
            </Box>

            <Dialog open={isPasswordDialogOpen} onClose={closePasswordDialog}>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required margin="dense" label="Senha Atual" type="password" fullWidth variant="standard" onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                    <TextField required margin="dense" label="Nova Senha" type="password" fullWidth variant="standard" onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
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