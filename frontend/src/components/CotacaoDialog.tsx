import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import type { Produto, Empresa } from '../types';

interface CotacaoDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

// A interface Item agora garante que produto_id é um número
interface Item extends Produto {
    produto_id: number;
    quantidade: number;
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

    useEffect(() => {
        if(open) {
            api.get('/empresas').then(res => setEmpresas(res.data));
            api.get('/produtos').then(res => setProdutos(res.data));
            setItens([]);
            setSelectedEmpresa(null);
            setCepDestino('');
            setDestinatario('');
            setSelectedProduto(null);
            setQuantidade(1);
        }
    }, [open]);

    const handleAddItem = () => {
        if (!selectedProduto || !selectedProduto.produto_id || quantidade <= 0) return;
        if (itens.some(item => item.produto_id === selectedProduto.produto_id)) {
            alert("Este produto já foi adicionado à cotação.");
            return;
        }
        // Garante que o objeto adicionado corresponde à interface Item
        const newItem: Item = {
            ...selectedProduto,
            produto_id: selectedProduto.produto_id,
            quantidade: quantidade
        };
        setItens([...itens, newItem]);
        setSelectedProduto(null);
        setQuantidade(1);
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
            cep_destino: cepDestino,
            destinatario: destinatario,
            itens: itens.map(({produto_id, quantidade}) => ({produto_id, quantidade}))
        };
        onSave(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Nova Cotação de Frete</DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">1. Dados do Envio</Typography>
                    <Autocomplete
                        options={empresas}
                        getOptionLabel={(opt) => opt.nome_fantasia || ''}
                        value={selectedEmpresa}
                        onChange={(_e, val) => setSelectedEmpresa(val)}
                        renderInput={(params) => <TextField {...params} label="Empresa de Origem *" margin="normal" />}
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
                        value={cepDestino}
                        onChange={(e) => setCepDestino(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </Box>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6">2. Itens da Cotação</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Autocomplete
                            options={produtos}
                            getOptionLabel={(opt) => opt.nome || ''}
                            value={selectedProduto}
                            onChange={(_e, val) => setSelectedProduto(val)}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Adicionar Produto" />}
                        />
                        <TextField
                            label="Qtd."
                            type="number"
                            value={quantidade}
                            onChange={(e) => setQuantidade(Number(e.target.value))}
                            sx={{width: 100}}
                        />
                        <Button onClick={handleAddItem} variant="outlined"><AddIcon/></Button>
                    </Box>
                    <List dense>
                        {itens.map(item => (
                            <ListItem key={item.produto_id}>
                                <ListItemText primary={item.nome} secondary={`Quantidade: ${item.quantidade}`} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleRemoveItem(item.produto_id!)}><DeleteIcon /></IconButton>
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