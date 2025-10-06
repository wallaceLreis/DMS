import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import type { Produto } from '../types';

interface ProdutoDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: FormData, produtoId?: number) => void;
    produto: Produto | null;
}

const initialFormData: Partial<Produto> = { 
    nome: '', ean: '', altura: '', largura: '', profundidade: '', peso: ''
};

export const ProdutoDialog = ({ open, onClose, onSave, produto }: ProdutoDialogProps) => {
    const [formData, setFormData] = useState<Partial<Produto>>(initialFormData);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (open) {
            setFormData(produto || initialFormData);
            setSelectedFile(null);
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
                <TextField name="nome" label="Nome *" value={formData.nome || ''} onChange={handleChange} fullWidth margin="normal" />
                <TextField name="ean" label="EAN13/DUN14 *" value={formData.ean || ''} onChange={handleChange} fullWidth margin="normal" />
                <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                    Carregar Imagem
                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </Button>
                {selectedFile && <Typography variant="caption" sx={{ml: 2}}>{selectedFile.name}</Typography>}
                
                <Typography variant="h6" sx={{mt: 3, mb: 1}}>Dimensões da Unidade</Typography>
                <TextField name="altura" label="Altura (CM) *" type="number" value={formData.altura || ''} onChange={handleChange} margin="normal" sx={{mr: 1}}/>
                <TextField name="largura" label="Largura (CM) *" type="number" value={formData.largura || ''} onChange={handleChange} margin="normal" sx={{mr: 1}}/>
                <TextField name="profundidade" label="Profundidade (CM) *" type="number" value={formData.profundidade || ''} onChange={handleChange} margin="normal" sx={{mr: 1}}/>
                <TextField name="peso" label="Peso (KG) *" type="number" value={formData.peso || ''} onChange={handleChange} margin="normal"/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};