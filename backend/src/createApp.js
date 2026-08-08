'use strict';

/**
 * Cria a instância do Express a partir de repositórios fornecidos.
 * Reutilizável por `server.js` (produção) e pelos testes de integração.
 *
 * @param {object} opts
 * @param {object} opts.userRepository
 * @param {object} opts.adRepository
 * @param {object} [opts.corsOrigin='*']
 * @param {boolean} [opts.enableRateLimit=true]
 * @param {boolean} [opts.enableStatic=true]
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const CreateAd = require('./application/use-cases/ads/CreateAd');
const ListAds = require('./application/use-cases/ads/ListAds');
const GetAd = require('./application/use-cases/ads/GetAd');
const UpdateAd = require('./application/use-cases/ads/UpdateAd');
const DeleteAd = require('./application/use-cases/ads/DeleteAd');

const RegisterUser = require('./application/use-cases/users/RegisterUser');
const LoginUser = require('./application/use-cases/users/LoginUser');
const GetUserAds = require('./application/use-cases/users/GetUserAds');
const GetUserFavorites = require('./application/use-cases/users/GetUserFavorites');
const AddFavorite = require('./application/use-cases/favorites/AddFavorite');
const RemoveFavorite = require('./application/use-cases/favorites/RemoveFavorite');

const AdController = require('./presentation/controllers/AdController');
const UserController = require('./presentation/controllers/UserController');

const buildRouter = require('./presentation/routes');
const { buildAuthMiddleware } = require('./presentation/middlewares/auth');
const { notFound, errorHandler } = require('./presentation/middlewares/errorHandler');

function createApp({
  userRepository,
  adRepository,
  corsOrigin = '*',
  enableRateLimit = true,
  enableStatic = true
} = {}) {
  if (!userRepository || !adRepository) {
    throw new Error('createApp: userRepository e adRepository são obrigatórios');
  }

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
  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '2mb' }));

  if (enableRateLimit) {
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { code: 'RATE_LIMIT', message: 'Muitas requisições. Tente novamente em alguns minutos.' } }
    });
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      message: { error: { code: 'AUTH_RATE_LIMIT', message: 'Muitas tentativas. Aguarde alguns minutos.' } }
    });
    app.use('/api', generalLimiter);
    app.use('/api/users/login', authLimiter);
    app.use('/api/users/register', authLimiter);
  }

  if (enableStatic) {
    const staticRoot = path.resolve(__dirname, '..', '..');
    app.use(express.static(staticRoot, {
      extensions: ['html'],
      setHeaders(res, filePath) {
        if (filePath.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        }
        if (filePath.endsWith(`${path.sep}sw.js`) || filePath.endsWith('/sw.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Service-Worker-Allowed', '/');
        }
      }
    }));
  }

  app.use('/api', buildRouter({ adController, userController, authRequired, authOptional }));
  app.get('/api-info', (_req, res) => res.redirect('/api'));

  if (enableStatic) {
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const staticRoot = path.resolve(__dirname, '..', '..');
        return res.sendFile(path.join(staticRoot, 'pages', '404.html'));
      }
      return next();
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
