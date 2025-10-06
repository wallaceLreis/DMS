import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid/models';
import { Box, Typography, Button, Avatar, IconButton, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import { ProdutoDialog } from '../components/ProdutoDialog';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { Produto } from '../types';

export const ProdutosPage = () => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Produto | null>(null);
    const [searchText, setSearchText] = useState('');

    const fetchProdutos = async (query = '') => {
        try {
            const response = await api.get(`/produtos?q=${query}`);
            setProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        }
    };

    const debouncedFetch = useMemo(() => debounce(fetchProdutos, 300), []);

    useEffect(() => {
        fetchProdutos();
    }, []);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleOpenDialog = (produto: Produto | null = null) => {
        setEditingProduto(produto);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingProduto(null);
        setDialogOpen(false);
    };

    const handleSave = async (formData: FormData, produtoId?: number) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (produtoId) {
                await api.put(`/produtos/${produtoId}`, formData, config);
            } else {
                await api.post('/produtos', formData, config);
            }
            fetchProdutos(searchText);
            handleCloseDialog();
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            alert("Erro ao salvar produto.");
        }
    };

    const openConfirmDialog = (produto: Produto) => {
        setItemToDelete(produto);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/produtos/${itemToDelete.produto_id}`);
            fetchProdutos(searchText);
        } catch (error) {
            console.error("Erro ao deletar produto:", error);
        } finally {
            setItemToDelete(null);
            setConfirmOpen(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'codigo', headerName: 'Código', width: 130 },
        { 
            field: 'imagem_url', headerName: 'Foto', width: 80,
            renderCell: (params) => <Avatar src={params.value ? `http://localhost:3001${params.value}` : undefined} />
        },
        { field: 'nome', headerName: 'Nome', flex: 1 },
        { field: 'ean', headerName: 'EAN/DUN (Base)', width: 150 },
        { field: 'peso', headerName: 'Peso (KG Base)', width: 120 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 100,
            cellClassName: 'actions',
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
                <Typography variant="h4">Cadastro de Produtos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Novo Produto
                </Button>
            </Box>
            <TextField label="Pesquisar por Código, Nome ou EAN" variant="outlined" fullWidth value={searchText} onChange={handleSearchChange} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={produtos} columns={columns} getRowId={(row) => row.produto_id} />
            </Box>
            <ProdutoDialog open={isDialogOpen} onClose={handleCloseDialog} onSave={handleSave} produto={editingProduto} />
            <ConfirmationDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Confirmar Exclusão" message={`Tem certeza que deseja excluir o produto "${itemToDelete?.nome}"?`} />
        </Box>
    );
};