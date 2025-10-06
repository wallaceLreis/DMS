import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button, Modal, TextField, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const fetchUsuarios = async (query = '') => {
        try {
            const response = await api.get(`/usuarios?q=${query}`);
            setUsuarios(response.data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    };

    const debouncedFetch = useMemo(() => debounce(fetchUsuarios, 300), []);

    useEffect(() => {
        fetchUsuarios();
    }, []);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, [e.target.name]: e.target.value });

    const handleSave = async () => {
        try {
            await api.post('/usuarios', newUser);
            fetchUsuarios();
            handleClose();
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
            alert("Não foi possível salvar o usuário.");
        }
    };

    const openConfirmDialog = (user: any) => {
        setItemToDelete(user);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/usuarios/${itemToDelete.usuario_id}`);
            fetchUsuarios();
        } catch (error) {
            console.error("Falha ao excluir o usuário:", error);
            alert("Ocorreu um erro ao excluir o usuário.");
        } finally {
            setItemToDelete(null);
            setConfirmOpen(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'usuario_id', headerName: 'ID', width: 90 },
        { field: 'username', headerName: 'Nome de Usuário', flex: 1 },
        { field: 'role', headerName: 'Perfil', width: 150 },
        { field: 'ativo', headerName: 'Ativo', width: 120, type: 'boolean' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            renderCell: (params) => (
                <IconButton onClick={() => openConfirmDialog(params.row)} disabled={params.row.is_nativo}>
                    <DeleteIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestão de Usuários</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Novo Usuário</Button>
            </Box>
            
            <TextField
                label="Pesquisar por Nome de Usuário"
                variant="outlined"
                fullWidth
                value={searchText}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />

            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={usuarios} columns={columns} getRowId={(row) => row.usuario_id} />
            </Box>
            
            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6">Novo Usuário</Typography>
                    <TextField margin="normal" fullWidth label="Nome de Usuário" name="username" onChange={handleInputChange} />
                    <TextField margin="normal" fullWidth label="Senha" name="password" type="password" onChange={handleInputChange} />
                    <TextField margin="normal" fullWidth label="Perfil (role)" name="role" defaultValue="user" onChange={handleInputChange} />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>Salvar</Button>
                    </Box>
                </Box>
            </Modal>
            <ConfirmationDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o usuário "${itemToDelete?.username}"? Esta ação não pode ser desfeita.`}
            />
        </Box>
    );
};