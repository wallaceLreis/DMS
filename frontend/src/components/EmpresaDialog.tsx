// frontend/src/components/EmpresaDialog.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import type { Empresa } from '../types';

// --- FUNÇÕES DE MÁSCARA ---
const formatCNPJ = (value: string) => {
    if (!value) return '';
    const cnpj = value.replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').substring(0, 18);
};

const formatCEP = (value: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d{3})/, '$1-$2').substring(0, 9);
};

// NOVA FUNÇÃO DE MÁSCARA PARA TELEFONE
const formatPhone = (value: string) => {
    if (!value) return '';
    const phone = value.replace(/\D/g, '');
    if (phone.length > 10) {
        return phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
    }
    return phone.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').substring(0, 14);
};

interface EmpresaDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Empresa>, empresaId?: number) => void;
    empresa: Empresa | null;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number; }) {
    const { children, value, index, ...other } = props;
    return <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>;
}

// ATUALIZADO: Adicionado 'telefone'
const initialFormData: Partial<Empresa> = {
    nome_fantasia: '', razao_social: '', cnpj: '', email: '', telefone: '',
    cep: '', logouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
};

export const EmpresaDialog = ({ open, onClose, onSave, empresa }: EmpresaDialogProps) => {
    const [formData, setFormData] = useState<Partial<Empresa>>(initialFormData);
    const [tabIndex, setTabIndex] = useState(0);
    const [cepLoading, setCepLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData(empresa || initialFormData);
            setTabIndex(0);
        }
    }, [empresa, open]);

    // ATUALIZADO: Inclui 'telefone' na lógica de máscara
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'cnpj' || name === 'cep' || name === 'telefone') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);
    const handleSave = () => onSave(formData, formData.empresa_id);

    const handleCepBlur = async () => {
        const cep = formData.cep?.replace(/\D/g, '');
        if (cep?.length !== 8) return;
        
        setCepLoading(true);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.data.erro) {
                setFormData(prev => ({
                    ...prev,
                    logouro: response.data.logradouro,
                    bairro: response.data.bairro,
                    cidade: response.data.localidade,
                    uf: response.data.uf,
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setCepLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{formData.empresa_id ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange}><Tab label="Dados Gerais" /><Tab label="Endereço" /></Tabs>
                </Box>
                <TabPanel value={tabIndex} index={0}>
                    <TextField name="nome_fantasia" label="Nome Fantasia *" value={formData.nome_fantasia || ''} onChange={handleChange} fullWidth margin="normal" required />
                    <TextField name="razao_social" label="Razão Social *" value={formData.razao_social || ''} onChange={handleChange} fullWidth margin="normal" required />
                    <TextField name="cnpj" label="CNPJ *" value={formatCNPJ(formData.cnpj || '')} onChange={handleChange} margin="normal" required inputProps={{ maxLength: 18 }} />
                    <TextField name="email" label="E-mail *" type="email" value={formData.email || ''} onChange={handleChange} margin="normal" sx={{ ml: 2, mr: 2 }} required />
                    {/* NOVO CAMPO DE TELEFONE */}
                    <TextField name="telefone" label="Telefone" value={formatPhone(formData.telefone || '')} onChange={handleChange} margin="normal" required inputProps={{ maxLength: 15 }} />
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <TextField name="cep" label="CEP *" value={formatCEP(formData.cep || '')} onChange={handleChange} onBlur={handleCepBlur} margin="normal" required inputProps={{ maxLength: 9 }} InputProps={{ endAdornment: cepLoading && <CircularProgress size={20} /> }} />
                    <TextField name="logouro" label="Logradouro *" value={formData.logouro || ''} onChange={handleChange} fullWidth margin="normal" required />
                    <TextField name="numero" label="Número *" value={formData.numero || ''} onChange={handleChange} margin="normal" sx={{ mr: 2 }} required />
                    <TextField name="complemento" label="Complemento" value={formData.complemento || ''} onChange={handleChange} margin="normal" />
                    <TextField name="bairro" label="Bairro *" value={formData.bairro || ''} onChange={handleChange} fullWidth margin="normal" required />
                    <TextField name="cidade" label="Cidade *" value={formData.cidade || ''} onChange={handleChange} margin="normal" sx={{ mr: 2 }} required />
                    <TextField name="uf" label="UF *" value={formData.uf || ''} onChange={handleChange} margin="normal" sx={{width: '100px'}} required />
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};