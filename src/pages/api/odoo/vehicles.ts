import { type NextApiRequest, type NextApiResponse } from "next";
import { getOdooClient } from "~/lib/odoo/odoo-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const odoo = getOdooClient();

    try {
        if (req.method === "GET") {
            const response = await odoo.get("/mecatec/api/vehicle");
            return res.status(200).json(response);
        }

        if (req.method === "POST") {
            const response = await odoo.post("/mecatec/api/vehicle", req.body);
            return res.status(response.status === "success" ? 201 : 400).json(response);
        }

        return res.status(405).json({ message: "Method not allowed" });
    } catch (error: any) {
        console.error("Error in vehicles proxy:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}
