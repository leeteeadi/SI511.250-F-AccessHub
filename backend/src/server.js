import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let requests = [];
let logs = [];

app.post("/api/request", (req, res) => {
  const request = {
    id: Date.now(),
    user: req.body.user,
    deviceId: req.body.deviceId,
    status: "pending"
  };
  requests.push(request);
  io.emit("request_created", request);
  res.json(request);
});

app.get("/api/requests", (req, res) => {
  res.json(requests);
});

app.post("/api/approve/:id", (req, res) => {
  const request = requests.find(r => r.id == req.params.id);
  if (!request) return res.sendStatus(404);

  request.status = "approved";
  logs.push({ event: "approved", request });

  io.emit("request_updated", request);
  io.emit("unlock_device", request.deviceId);

  res.json(request);
});

app.post("/api/deny/:id", (req, res) => {
  const request = requests.find(r => r.id == req.params.id);
  if (!request) return res.sendStatus(404);

  request.status = "denied";
  logs.push({ event: "denied", request });

  io.emit("request_updated", request);
  res.json(request);
});

app.get("/api/logs", (req, res) => {
  res.json(logs);
});

server.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
