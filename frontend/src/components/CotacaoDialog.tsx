// frontend/src/components/CotacaoDialog.tsx

import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box,
    Autocomplete, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
    Typography, CircularProgress, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';
import axios from 'axios';
import type { Produto, Empresa } from '../types';

// --- FUNÇÃO DE MÁSCARA ---
const formatCEP = (value: string) => {
    if (!value) return '';
    const cep = value.replace(/\D/g, '');
    return cep
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
};


interface CotacaoDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

interface Item extends Produto {
    produto_id: number;
    quantidade: number;
}

interface Endereco {
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
}

export const CotacaoDialog = ({ open, onClose, onSave }: CotacaoDialogProps) => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
    const [cepDestino, setCepDestino] = useState('');
    const [destinatario, setDestinatario] = useState('');
    const [itens, setItens] = useState<Item[]>([]);
    const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
    const [quantidade, setQuantidade] = useState(1);
    const [enderecoDestino, setEnderecoDestino] = useState<Endereco | null>(null);
    const [cepLoading, setCepLoading] = useState(false);
    
    const [codigo, setCodigo] = useState('');
    // ATUALIZADO: Renomeado para 'availableStock' para clareza
    const [availableStock, setAvailableStock] = useState<number | null>(null);
    const [stockLoading, setStockLoading] = useState(false);

    useEffect(() => {
        if (open) {
            api.get('/empresas').then(res => setEmpresas(res.data));
            api.get('/produtos').then(res => setProdutos(res.data));
            
            setItens([]);
            setSelectedEmpresa(null);
            setCepDestino('');
            setDestinatario('');
            setSelectedProduto(null);
            setQuantidade(1);
            setEnderecoDestino(null);
            setAvailableStock(null);
            setStockLoading(false);
            setCodigo('');
        }
    }, [open]);

    // ATUALIZADO: Lê 'estoque_disponivel' da API
    const handleProdutoChange = async (val: Produto | null) => {
        setSelectedProduto(val);
        setAvailableStock(null);
        setCodigo(val?.codigo ? String(val.codigo) : '');

        if (val && val.produto_id) {
            setStockLoading(true);
            try {
                // A API agora retorna { ..., estoque_disponivel: X }
                const res = await api.get(`/estoque?produto_id=${val.produto_id}`);
                
                // Lê o campo correto da resposta
                const stock = res.data.estoque_disponivel ?? 0;
                setAvailableStock(stock);

            } catch (error) {
                console.error("Erro ao buscar estoque:", error);
                setAvailableStock(0);
            } finally {
                setStockLoading(false);
            }
        }
    };

    const handleCodigoSearch = () => {
        if (!codigo) return;
        const foundProduct = produtos.find(p => String(p.codigo) === codigo);
        
        if (foundProduct) {
            handleProdutoChange(foundProduct);
        } else {
            alert("Produto com este código não encontrado.");
            handleProdutoChange(null);
        }
    };

    // ATUALIZADO: Valida contra 'availableStock'
    const handleAddItem = () => {
        if (!selectedProduto || !selectedProduto.produto_id || quantidade <= 0) return;

        if (stockLoading) {
            alert("Aguarde, verificando estoque disponível...");
            return;
        }
        
        if (availableStock === null || quantidade > availableStock) {
            alert(`Quantidade excede o estoque disponível. Disponível: ${availableStock ?? 0}`);
            return;
        }

        if (itens.some(item => item.produto_id === selectedProduto.produto_id)) {
            alert("Este produto já foi adicionado à cotação.");
            return;
        }
        const newItem: Item = {
            ...selectedProduto,
            produto_id: selectedProduto.produto_id,
            quantidade: quantidade
        };
        setItens([...itens, newItem]);
        setSelectedProduto(null);
        setQuantidade(1);
        setAvailableStock(null);
        setCodigo('');
    };

    const handleRemoveItem = (produto_id: number) => {
        setItens(itens.filter(item => item.produto_id !== produto_id));
    };

    const handleSave = () => {
        if (!selectedEmpresa || !cepDestino || !destinatario || itens.length === 0) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }
        const data = {
            empresa_origem_id: selectedEmpresa.empresa_id,
            cep_destino: cepDestino.replace(/\D/g, ''),
            destinatario: destinatario,
            itens: itens.map(({ produto_id, quantidade }) => ({ produto_id, quantidade }))
        };
        onSave(data);
    };

    const handleCepBlur = async () => {
        const cep = cepDestino.replace(/\D/g, '');
        if (cep.length !== 8) {
            setEnderecoDestino(null);
            return;
        }

        setCepLoading(true);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (response.data.erro) {
                setEnderecoDestino(null);
                alert("CEP não encontrado.");
            } else {
                setEnderecoDestino(response.data);
            }
        } catch (error) {
            setEnderecoDestino(null);
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setCepLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Nova Cotação de Frete</DialogTitle>
            <DialogContent>
                {/* --- Seção 1: Dados do Envio --- */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">1. Dados do Envio</Typography>
                    <Autocomplete
                        options={empresas}
                        getOptionLabel={(opt) => opt.nome_fantasia || ''}
                        value={selectedEmpresa}
                        onChange={(_e, val) => setSelectedEmpresa(val)}
                        renderInput={(params) => (
                            <TextField {...params} label="Empresa de Origem *" margin="normal" />
                        )}
                    />
                    <TextField
                        label="Nome do Cliente / Destinatário *"
                        value={destinatario}
                        onChange={(e) => setDestinatario(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="CEP de Destino *"
                        value={formatCEP(cepDestino)}
                        onChange={(e) => setCepDestino(e.target.value.replace(/\D/g, ''))}
                        onBlur={handleCepBlur}
                        fullWidth
                        margin="normal"
                        inputProps={{ maxLength: 9 }}
                        InputProps={{
                            endAdornment: cepLoading && <CircularProgress size={20} />
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            bgcolor: '#f5f5f5',
                            p: 2,
                            borderRadius: 1,
                            mt: 1
                        }}
                    >
                        <TextField label="Rua" value={enderecoDestino?.logradouro || ''} InputProps={{ readOnly: true }} variant="standard" sx={{ flex: '1 1 60%' }} />
                        <TextField label="Bairro" value={enderecoDestino?.bairro || ''} InputProps={{ readOnly: true }} variant="standard" sx={{ flex: '1 1 35%' }} />
                        <TextField label="Cidade" value={enderecoDestino?.localidade || ''} InputProps={{ readOnly: true }} variant="standard" sx={{ flex: '1 1 60%' }} />
                        <TextField label="UF" value={enderecoDestino?.uf || ''} InputProps={{ readOnly: true }} variant="standard" sx={{ flex: '1 1 35%' }} />
                    </Box>
                </Box>

                {/* --- SEÇÃO 2: Itens da Cotação --- */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">2. Itens da Cotação</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <TextField
                            label="Código *"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCodigoSearch(); }}
                            sx={{ width: 150 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleCodigoSearch} edge="end">
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Autocomplete
                            options={produtos}
                            getOptionLabel={(opt) => opt.nome || ''}
                            value={selectedProduto}
                            onChange={(_e, val) => handleProdutoChange(val)}
                            fullWidth
                            renderInput={(params) => (
                                <TextField {...params} label="Nome do Produto *" />
                            )}
                        />
                        <TextField
                            label="Qtd."
                            type="number"
                            value={quantidade}
                            onChange={(e) => setQuantidade(Number(e.target.value))}
                            sx={{ width: 100 }}
                        />
                        <Button 
                            onClick={handleAddItem} 
                            variant="outlined" 
                            sx={{ minWidth: 56, height: 56 }}
                        >
                            <AddIcon />
                        </Button>
                    </Box>

                    {/* ATUALIZADO: Exibe 'Estoque Disponível' */}
                    <Box sx={{ mb: 2, minHeight: '20px', textAlign: 'center' }}>
                        {stockLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            availableStock !== null && (
                                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                    Estoque Disponível: {availableStock}
                                </Typography>
                            )
                        )}
                    </Box>
                    
                    <List dense>
                        {itens.map(item => (
                            <ListItem key={item.produto_id}>
                                <ListItemText
                                    primary={item.nome}
                                    secondary={`Quantidade: ${item.quantidade}`}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleRemoveItem(item.produto_id!)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">
                    Processar Cotação
                </Button>
            </DialogActions>
        </Dialog>
    );
};