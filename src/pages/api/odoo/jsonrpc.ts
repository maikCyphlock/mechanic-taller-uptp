import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";

const ODOO_URL = process.env.ODOO_URL || "http://localhost:8069";
const ODOO_DB = process.env.ODOO_DB || "odoo";
const ODOO_USER = process.env.ODOO_USERNAME || "admin";
const ODOO_PASS = process.env.ODOO_PASSWORD || "admin";

let sessionId: string | null = null;

async function authenticate(): Promise<string> {
    const res = await fetch(`${ODOO_URL}/web/session/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: {
                db: ODOO_DB,
                login: ODOO_USER,
                password: ODOO_PASS,
            },
            id: 1,
        }),
    });

    const cookies = res.headers.get("set-cookie");
    const match = cookies?.match(/session_id=([^;]+)/);
    if (match?.[1]) {
        sessionId = match[1];
        return sessionId;
    }
    throw new Error("Failed to authenticate with Odoo");
}

async function callOdoo(model: string, method: string, args: any[], kwargs: any = {}) {
    if (!sessionId) {
        await authenticate();
    }

    const res = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionId}`,
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: {
                model,
                method,
                args,
                kwargs,
            },
            id: 2,
        }),
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.data?.message || data.error.message || "Odoo error");
    }
    return data.result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, data = {} } = req.body;
    console.log(`[JSONRPC] ${new Date().toISOString()} Action: ${action}`);
    console.log(`[JSONRPC] Data:`, JSON.stringify(data, null, 2));

    try {
        let result;

        switch (action) {
            case "get_clients":
                result = await callOdoo("res.partner", "search_read", [
                    [["is_mecatec_client", "=", true]],
                    ["id", "name", "email", "phone", "vat", "street", "city", "comment"]
                ]);
                break;

            case "get_vehicles":
                const vehicles = await callOdoo("fleet.vehicle", "search_read", [
                    [],
                    ["id", "name", "license_plate", "brand_id", "model_id", "owner_id", "vin_sn", "model_year", "odometer", "transmission"]
                ]);
                result = vehicles.map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    license_plate: v.license_plate,
                    brand: Array.isArray(v.brand_id) ? v.brand_id[1] : "",
                    model: Array.isArray(v.model_id) ? v.model_id[1] : "",
                    owner: Array.isArray(v.owner_id) ? { id: v.owner_id[0], name: v.owner_id[1] } : null,
                    vin_sn: v.vin_sn,
                    model_year: v.model_year,
                    odometer: Array.isArray(v.odometer) ? v.odometer[1] : v.odometer,
                    transmission: v.transmission,
                }));
                break;

            case "get_tickets":
                // Access control: admins/mechanics see all, clients see only their own
                const session = await getServerSession(req, res, authOptions);
                const userRole = session?.user?.role as string;
                let ticketDomain: any[] = [];

                if (!session) {
                    result = [];
                    break;
                }

                if (["client", "user"].includes(userRole)) {
                    // Find partner by email
                    const partners = await callOdoo("res.partner", "search_read", [
                        [["email", "=", session.user.email]],
                        ["id"]
                    ]);

                    if (partners && partners.length > 0) {
                        const partnerId = partners[0].id;
                        ticketDomain = [["client_id", "=", partnerId]];
                    } else {
                        // User not found in Odoo, return empty
                        result = [];
                        break;
                    }
                }

                result = await callOdoo("maintenance.request", "search_read", [
                    ticketDomain,
                    ["id", "name", "description", "request_date", "stage_id", "user_id", "client_id", "vehicle_id"]
                ]);
                break;

            case "create_client":
                // Get or create client
                let existingClientId = await callOdoo("res.partner", "search", [
                    ["|", ["vat", "=", data.cedula], ["name", "=", data.name]]
                ]);

                if (existingClientId.length > 0) {
                    // Update existing if needed? For now just return
                    result = existingClientId[0];
                } else {
                    result = await callOdoo("res.partner", "create", [{
                        name: data.name,
                        phone: data.phone,
                        cedula: data.cedula,
                        vat: data.cedula,
                        is_mecatec_client: true,
                    }]);
                }
                break;

            case "update_client":
                result = await callOdoo("res.partner", "write", [
                    [data.id],
                    {
                        name: data.name,
                        phone: data.phone,
                        email: data.email,
                        vat: data.cedula,
                    }
                ]);
                break;

            case "create_vehicle":
                // Resolve Model ID
                let modelId = await callOdoo("fleet.vehicle.model", "search", [[["name", "=", data.model]]]);
                if (!modelId.length) {
                    let brandId = await callOdoo("fleet.vehicle.model.brand", "search", [[["name", "=", data.brand]]]);
                    if (!brandId.length) {
                        brandId = [await callOdoo("fleet.vehicle.model.brand", "create", [{ name: data.brand }])];
                    }
                    modelId = [await callOdoo("fleet.vehicle.model", "create", [{
                        name: data.model,
                        brand_id: brandId[0],
                    }])];
                }

                // Get or create vehicle
                let existingVehicleId = await callOdoo("fleet.vehicle", "search", [[["license_plate", "=", data.plate]]]);
                if (existingVehicleId.length > 0) {
                    result = existingVehicleId[0];
                    // Optionally update owner?
                } else {
                    result = await callOdoo("fleet.vehicle", "create", [{
                        license_plate: data.plate,
                        model_id: Number(modelId[0]),
                        owner_id: Number(data.owner_id),
                    }]);
                }
                break;

            case "create_ticket":
                const clientId = Number(data.client_id);
                const vehicleId = Number(data.vehicle_id);
                console.log("[JSONRPC] Creating ticket - Client ID:", clientId, "Vehicle ID:", vehicleId);

                result = await callOdoo("maintenance.request", "create", [{
                    name: data.title,
                    description: data.description,
                    request_date: data.date,
                    client_id: clientId,
                    vehicle_id: vehicleId,
                }]);
                break;

            case "get_brands":
                result = await callOdoo("fleet.vehicle.model.brand", "search_read", [[], ["name"]]);
                break;

            case "get_models":
                const domain = data?.brand ? [["brand_id.name", "=", data.brand]] : [];
                result = await callOdoo("fleet.vehicle.model", "search_read", [domain, ["name", "brand_id"]]);
                break;

            case "update_ticket":
                result = await callOdoo("maintenance.request", "write", [
                    [data.id],
                    {
                        name: data.title,
                        description: data.description,
                    }
                ]);
                break;

            case "delete_ticket":
                result = await callOdoo("maintenance.request", "unlink", [[data.id]]);
                break;

            case "get_client_details":
                result = await callOdoo("res.partner", "read", [
                    [data.id],
                    ["id", "name", "email", "phone", "vat", "street", "city", "comment"]
                ]);
                result = result[0];
                break;

            case "get_vehicle_details":
                const vehicle = await callOdoo("fleet.vehicle", "read", [
                    [data.id],
                    ["id", "name", "license_plate", "brand_id", "model_id", "owner_id", "vin_sn", "model_year", "odometer", "transmission"]
                ]);
                const v = vehicle[0];
                result = {
                    ...v,
                    odometer: Array.isArray(v.odometer) ? v.odometer[1] : v.odometer,
                    brand: Array.isArray(v.brand_id) ? v.brand_id[1] : "",
                    model: Array.isArray(v.model_id) ? v.model_id[1] : "",
                    owner: Array.isArray(v.owner_id) ? { id: v.owner_id[0], name: v.owner_id[1] } : null,
                };
                break;

            case "get_client_vehicles":
                result = await callOdoo("fleet.vehicle", "search_read", [
                    [["owner_id", "=", data.client_id]],
                    ["id", "name", "license_plate", "brand_id", "model_id"]
                ]);
                break;

            case "get_client_tickets":
                result = await callOdoo("maintenance.request", "search_read", [
                    [["client_id", "=", data.client_id]],
                    ["id", "name", "description", "request_date", "stage_id"]
                ]);
                break;

            case "get_vehicle_tickets":
                result = await callOdoo("maintenance.request", "search_read", [
                    [["vehicle_id", "=", data.vehicle_id]],
                    ["id", "name", "description", "request_date", "stage_id"]
                ]);
                break;

            default:
                return res.status(400).json({ error: "Unknown action" });
        }

        console.log("[JSONRPC] Result:", JSON.stringify(result));
        return res.status(200).json({ success: true, id: result });

    } catch (error: any) {
        console.error("[JSONRPC] Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
