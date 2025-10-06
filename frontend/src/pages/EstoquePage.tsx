import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { 
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, FormControl, InputLabel, Select, 
    MenuItem, InputAdornment 
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';

// --- Interfaces para Tipagem ---
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
    numero_nota?: string;
}

interface DetailData {
    codigo: number;
    nome: string;
    quantidade_atual: number;
    ultimo_lancamento: string;
    historico: any[];
}

export const EstoquePage = () => {
    const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [movimento, setMovimento] = useState<MovimentoState>({ tipo_movimento: 'ENTRADA', produto_id: '', quantidade: '' });
    const [searchText, setSearchText] = useState('');
    const [isDetailOpen, setDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<DetailData | null>(null);

    const fetchEstoque = async (query = '') => {
        try {
            const response = await api.get(`/estoque?q=${query}`);
            setEstoque(response.data);
        } catch (error) {
            console.error("Erro ao buscar estoque:", error);
        }
    };

    const debouncedFetchEstoque = useMemo(() => debounce(fetchEstoque, 300), []);

    useEffect(() => {
        fetchEstoque();
        api.get('/produtos').then(res => setProdutos(res.data));
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        debouncedFetchEstoque(e.target.value);
    };

    const handleOpenDialog = (tipo: 'ENTRADA' | 'SAIDA') => {
        setMovimento({ tipo_movimento: tipo, produto_id: '', quantidade: '', numero_nota: '' });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleMovimentoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | ''>) => {
        setMovimento({ ...movimento, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!movimento.produto_id || !movimento.quantidade) {
            alert("Por favor, preencha os campos obrigatórios.");
            return;
        }
        try {
            await api.post('/estoque/movimento', movimento);
            fetchEstoque(searchText);
            handleCloseDialog();
        } catch (error) {
            console.error("Erro ao salvar movimento:", error);
            alert("Erro ao salvar movimento.");
        }
    };

    const handleRowDoubleClick = async (params: GridRowParams) => {
        try {
            const response = await api.get(`/estoque/${params.id}/movimentos`);
            setDetailData(response.data);
            setDetailOpen(true);
        } catch (error) {
            console.error("Erro ao buscar detalhes do produto:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: 'codigo', headerName: 'Código', width: 130 },
        { field: 'nome', headerName: 'Produto', flex: 1 },
        { field: 'quantidade_atual', headerName: 'Quantidade Atual', width: 180, type: 'number' },
    ];

    const historicoColumns: GridColDef[] = [
        { field: 'numero_nota', headerName: 'Nota Fiscal', flex: 1 },
        { field: 'quantidade', headerName: 'Quantidade', width: 150, type: 'number' },
        {
            field: 'data_movimento',
            headerName: 'Data/Hora',
            width: 200,
            type: 'dateTime',
            valueFormatter: (value) => value ? new Date(value).toLocaleString('pt-BR') : '',
        },
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

            <TextField
                label="Pesquisar por Código ou Nome"
                variant="outlined"
                fullWidth
                value={searchText}
                onChange={handleSearchChange}
                sx={{ mb: 2 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />

            <Box sx={{ height: '65vh', width: '100%' }}>
                <DataGrid rows={estoque} columns={columns} getRowId={(row) => row.produto_id} onRowDoubleClick={handleRowDoubleClick} />
            </Box>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>{movimento.tipo_movimento === 'ENTRADA' ? 'Registrar Entrada com Nota' : 'Registrar Saída'}</DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="produto-select-label">Produto *</InputLabel>
                        <Select
                            labelId="produto-select-label"
                            name="produto_id"
                            value={movimento.produto_id}
                            label="Produto *"
                            onChange={handleMovimentoChange}
                        >
                            {produtos.map(p => <MenuItem key={p.produto_id} value={p.produto_id}>{p.nome}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {movimento.tipo_movimento === 'ENTRADA' &&
                        <TextField name="numero_nota" label="Número da Nota de Origem" fullWidth margin="normal" value={movimento.numero_nota || ''} onChange={handleMovimentoChange}/>
                    }
                    <TextField name="quantidade" label="Quantidade *" type="number" fullWidth margin="normal" value={movimento.quantidade} onChange={handleMovimentoChange}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDetailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="lg">
                {detailData && (
                    <>
                        <DialogTitle>
                            <Typography variant="h6">{detailData.codigo} - {detailData.nome}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Qtd. Disponível: {Number(detailData.quantidade_atual).toLocaleString('pt-BR')} | Último Lançamento: {detailData.ultimo_lancamento ? new Date(detailData.ultimo_lancamento).toLocaleDateString('pt-BR') : 'N/A'}
                            </Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="subtitle1" gutterBottom>Histórico de Entradas</Typography>
                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid rows={detailData.historico} columns={historicoColumns} getRowId={(row) => row.movimento_id} />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailOpen(false)}>Fechar</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};