import { homedir } from "os";

export const BASE64_USAGE = 'tinify base64 <IMG_URL_OR_LOCAL_IMG_PATH>';
export const USAGE_SET_KEY = 'tinify set-key <YOUR_TINIFY_KEY>';
export const configFile = `${homedir()}/tinify.config.js`
