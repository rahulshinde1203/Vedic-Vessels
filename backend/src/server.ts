import { config } from './common/config/env';
import app from './app';

app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
  console.log(`[server] Health → http://localhost:${config.port}/api/v1/health`);
  console.log(`[server] ENV    → ${config.nodeEnv}`);
});
