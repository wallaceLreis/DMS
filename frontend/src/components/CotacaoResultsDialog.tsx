import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid/models';
import api from '../services/api';

interface Resultado {
    resultado_id: number;
    transportadora: string;
    servico: string;
    preco: string;
    prazo_entrega: number;
    url_logo: string;
}

interface CotacaoData {
    resultados: Resultado[];
}

interface DialogProps {
    open: boolean;
    onClose: () => void;
    cotacaoId: number | null;
}

export const CotacaoResultsDialog = ({ open, onClose, cotacaoId }: DialogProps) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CotacaoData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && cotacaoId) {
            setLoading(true);
            setData(null);
            setError(null);
            
            api.get(`/frete/cotacoes/${cotacaoId}`)
                .then(res => {
                    setData(res.data);
                })
                .catch(err => {
                    console.error("Erro ao buscar resultados da cotação:", err);
                    setError("Não foi possível carregar os detalhes da cotação. Verifique o console para mais detalhes.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, cotacaoId]);

    const columns: GridColDef[] = [
        { 
            field: 'transportadora', 
            headerName: 'Transportadora', 
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={params.row.url_logo} sx={{ mr: 1.5, width: 24, height: 24 }} variant="square" />
                    {params.value}
                </Box>
            )
        },
        { field: 'servico', headerName: 'Serviço', flex: 1 },
        { 
            field: 'preco', 
            headerName: 'Preço', 
            width: 150, 
            type: 'number',
            valueFormatter: (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        { field: 'prazo_entrega', headerName: 'Prazo (dias)', width: 150, type: 'number' },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Resultados da Cotação #{cotacaoId}</DialogTitle>
            <DialogContent>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                        <CircularProgress />
                    </Box>
                )}
                
                {!loading && error && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}

                {!loading && data && (
                    <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                        <DataGrid
                            rows={data.resultados}
                            columns={columns}
                            getRowId={(row) => row.resultado_id}
                            density="compact"
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};