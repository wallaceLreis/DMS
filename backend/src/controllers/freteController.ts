import { Request, Response } from 'express';
import axios from 'axios';

export const calcularFrete = async (req: Request, res: Response) => {
    // Pega os dados enviados pelo nosso frontend
    const { from_postal_code, to_postal_code, weight, width, height, length, insurance_value } = req.body;

    // Monta o corpo da requisição no formato que a API do Melhor Envio espera
    const requestBody = {
        from: { postal_code: from_postal_code },
        to: { postal_code: to_postal_code },
        products: [
            {
                width: Number(width),
                height: Number(height),
                length: Number(length),
                weight: Number(weight),
                insurance_value: Number(insurance_value),
                quantity: 1
            }
        ],
        services: "1,2,3,4,12,15,16,17" // Lista de serviços que queremos cotar
    };

    const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Aplicação roberto.casali@nicocereais.com.br' // Use seu e-mail
    };

    try {
        const response = await axios.post(
            'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
            requestBody,
            { headers }
        );
        
        // Filtra a resposta para retornar apenas as cotações que não tiveram erro
        const cotacoesValidas = response.data.filter((cotacao: any) => !cotacao.error);

        res.json(cotacoesValidas);
    } catch (error: any) {
        console.error("Erro ao calcular frete:", error.response?.data || error.message);
        res.status(500).json({ message: "Erro ao se comunicar com a API de fretes." });
    }
};