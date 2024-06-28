import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
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
};
