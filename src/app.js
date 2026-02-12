"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const projects_routes_1 = __importDefault(require("./routes/projects.routes"));
const location_routes_1 = __importDefault(require("./routes/location.routes"));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/projects", projects_routes_1.default);
app.use("/api/locations", location_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Admin API is running' });
});
exports.default = app;
//# sourceMappingURL=app.js.map