// frontend/src/components/EtiquetaForm.tsx

import { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

interface FormProps {
    cotacaoData: any;
    selectedService: any;
    onSuccess: (url: string) => void;
}

interface Endereco {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    complement: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
}

const initialFormState: Endereco = {
    name: '', phone: '', email: '', document: '', address: '', complement: '',
    number: '', district: '', city: '', state_abbr: '', country_id: 'BR', postal_code: ''
};

export const EtiquetaForm = ({ cotacaoData, selectedService, onSuccess }: FormProps) => {
    const [from, setFrom] = useState<Endereco>(initialFormState);
    const [to, setTo] = useState<Endereco>(initialFormState);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const empresaRes = await api.get(`/empresas/${cotacaoData.empresa_origem_id}`);
                const empresa = empresaRes.data;
                setFrom({
                    name: empresa.razao_social,
                    phone: '',
                    email: empresa.email,
                    document: empresa.cnpj.replace(/\D/g, ''),
                    address: empresa.logouro,
                    complement: empresa.complemento,
                    number: empresa.numero,
                    district: empresa.bairro,
                    city: empresa.cidade,
                    state_abbr: empresa.uf,
                    country_id: 'BR',
                    postal_code: empresa.cep.replace(/\D/g, '')
                });

                setTo(prev => ({ ...prev, name: cotacaoData.destinatario, postal_code: cotacaoData.cep_destino.replace(/\D/g, '') }));
            } catch (err) {
                setError("Erro ao carregar dados da empresa de origem.");
            } finally {
                setLoading(false);
            }
        };
        if (cotacaoData) fetchInitialData();
    }, [cotacaoData]);

    const handleChange = (setter: React.Dispatch<React.SetStateAction<Endereco>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                cotacao_id: cotacaoData.cotacao_id,
                resultado_id: selectedService.resultado_id,
                from,
                to
            };
            const response = await api.post('/frete/gerar-etiqueta', payload);
            onSuccess(response.data.url);
        } catch (err: any) {
            setError(err.response?.data?.message || "Ocorreu um erro ao gerar a etiqueta.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box component="form" noValidate autoComplete="off">
            <Typography variant="h6">Serviço: {selectedService.transportadora} - {selectedService.servico}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mt: 2 }}>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Remetente (Origem)</Typography>
                    <TextField label="Nome/Razão Social *" name="name" value={from.name} onChange={handleChange(setFrom)} fullWidth margin="dense" required />
                    <TextField label="CPF/CNPJ *" name="document" value={from.document} onChange={handleChange(setFrom)} fullWidth margin="dense" required />
                    <TextField label="Email *" name="email" value={from.email} onChange={handleChange(setFrom)} fullWidth margin="dense" required />
                    <TextField label="Telefone *" name="phone" value={from.phone} onChange={handleChange(setFrom)} fullWidth margin="dense" required />
                </Box>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Destinatário (Destino)</Typography>
                    <TextField label="Nome/Razão Social *" name="name" value={to.name} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                    <TextField label="CPF/CNPJ" name="document" value={to.document} onChange={handleChange(setTo)} fullWidth margin="dense" />
                    <TextField label="Email *" name="email" value={to.email} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                    <TextField label="Telefone" name="phone" value={to.phone} onChange={handleChange(setTo)} fullWidth margin="dense" />
                    <TextField label="Endereço *" name="address" value={to.address} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                    <TextField label="Número *" name="number" value={to.number} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                    <TextField label="Complemento" name="complement" value={to.complement} onChange={handleChange(setTo)} fullWidth margin="dense" />
                    <TextField label="Bairro *" name="district" value={to.district} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                </Box>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : 'Gerar e Imprimir Etiqueta'}
                </Button>
            </Box>
        </Box>
    );
};