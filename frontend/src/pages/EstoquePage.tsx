import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
// CORREÇÃO 1: Separando a importação do componente e dos tipos
import type { GridColDef, GridRowParams } from '@mui/x-data-grid/models';
import { 
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, InputAdornment, Autocomplete, CircularProgress 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';

// --- Interfaces ---
interface Produto {
    produto_id: number;
    codigo: number;
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

interface MovimentoHistorico {
    movimento_id: number;
    numero_nota: string;
    quantidade: number;
    data_movimento: string;
}

interface DetailData {
    codigo: number;
    nome: string;
    quantidade_atual: number;
    ultimo_lancamento: string;
    historico: MovimentoHistorico[];
}

export const EstoquePage = () => {
    const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [movimento, setMovimento] = useState<MovimentoState>({ tipo_movimento: 'ENTRADA', produto_id: '', quantidade: '' });
    const [searchText, setSearchText] = useState('');
    
    const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
    const [codigoInput, setCodigoInput] = useState('');
    const [loadingProduto, setLoadingProduto] = useState(false);

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
        setSelectedProduto(null);
        setCodigoInput('');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => setDialogOpen(false);

    const handleMovimentoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleCodeSearch = async () => {
        if (!codigoInput) return;
        setLoadingProduto(true);
        try {
            const response = await api.get(`/produtos?q=${codigoInput}`);
            if (response.data.length === 1) {
                const produtoEncontrado = response.data[0];
                setSelectedProduto(produtoEncontrado);
                setMovimento({ ...movimento, produto_id: produtoEncontrado.produto_id });
            } else {
                setSelectedProduto(null);
                setMovimento({ ...movimento, produto_id: '' });
            }
        } catch (error) {
            console.error("Erro ao buscar produto por código", error);
        } finally {
            setLoadingProduto(false);
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
                    <Button variant="contained" color="success" onClick={() => handleOpenDialog('ENTRADA')} sx={{ mr: 1 }}>Adicionar Estoque</Button>
                    <Button variant="contained" color="error" onClick={() => handleOpenDialog('SAIDA')}>Baixar Estoque</Button>
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
                {/* CORREÇÃO 2: Adicionando o tipo ao parâmetro 'row' */}
                <DataGrid rows={estoque} columns={columns} getRowId={(row: EstoqueItem) => row.produto_id} onRowDoubleClick={handleRowDoubleClick} />
            </Box>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth>
                <DialogTitle>{movimento.tipo_movimento === 'ENTRADA' ? 'Registrar Entrada com Nota' : 'Registrar Saída'}</DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 2 }}>
                        <TextField
                            label="Código *"
                            variant="outlined"
                            value={codigoInput}
                            onChange={(e) => {
                                setCodigoInput(e.target.value);
                                if (selectedProduto && e.target.value !== String(selectedProduto.codigo)) {
                                    setSelectedProduto(null);
                                    setMovimento({ ...movimento, produto_id: '' });
                                }
                            }}
                            onBlur={handleCodeSearch}
                            onKeyDown={(e) => e.key === 'Enter' && handleCodeSearch()}
                            sx={{ width: '200px' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {loadingProduto ? <CircularProgress size={20} /> : <SearchIcon />}
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Autocomplete
                            fullWidth
                            options={produtos}
                            getOptionLabel={(option) => option.nome || ''}
                            value={selectedProduto}
                            onChange={(_event, newValue) => {
                                setSelectedProduto(newValue);
                                if (newValue) {
                                    setCodigoInput(String(newValue.codigo));
                                    setMovimento({ ...movimento, produto_id: newValue.produto_id });
                                } else {
                                    setCodigoInput('');
                                    setMovimento({ ...movimento, produto_id: '' });
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option.produto_id === value.produto_id}
                            renderInput={(params) => <TextField {...params} label="Nome do Produto *" />}
                        />
                    </Box>

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
                                {/* CORREÇÃO 3: Adicionando o tipo ao parâmetro 'row' */}
                                <DataGrid rows={detailData.historico} columns={historicoColumns} getRowId={(row: MovimentoHistorico) => row.movimento_id} />
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