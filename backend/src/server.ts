import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
  console.log(`[server] Health → http://localhost:${PORT}/api/v1/health`);
  console.log(`[server] ENV    → ${process.env.NODE_ENV || 'development'}`);
});
