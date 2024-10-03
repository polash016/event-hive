"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_secret_expires: process.env.JWT_SECRET_EXPIRES_IN,
    jwt_refresh: process.env.JWT_REFRESH,
    jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES_IN,
    salt_rounds: process.env.SALT_ROUNDS,
    reset_pass_secret: process.env.RESET_PASSWORD_TOKEN,
    reset_pass_expires: process.env.RESET_PASSWORD_EXPIRES_IN,
    reset_pass_link: process.env.RESET_PASS_LINK,
    email: process.env.EMAIL,
    send_email_pass: process.env.SEND_EMAIL_PASS,
    ssl_store_id: process.env.SSL_STORE_ID,
    ssl_api_key: process.env.SSL_API_KEY,
    ssl_payment_api: process.env.SSL_PAYMENT_API,
    ssl_validation_api: process.env.SSL_VALIDATION_API,
    ssl_success_url: process.env.SSL_SUCCESS_URL,
    ssl_fail_url: process.env.SSL_FAIL_URL,
    ssl_cancel_url: process.env.SSL_CANCEL_URL,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
};
