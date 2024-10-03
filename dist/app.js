"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_1 = __importDefault(require("http-status"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const passport_1 = __importDefault(require("passport"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
require("./path/to/passport-config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:3000', credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: 'event_hive_secret_key',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send({
        message: 'Health Care Server',
    });
});
app.use('/api/v1', routes_1.default);
app.use(globalErrorHandler_1.default);
app.use((req, res) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: 'Not Found',
        error: [{ path: req.originalUrl, message: 'Route Not Found' }],
    });
});
exports.default = app;
exports.handler = (0, serverless_http_1.default)(app);
