"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const server = node_http_1.default.createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/') {
        return response.end('Hello Docker!');
    }
    return response.writeHead(404).end('Not found!');
});
server.listen(3333, () => console.log('Server is running on port 3333'));
