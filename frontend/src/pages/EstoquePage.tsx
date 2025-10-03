import { useEffect, useState } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid'; // <-- Importando como type
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material'; // <-- Importando como type

interface Produto {
    produto_id: number;
    nome: string;
}

interface EstoqueItem {
    produto_id: number;
    codigo: number;
    nome: string;
    quantidade_atual: number;
}

interface MovimentoState {
    tipo_movimento: 'ENTRADA' | 'SAIDA';
    produto_id: number | '';
    quantidade: number | '';
}

export const EstoquePage = () => {
    const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [movimento, setMovimento] = useState<MovimentoState>({ tipo_movimento: 'ENTRADA', produto_id: '', quantidade: '' });

    const fetchEstoque = async () => {
        try {
            const response = await api.get('/estoque');
            setEstoque(response.data);
        } catch (error) {
            console.error("Erro ao buscar estoque:", error);
        }
    };

    const fetchProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
        }
    };

    useEffect(() => {
        fetchEstoque();
        fetchProdutos();
    }, []);

    const handleOpenDialog = (tipo: 'ENTRADA' | 'SAIDA') => {
        setMovimento({ tipo_movimento: tipo, produto_id: '', quantidade: '' });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleMovimentoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | ''>) => {
        setMovimento({ ...movimento, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!movimento.produto_id || !movimento.quantidade) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        try {
            await api.post('/estoque/movimento', movimento);
            fetchEstoque();
            handleCloseDialog();
        } catch (error) {
            console.error("Erro ao salvar movimento:", error);
            alert("Erro ao salvar movimento.");
        }
    };

    const columns: GridColDef[] = [
        { field: 'codigo', headerName: 'Código', width: 130 },
        { field: 'nome', headerName: 'Produto', flex: 1 },
        { field: 'quantidade_atual', headerName: 'Quantidade Atual', width: 180, type: 'number' },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Controle de Estoque</Typography>
                <Box>
                    <Button variant="contained" color="success" onClick={() => handleOpenDialog('ENTRADA')} sx={{ mr: 1 }}>
                        Adicionar Estoque
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleOpenDialog('SAIDA')}>
                        Baixar Estoque
                    </Button>
                </Box>
            </Box>
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={estoque} columns={columns} getRowId={(row) => row.produto_id} />
            </Box>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>{movimento.tipo_movimento === 'ENTRADA' ? 'Registrar Entrada' : 'Registrar Saída'}</DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Produto</InputLabel>
                        <Select
                            name="produto_id"
                            value={movimento.produto_id}
                            label="Produto"
                            onChange={handleMovimentoChange}
                        >
                            {produtos.map(p => <MenuItem key={p.produto_id} value={p.produto_id}>{p.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField
                        name="quantidade"
                        label="Quantidade"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={movimento.quantidade}
                        onChange={handleMovimentoChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
