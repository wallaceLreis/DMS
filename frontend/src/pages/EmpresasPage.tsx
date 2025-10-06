import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid/models';
import { Box, Typography, Button, IconButton, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { EmpresaDialog } from '../components/EmpresaDialog';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { Empresa } from '../types'; // <-- Importação do tipo central

// A interface local 'Empresa' foi removida daqui

export const EmpresasPage = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Empresa | null>(null);
    const [searchText, setSearchText] = useState('');

    const fetchEmpresas = async (query = '') => {
        try {
            const response = await api.get(`/empresas?q=${query}`);
            setEmpresas(response.data);
        } catch (error) {
            console.error("Erro ao buscar empresas:", error);
        }
    };

    const debouncedFetch = useMemo(() => debounce(fetchEmpresas, 300), []);
    
    useEffect(() => { fetchEmpresas(); }, []);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleOpenDialog = (empresa: Empresa | null = null) => {
        setEditingEmpresa(empresa);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleSave = async (formData: Partial<Empresa>, empresaId?: number) => {
        try {
            if (empresaId) {
                await api.put(`/empresas/${empresaId}`, formData);
            } else {
                await api.post('/empresas', formData);
            }
            fetchEmpresas(searchText);
            handleCloseDialog();
        } catch (error) {
            console.error("Erro ao salvar empresa:", error);
            alert("Erro ao salvar empresa.");
        }
    };

    const openConfirmDialog = (empresa: Empresa) => {
        setItemToDelete(empresa);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/empresas/${itemToDelete.empresa_id}`);
            fetchEmpresas(searchText);
        } catch (error) {
            console.error("Erro ao deletar empresa:", error);
        } finally {
            setItemToDelete(null);
            setConfirmOpen(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'nome_fantasia', headerName: 'Nome Fantasia', flex: 1 },
        { field: 'razao_social', headerName: 'Razão Social', flex: 1 },
        { field: 'cnpj', headerName: 'CNPJ', width: 180 },
        { field: 'actions', type: 'actions', headerName: 'Ações', width: 100,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleOpenDialog(params.row)}><EditIcon /></IconButton>
                    <IconButton onClick={() => openConfirmDialog(params.row)}><DeleteIcon /></IconButton>
                </>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Cadastro de Empresas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Nova Empresa
                </Button>
            </Box>
            <TextField label="Pesquisar por Nome, Razão Social ou CNPJ" variant="outlined" fullWidth value={searchText} onChange={handleSearchChange} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={empresas} columns={columns} getRowId={(row: Empresa) => row.empresa_id!} />
            </Box>
            <EmpresaDialog open={isDialogOpen} onClose={handleCloseDialog} onSave={handleSave} empresa={editingEmpresa} />
            <ConfirmationDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Confirmar Exclusão" message={`Tem certeza que deseja excluir a empresa "${itemToDelete?.nome_fantasia}"?`} />
        </Box>
    );
};