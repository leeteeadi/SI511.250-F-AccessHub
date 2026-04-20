# AccessHub

AccessHub is a smart access control system that allows users to request and manage access to physical spaces.

## Features
- Request access to a device (door)
- Approve or deny requests
- Real-time updates using Socket.IO

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Realtime: Socket.IO

## How to Run

### Backend
cd backend
npm install
node src/server.js

### Frontend
cd frontend
npm install
npm run dev

## Demo Flow
1. Click "Request Access"
2. Approve or deny the request
3. Status updates in real time

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

