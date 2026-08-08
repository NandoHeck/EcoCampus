'use strict';

const { PORT, HOST, CORS_ORIGIN } = require('./src/config/env');
const buildPersistence = require('./src/infrastructure/persistence/buildPersistence');
const createApp = require('./src/createApp');
const seed = require('./src/infrastructure/seed/seed');

async function bootstrap() {
  const { userRepository, adRepository, driver, filePath } = buildPersistence();
  // eslint-disable-next-line no-console
  console.log(`[db] driver=${driver}  path=${filePath}`);

  await seed({ userRepository, adRepository });

  const app = createApp({
    userRepository,
    adRepository,
    corsOrigin: CORS_ORIGIN,
    enableRateLimit: true,
    enableStatic: true
  });

  app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`\n🌱 EcoCampus rodando em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`   Frontend: http://localhost:${PORT}/`);
    // eslint-disable-next-line no-console
    console.log(`   API:      http://localhost:${PORT}/api\n`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
