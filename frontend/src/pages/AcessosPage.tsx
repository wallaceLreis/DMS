// frontend/src/pages/AcessosPage.tsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Box, Typography, List, ListItemButton, ListItemText, Grid, Paper, Checkbox, Button, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

// Interfaces
interface Tela { tela_id: number; titulo_tela: string; }
interface Usuario { usuario_id: number; username: string; }
interface Acesso { acesso_id: number; usuario_id: number; username: string; pode_incluir: boolean; pode_alterar: boolean; pode_excluir: boolean; }

export const AcessosPage = () => {
    const [telas, setTelas] = useState<Tela[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [selectedTela, setSelectedTela] = useState<Tela | null>(null);
    const [acessos, setAcessos] = useState<Acesso[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [newAcesso, setNewAcesso] = useState({ usuario_id: '', pode_incluir: false, pode_alterar: false, pode_excluir: false });

    useEffect(() => {
        api.get('/telas').then(res => setTelas(res.data));
        api.get('/usuarios').then(res => setUsuarios(res.data));
    }, []);

    useEffect(() => {
        if (selectedTela) {
            api.get(`/acessos?tela_id=${selectedTela.tela_id}`).then(res => setAcessos(res.data));
        } else {
            setAcessos([]);
        }
    }, [selectedTela]);

    const handleSaveNewAcesso = async () => {
        if (!selectedTela || !newAcesso.usuario_id) return;
        await api.post('/acessos', { ...newAcesso, tela_id: selectedTela.tela_id });
        api.get(`/acessos?tela_id=${selectedTela.tela_id}`).then(res => setAcessos(res.data)); // Refresh
        setDialogOpen(false);
        setNewAcesso({ usuario_id: '', pode_incluir: false, pode_alterar: false, pode_excluir: false });
    };

    const columns: GridColDef[] = [
        { field: 'username', headerName: 'Usuário', flex: 1 },
        { field: 'pode_incluir', headerName: 'Incluir', renderCell: (params) => <Checkbox checked={params.value} disabled /> },
        { field: 'pode_alterar', headerName: 'Alterar', renderCell: (params) => <Checkbox checked={params.value} disabled /> },
        { field: 'pode_excluir', headerName: 'Excluir', renderCell: (params) => <Checkbox checked={params.value} disabled /> },
    ];

    return (
        <Grid container spacing={2} sx={{ height: '80vh' }}>
            {/* Painel da Esquerda: Lista de Telas */}
            <Grid item xs={4}>
                <Typography variant="h6">Telas do Sistema</Typography>
                <Paper style={{ height: '100%', overflow: 'auto' }}>
                    <List component="nav">
                        {telas.map(tela => (
                            <ListItemButton key={tela.tela_id} selected={selectedTela?.tela_id === tela.tela_id} onClick={() => setSelectedTela(tela)}>
                                <ListItemText primary={tela.titulo_tela} />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* Painel da Direita: Permissões */}
            <Grid item xs={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                        Permissões para: {selectedTela ? selectedTela.titulo_tela : 'Nenhuma tela selecionada'}
                    </Typography>
                    <Button variant="contained" onClick={() => setDialogOpen(true)} disabled={!selectedTela}>
                        Adicionar Acesso
                    </Button>
                </Box>
                <Paper style={{ height: '100%', width: '100%' }}>
                    <DataGrid rows={acessos} columns={columns} getRowId={(row) => row.acesso_id} />
                </Paper>
            </Grid>

            {/* Dialog para Adicionar Acesso */}
            <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Adicionar Acesso para {selectedTela?.titulo_tela}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
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
        </Grid>
    );
};