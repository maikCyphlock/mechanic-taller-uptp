import { type NextApiRequest, type NextApiResponse } from "next";
import { getOdooClient } from "~/lib/odoo/odoo-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('[Proxy:clients]', req.method, 'Body:', JSON.stringify(req.body));

    const odoo = getOdooClient();

    try {
        if (req.method === "GET") {
            const response = await odoo.get("/mecatec/api/clients");
            console.log('[Proxy:clients] GET response:', JSON.stringify(response));
            return res.status(200).json(response);
        }

        if (req.method === "POST") {
            console.log('[Proxy:clients] Sending to Odoo:', JSON.stringify(req.body));
            const response = await odoo.post("/mecatec/api/clients", req.body);
            console.log('[Proxy:clients] POST response:', JSON.stringify(response));

            // If response has error status, return it properly
            if (response.status === 'error') {
                return res.status(400).json(response);
            }
            return res.status(201).json(response);
        }

        return res.status(405).json({ message: "Method not allowed" });
    } catch (error: any) {
        console.error("[Proxy:clients] Error:", error);
        return res.status(500).json({ status: 'error', message: error.message || "Internal Server Error" });
    }
}
