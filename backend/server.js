'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');

const { PORT, HOST, DB_PATH, CORS_ORIGIN } = require('./src/config/env');

const JsonDatabase = require('./src/infrastructure/persistence/JsonDatabase');
const AdRepository = require('./src/infrastructure/persistence/AdRepository');
const UserRepository = require('./src/infrastructure/persistence/UserRepository');

const CreateAd = require('./src/application/use-cases/ads/CreateAd');
const ListAds = require('./src/application/use-cases/ads/ListAds');
const GetAd = require('./src/application/use-cases/ads/GetAd');
const UpdateAd = require('./src/application/use-cases/ads/UpdateAd');
const DeleteAd = require('./src/application/use-cases/ads/DeleteAd');

const RegisterUser = require('./src/application/use-cases/users/RegisterUser');
const LoginUser = require('./src/application/use-cases/users/LoginUser');
const GetUserAds = require('./src/application/use-cases/users/GetUserAds');
const GetUserFavorites = require('./src/application/use-cases/users/GetUserFavorites');
const AddFavorite = require('./src/application/use-cases/favorites/AddFavorite');
const RemoveFavorite = require('./src/application/use-cases/favorites/RemoveFavorite');

const AdController = require('./src/presentation/controllers/AdController');
const UserController = require('./src/presentation/controllers/UserController');

const buildRouter = require('./src/presentation/routes');
const { buildAuthMiddleware } = require('./src/presentation/middlewares/auth');
const { notFound, errorHandler } = require('./src/presentation/middlewares/errorHandler');

const seed = require('./src/infrastructure/seed/seed');

async function bootstrap() {
  const db = new JsonDatabase(DB_PATH);

  const userRepository = new UserRepository(db);
  const adRepository = new AdRepository(db);

  await seed({ userRepository, adRepository });

  const useCases = {
    createAd: new CreateAd({ adRepository, userRepository }),
    listAds: new ListAds({ adRepository }),
    getAd: new GetAd({ adRepository }),
    updateAd: new UpdateAd({ adRepository }),
    deleteAd: new DeleteAd({ adRepository }),
    registerUser: new RegisterUser({ userRepository }),
    loginUser: new LoginUser({ userRepository }),
    getUserAds: new GetUserAds({ adRepository, userRepository }),
    getUserFavorites: new GetUserFavorites({ adRepository, userRepository }),
    addFavorite: new AddFavorite({ userRepository, adRepository }),
    removeFavorite: new RemoveFavorite({ userRepository })
  };

  const adController = new AdController(useCases);
  const userController = new UserController({ ...useCases, userRepository });

  const authRequired = buildAuthMiddleware({ userRepository, required: true });
  const authOptional = buildAuthMiddleware({ userRepository, required: false });

  const app = express();
  app.use(cors({ origin: CORS_ORIGIN }));
  app.use(express.json({ limit: '2mb' }));

  const staticRoot = path.resolve(__dirname, '..');
  app.use(express.static(staticRoot, {
    extensions: ['html'],
    setHeaders(res, filePath) {
      // MIME correto para o manifest do PWA
      if (filePath.endsWith('.webmanifest')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      }
      // O SW nunca deve ficar em cache do browser — precisa ser sempre "fresh"
      // para que updates cheguem imediatamente.
      if (filePath.endsWith(`${path.sep}sw.js`) || filePath.endsWith('/sw.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Service-Worker-Allowed', '/');
      }
    }
  }));

  app.use('/api', buildRouter({ adController, userController, authRequired, authOptional }));

  app.get('/api-info', (_req, res) => res.redirect('/api'));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(staticRoot, 'pages', '404.html'));
    }
    return next();
  });

  app.use(notFound);
  app.use(errorHandler);

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
