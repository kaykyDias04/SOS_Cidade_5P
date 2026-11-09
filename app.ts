import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import denunciaRoutes from './routes/denuncia.routes';

const app = express();

// O backend roda atrás do proxy da Render: sem isto todos os usuários teriam o mesmo IP
// (o limite de tentativas de login por IP dependeria disso).
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  'http://localhost:8082',
];



if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((url) => {
    allowedOrigins.push(url.trim());

    allowedOrigins.push(url.trim().replace(/\/$/, ''));
  });
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
};


app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/denuncias', denunciaRoutes);

export default app;
