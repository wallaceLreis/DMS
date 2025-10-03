// frontend/src/pages/UsuariosPage.tsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button, Modal, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const style = { /* Estilo do Modal */
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });

  const fetchUsuarios = async () => {
    const response = await api.get('/usuarios');
    setUsuarios(response.data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await api.post('/usuarios', newUser);
    fetchUsuarios(); // Atualiza a lista
    handleClose();
  };

  const columns: GridColDef[] = [
    { field: 'usuario_id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Nome de Usuário', width: 250 },
    { field: 'role', headerName: 'Perfil', width: 150 },
    { field: 'ativo', headerName: 'Ativo', width: 120, type: 'boolean' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gestão de Usuários</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Novo Usuário
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={usuarios} columns={columns} getRowId={(row) => row.usuario_id} />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">Novo Usuário</Typography>
          <TextField margin="normal" fullWidth label="Nome de Usuário" name="username" onChange={handleInputChange} />
          <TextField margin="normal" fullWidth label="Senha" name="password" type="password" onChange={handleInputChange} />
          <TextField margin="normal" fullWidth label="Perfil (role)" name="role" onChange={handleInputChange} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>Salvar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};