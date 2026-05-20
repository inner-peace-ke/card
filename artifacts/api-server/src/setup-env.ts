// Internal startup file — always applies config.ts before the database opens.
// To change database or PIN, edit config.ts at the project root.
import { config } from "../../../config";

process.env["DATABASE_URL"] = config.DATABASE_URL;
process.env["ADMIN_PIN"]    = config.ADMIN_PIN;
