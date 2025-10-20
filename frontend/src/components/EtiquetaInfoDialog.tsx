// frontend/src/components/EtiquetaInfoDialog.tsx

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

// A função 'maskEmail' que estava aqui foi removida.

interface DialogProps {
    open: boolean;
    onClose: () => void;
    cotacao: any | null;
}

export const EtiquetaInfoDialog = ({ open, onClose, cotacao }: DialogProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleReprint = async () => {
        if (!cotacao) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/frete/reimprimir-etiqueta/${cotacao.cotacao_id}`);
            window.open(response.data.url, '_blank');
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao gerar link da etiqueta.");
        } finally {
            setLoading(false);
        }
    };
    
    if (!cotacao) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalhes da Entrega - Cotação #{cotacao.cotacao_id}</DialogTitle>
            <DialogContent>
                <Box>
                    <Typography variant="h6">Destinatário</Typography>
                    <Typography><strong>Nome:</strong> {cotacao.destinatario} {cotacao.destinatario_sobrenome}</Typography>
                    <Typography><strong>CEP:</strong> {cotacao.cep_destino}</Typography>
                    <Typography><strong>Origem:</strong> {cotacao.empresa_origem}</Typography>
                </Box>
                <Box mt={2}>
                    <Typography variant="h6">Status</Typography>
                    <Typography>Etiqueta gerada com sucesso.</Typography>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
                <Button onClick={handleReprint} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Reimprimir Etiqueta'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};