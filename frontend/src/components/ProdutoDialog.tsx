import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Box, Typography } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import type { Produto } from '../types';

interface ProdutoDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: FormData, produtoId?: number) => void;
    produto: Produto | null;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number; }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export const ProdutoDialog = ({ open, onClose, onSave, produto }: ProdutoDialogProps) => {
    const [formData, setFormData] = useState<Partial<Produto>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (open) {
            setFormData(produto || { nome: '', ean: '', altura: '', largura: '', profundidade: '', peso: '' });
            setSelectedFile(null);
            setTabIndex(0);
        }
    }, [produto, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleSave = () => {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if(formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key] as string);
            }
        });
        if (selectedFile) {
            data.append('imagem', selectedFile);
        }
        onSave(data, formData.produto_id);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{formData.produto_id ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Geral" />
                        <Tab label="Dimensões" />
                    </Tabs>
                </Box>
                <TabPanel value={tabIndex} index={0}>
                    <TextField name="nome" label="Nome *" value={formData.nome || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="ean" label="EAN13/DUN14 *" value={formData.ean || ''} onChange={handleChange} fullWidth margin="normal" />
                    <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                        Carregar Imagem
                        <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                    </Button>
                    {selectedFile && <Typography variant="caption" sx={{ml: 2}}>{selectedFile.name}</Typography>}
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <TextField name="altura" label="Altura (CM) *" type="number" value={formData.altura || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="largura" label="Largura (CM) *" type="number" value={formData.largura || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="profundidade" label="Profundidade (CM) *" type="number" value={formData.profundidade || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="peso" label="Peso (KG) *" type="number" value={formData.peso || ''} onChange={handleChange} fullWidth margin="normal" />
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};