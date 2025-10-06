import { useEffect, useState } from 'react';
import api from '../services/api';
import { Box, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid/models';
import AddIcon from '@mui/icons-material/Add';
import { CotacaoDialog } from '../components/CotacaoDialog';

interface Cotacao {
    cotacao_id: number;
    empresa_origem: string;
    destinatario: string;
    cep_destino: string;
    data_criacao: string;
    status: 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';
}

export const CotacaoFretePage = () => {
    const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setDialogOpen] = useState(false);

    const fetchCotacoes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/frete/cotacoes');
            setCotacoes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCotacoes(); }, []);
    
    const handleSave = async (data: any) => {
        setDialogOpen(false);
        const tempCotacao: Cotacao = { 
            status: 'PROCESSANDO', 
            data_criacao: new Date().toISOString(), 
            cotacao_id: Date.now(),
            empresa_origem: 'Aguardando...',
            destinatario: data.destinatario,
            cep_destino: data.cep_destino,
        };
        setCotacoes(prev => [tempCotacao, ...prev]);

        try {
            await api.post('/frete/cotacoes', data);
        } catch (error) {
            console.error("Falha ao processar cotação:", error);
            alert("Falha ao processar cotação.");
        } finally {
            fetchCotacoes();
        }
    };

    const columns: GridColDef[] = [
        { field: 'cotacao_id', headerName: 'ID', width: 90 },
        { field: 'destinatario', headerName: 'Destinatário', flex: 1 },
        { field: 'empresa_origem', headerName: 'Origem', flex: 1 },
        { field: 'cep_destino', headerName: 'CEP Destino', width: 150 },
        { field: 'data_criacao', headerName: 'Data', width: 180, type: 'dateTime', valueFormatter: (value) => value ? new Date(value).toLocaleString('pt-BR') : '' },
        { field: 'status', headerName: 'Status', width: 150, renderCell: (params) => (
            params.value === 'PROCESSANDO' 
                ? <CircularProgress size={20} /> 
                : <Chip label={params.value} color={params.value === 'CONCLUIDO' ? 'success' : 'error'} />
        )},
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Cotações de Frete</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                    Nova Cotação
                </Button>
            </Box>
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={cotacoes} columns={columns} loading={loading} getRowId={(row: Cotacao) => row.cotacao_id} />
            </Box>
            <CotacaoDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
        </Box>
    );
};