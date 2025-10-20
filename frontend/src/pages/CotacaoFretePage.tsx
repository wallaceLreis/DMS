// frontend/src/pages/CotacaoFretePage.tsx

import { useEffect, useState } from 'react';
import api from '../services/api';
import { Box, Typography, Button, CircularProgress, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid/models';
import AddIcon from '@mui/icons-material/Add';
import { CotacaoDialog } from '../components/CotacaoDialog';
import { CotacaoResultsDialog } from '../components/CotacaoResultsDialog';
import { EtiquetaInfoDialog } from '../components/EtiquetaInfoDialog';

interface Cotacao {
    cotacao_id: number;
    empresa_origem: string;
    destinatario: string;
    destinatario_sobrenome: string;
    cep_destino: string;
    data_criacao: string;
    status: 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO' | 'FINALIZADO';
}

export const CotacaoFretePage = () => {
    const [cotacoes, setCotacoes] = useState<Cotacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isResultsOpen, setResultsOpen] = useState(false);
    const [selectedCotacaoId, setSelectedCotacaoId] = useState<number | null>(null);
    const [isInfoOpen, setInfoOpen] = useState(false);
    const [selectedCotacao, setSelectedCotacao] = useState<Cotacao | null>(null);

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
            destinatario_sobrenome: data.destinatario_sobrenome,
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

    const handleRowDoubleClick = (params: GridRowParams<Cotacao>) => {
        if (params.row.status === 'CONCLUIDO') {
            setSelectedCotacaoId(params.row.cotacao_id);
            setResultsOpen(true);
        } else if (params.row.status === 'FINALIZADO') {
            setSelectedCotacao(params.row);
            setInfoOpen(true);
        }
    };

    const columns: GridColDef[] = [
        { field: 'cotacao_id', headerName: 'ID', width: 90 },
        { 
            field: 'destinatario', 
            headerName: 'Destinatário', 
            flex: 1,
            // CORREÇÃO AQUI: 'value' foi substituído por '_'
            valueGetter: (_, row) => `${row.destinatario || ''} ${row.destinatario_sobrenome || ''}`
        },
        { field: 'empresa_origem', headerName: 'Origem', flex: 1 },
        { field: 'cep_destino', headerName: 'CEP Destino', width: 150 },
        { field: 'data_criacao', headerName: 'Data', width: 180, type: 'dateTime', valueFormatter: (value) => value ? new Date(value).toLocaleString('pt-BR') : '' },
        { field: 'status', headerName: 'Status', width: 150, renderCell: (params) => {
            if (params.value === 'PROCESSANDO') return <CircularProgress size={20} />;
            let color: "success" | "error" | "warning" | "default" = 'default';
            if (params.value === 'CONCLUIDO') color = 'success';
            if (params.value === 'ERRO') color = 'error';
            if (params.value === 'FINALIZADO') color = 'warning';
            
            return <Chip label={params.value} color={color} size="small" />;
        }},
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
                <DataGrid 
                    rows={cotacoes} 
                    columns={columns} 
                    loading={loading} 
                    getRowId={(row: Cotacao) => row.cotacao_id}
                    onRowDoubleClick={handleRowDoubleClick}
                    initialState={{
                        sorting: {
                          sortModel: [{ field: 'cotacao_id', sort: 'desc' }],
                        },
                    }}
                />
            </Box>
            <CotacaoDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
            <CotacaoResultsDialog 
                open={isResultsOpen}
                onClose={() => {
                    setResultsOpen(false);
                    fetchCotacoes();
                }}
                cotacaoId={selectedCotacaoId}
            />
            <EtiquetaInfoDialog
                open={isInfoOpen}
                onClose={() => setInfoOpen(false)}
                cotacao={selectedCotacao}
            />
        </Box>
    );
};