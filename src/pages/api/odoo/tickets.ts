import type { NextApiRequest, NextApiResponse } from 'next';
import { OdooClient } from '~/lib/odoo/odoo-client';
import { getOdooCredentials } from '~/lib/odoo/odoo.config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const odoo = new OdooClient(getOdooCredentials());

    try {
        if (req.method === 'GET') {
            const response = await odoo.get('/mecatec/api/maintenance');
            res.status(200).json(response);
        } else if (req.method === 'POST') {
            const body = req.body; // Expect JSON body
            const response = await odoo.post('/mecatec/api/maintenance', body);
            res.status(response.status === 'success' ? 201 : 400).json(response);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error: any) {
        console.error('[API Proxy] Error proxying to Odoo:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}
