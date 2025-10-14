import path from 'path';
import hook from '@nativescript/hook';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
hook(path.join(__dirname, "..")).preuninstall();