import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import type { Empresa } from '../types'; // <-- Importação do tipo central

// A interface local 'Empresa' foi removida daqui

interface EmpresaDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Partial<Empresa>, empresaId?: number) => void;
    empresa: Empresa | null;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number; }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const initialFormData: Partial<Empresa> = {
    nome_fantasia: '', razao_social: '', cnpj: ''
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
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
                    logradouro: response.data.logradouro,
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
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Dados Gerais" />
                        <Tab label="Endereço" />
                    </Tabs>
                </Box>
                <TabPanel value={tabIndex} index={0}>
                    <TextField name="nome_fantasia" label="Nome Fantasia *" value={formData.nome_fantasia || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="razao_social" label="Razão Social *" value={formData.razao_social || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="cnpj" label="CNPJ *" value={formData.cnpj || ''} onChange={handleChange} margin="normal" />
                    <TextField name="email" label="E-mail" type="email" value={formData.email || ''} onChange={handleChange} margin="normal" sx={{ ml: 2 }}/>
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <TextField name="cep" label="CEP" value={formData.cep || ''} onChange={handleChange} onBlur={handleCepBlur} margin="normal" InputProps={{ endAdornment: cepLoading && <CircularProgress size={20} /> }}/>
                    <TextField name="logradouro" label="Logradouro" value={formData.logradouro || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="numero" label="Número" value={formData.numero || ''} onChange={handleChange} margin="normal" sx={{ mr: 2 }}/>
                    <TextField name="complemento" label="Complemento" value={formData.complemento || ''} onChange={handleChange} margin="normal" />
                    <TextField name="bairro" label="Bairro" value={formData.bairro || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="cidade" label="Cidade" value={formData.cidade || ''} onChange={handleChange} margin="normal" sx={{ mr: 2 }}/>
                    <TextField name="uf" label="UF" value={formData.uf || ''} onChange={handleChange} margin="normal" sx={{width: '100px'}}/>
                </TabPanel>
            </DialogContent>
            <DialogActions> <Button onClick={onClose}>Cancelar</Button> <Button onClick={handleSave} variant="contained">Salvar</Button> </DialogActions>
        </Dialog>
    );
};