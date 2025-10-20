// frontend/src/components/EtiquetaForm.tsx

import { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import api from '../services/api';

const formatPhone = (value: string) => {
    if (!value) return '';
    const phone = value.replace(/\D/g, '');
    if (phone.length > 10) {
        return phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
    }
    return phone.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').substring(0, 14);
};

const formatCPF_CNPJ = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    if (rawValue.length <= 11) {
        return rawValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        return rawValue
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
};

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
            setLoading(true);
            setError(null);
            try {
                const empresaRes = await api.get(`/empresas/${cotacaoData.empresa_origem_id}`);
                const empresa = empresaRes.data;
                setFrom({
                    name: empresa.razao_social,
                    phone: empresa.telefone?.replace(/\D/g, '') || '',
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

                const destCep = cotacaoData.cep_destino.replace(/\D/g, '');
                const nomeCompleto = `${cotacaoData.destinatario} ${cotacaoData.destinatario_sobrenome}`;
                setTo(prev => ({ ...prev, name: nomeCompleto, postal_code: destCep }));
                
                if (destCep.length === 8) {
                    const viaCepRes = await axios.get(`https://viacep.com.br/ws/${destCep}/json/`);
                    if (!viaCepRes.data.erro) {
                        const { logradouro, bairro, localidade, uf } = viaCepRes.data;
                        setTo(prev => ({
                            ...prev,
                            address: logradouro,
                            district: bairro,
                            city: localidade,
                            state_abbr: uf
                        }));
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar dados iniciais:", err);
                setError("Erro ao carregar dados da empresa de origem ou do destinatário.");
            } finally {
                setLoading(false);
            }
        };
        if (cotacaoData) fetchInitialData();
    }, [cotacaoData]);

    const handleChange = (setter: React.Dispatch<React.SetStateAction<Endereco>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone' || name === 'document' || name === 'postal_code') {
            setter(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
        } else {
            setter(prev => ({ ...prev, [name]: e.target.value }));
        }
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
            setError(err.response?.data?.message || err.response?.data?.error || "Ocorreu um erro ao gerar a etiqueta.");
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
                    <TextField label="CPF/CNPJ *" name="document" value={formatCPF_CNPJ(from.document)} onChange={handleChange(setFrom)} fullWidth margin="dense" required inputProps={{ maxLength: 18 }} />
                    <TextField label="Email *" name="email" value={from.email} onChange={handleChange(setFrom)} fullWidth margin="dense" required />
                    <TextField label="Telefone *" name="phone" value={formatPhone(from.phone)} onChange={handleChange(setFrom)} fullWidth margin="dense" required inputProps={{maxLength: 15}} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Destinatário (Destino)</Typography>
                    <TextField label="Nome Completo *" name="name" value={to.name} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                    <TextField label="CPF/CNPJ" name="document" value={formatCPF_CNPJ(to.document)} onChange={handleChange(setTo)} fullWidth margin="dense" inputProps={{ maxLength: 18 }} />
                    <TextField label="Email *" name="email" value={to.email} onChange={handleChange(setTo)} fullWidth margin="dense" required />
                    <TextField label="Telefone" name="phone" value={formatPhone(to.phone)} onChange={handleChange(setTo)} fullWidth margin="dense" inputProps={{maxLength: 15}} />
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