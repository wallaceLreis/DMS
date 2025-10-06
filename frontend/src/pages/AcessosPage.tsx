import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Box, Typography, List, ListItemButton, ListItemText, Grid, Paper, Checkbox, Button, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions, IconButton, TextField, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid/models';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { ConfirmationDialog } from '../components/ConfirmationDialog';

interface Tela {
    tela_id: number;
    titulo_tela: string;
}
interface Usuario {
    usuario_id: number;
    username: string;
}
interface Acesso {
    acesso_id: number;
    usuario_id: number;
    username: string;
    pode_incluir: boolean;
    pode_alterar: boolean;
    pode_excluir: boolean;
}

export const AcessosPage = () => {
    const [telas, setTelas] = useState<Tela[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [selectedTela, setSelectedTela] = useState<Tela | null>(null);
    const [acessos, setAcessos] = useState<Acesso[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [newAcesso, setNewAcesso] = useState({ usuario_id: '', pode_incluir: false, pode_alterar: false, pode_excluir: false });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Acesso | null>(null);
    const [searchText, setSearchText] = useState('');
    
    const fetchTelas = async (query = '') => {
        try {
            const res = await api.get(`/telas?q=${query}`);
            setTelas(res.data);
        } catch (error) {
            console.error("Erro ao buscar telas:", error);
        }
    };
    
    const debouncedFetch = useMemo(() => debounce(fetchTelas, 300), []);

    useEffect(() => {
        fetchTelas();
        api.get('/usuarios').then(res => setUsuarios(res.data.filter((u: any) => u.role !== 'sup')));
    }, []);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetch(e.target.value);
    };

    const fetchAcessos = async (telaId: number) => {
        try {
            const res = await api.get(`/acessos?tela_id=${telaId}`);
            setAcessos(res.data);
        } catch (error) {
            console.error("Erro ao buscar acessos", error);
        }
    };

    useEffect(() => {
        if (selectedTela) {
            fetchAcessos(selectedTela.tela_id);
        } else {
            setAcessos([]);
        }
    }, [selectedTela]);

    const handleSaveNewAcesso = async () => {
        if (!selectedTela || !newAcesso.usuario_id) return;
        try {
            await api.post('/acessos', { ...newAcesso, tela_id: selectedTela.tela_id });
            await fetchAcessos(selectedTela.tela_id);
            setDialogOpen(false);
            setNewAcesso({ usuario_id: '', pode_incluir: false, pode_alterar: false, pode_excluir: false });
        } catch (error) {
            console.error("Erro ao salvar acesso", error);
            alert("Erro ao salvar. Verifique se o usuário já tem acesso a esta tela.");
        }
    };

    const handlePermissionChange = async (acesso: Acesso, field: 'pode_incluir' | 'pode_alterar' | 'pode_excluir', value: boolean) => {
        const updatedAcesso = { ...acesso, [field]: value };
        setAcessos(prev => prev.map(a => a.acesso_id === acesso.acesso_id ? updatedAcesso : a));
        try {
            await api.put(`/acessos/${acesso.acesso_id}`, updatedAcesso);
        } catch (error) {
            console.error("Erro ao atualizar permissão", error);
            if (selectedTela) await fetchAcessos(selectedTela.tela_id);
        }
    };

    const openConfirmDialog = (acesso: Acesso) => {
        setItemToDelete(acesso);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete || !selectedTela) return;
        try {
            await api.delete(`/acessos/${itemToDelete.acesso_id}`);
            await fetchAcessos(selectedTela.tela_id);
        } catch (error) {
            console.error("Erro ao deletar acesso", error);
        } finally {
            setItemToDelete(null);
            setConfirmOpen(false);
        }
    };
    
    const columns: GridColDef[] = [
        { field: 'username', headerName: 'Usuário', flex: 1 },
        { field: 'pode_incluir', headerName: 'Incluir', width: 100,
          renderCell: (params) => <Checkbox checked={params.value} onChange={(e) => handlePermissionChange(params.row, 'pode_incluir', e.target.checked)} /> },
        { field: 'pode_alterar', headerName: 'Alterar', width: 100,
          renderCell: (params) => <Checkbox checked={params.value} onChange={(e) => handlePermissionChange(params.row, 'pode_alterar', e.target.checked)} /> },
        { field: 'pode_excluir', headerName: 'Excluir', width: 100,
          renderCell: (params) => <Checkbox checked={params.value} onChange={(e) => handlePermissionChange(params.row, 'pode_excluir', e.target.checked)} /> },
        { field: 'actions', type: 'actions', headerName: 'Ações', width: 80,
          renderCell: (params) => ( <IconButton onClick={() => openConfirmDialog(params.row)}><DeleteIcon /></IconButton> ) }
    ];

    return (
        <Grid container spacing={2} sx={{ height: '80vh' }}>
            <Grid item xs={4}>
                <Typography variant="h6">Telas do Sistema</Typography>
                <TextField label="Pesquisar Tela" variant="outlined" fullWidth size="small" value={searchText} onChange={handleSearchChange} sx={{ my: 1 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}/>
                <Paper style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                    <List component="nav">
                        {telas.map(tela => (
                            <ListItemButton key={tela.tela_id} selected={selectedTela?.tela_id === tela.tela_id} onClick={() => setSelectedTela(tela)}>
                                <ListItemText primary={tela.titulo_tela} />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            </Grid>
            <Grid item xs={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6"> Permissões para: {selectedTela ? selectedTela.titulo_tela : 'Nenhuma tela selecionada'} </Typography>
                    <Button variant="contained" onClick={() => setDialogOpen(true)} disabled={!selectedTela}> Adicionar Acesso </Button>
                </Box>
                <Paper style={{ height: '100%', width: '100%' }}>
                    <DataGrid rows={acessos} columns={columns} getRowId={(row) => row.acesso_id} />
                </Paper>
            </Grid>
            <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Adicionar Acesso para {selectedTela?.titulo_tela}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                        <InputLabel>Usuário</InputLabel>
                        <Select label="Usuário" value={newAcesso.usuario_id} onChange={(e) => setNewAcesso({...newAcesso, usuario_id: e.target.value})}>
                            {usuarios.map(user => <MenuItem key={user.usuario_id} value={user.usuario_id}>{user.username}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Box>
                        <Checkbox checked={newAcesso.pode_incluir} onChange={(e) => setNewAcesso({...newAcesso, pode_incluir: e.target.checked})} /> Incluir
                        <Checkbox checked={newAcesso.pode_alterar} onChange={(e) => setNewAcesso({...newAcesso, pode_alterar: e.target.checked})} /> Alterar
                        <Checkbox checked={newAcesso.pode_excluir} onChange={(e) => setNewAcesso({...newAcesso, pode_excluir: e.target.checked})} /> Excluir
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveNewAcesso} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>
            <ConfirmationDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Confirmar Exclusão de Acesso" message={`Tem certeza que deseja remover o acesso do usuário "${itemToDelete?.username}" a esta tela?`}/>
        </Grid>
    );
};