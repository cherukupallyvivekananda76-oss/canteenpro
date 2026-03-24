import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import collegesRouter from './routes/colleges';
import menuRouter from './routes/menu';
import ordersRouter from './routes/orders';
import scannersRouter from './routes/scanners';

import messRouter from './routes/mess';
import messOrdersRouter from './routes/messOrders';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/colleges', collegesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/scanners', scannersRouter);
app.use('/api/mess', messRouter);
app.use('/api/mess-orders', messOrdersRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Canteen Preorder Backend' });
});

app.listen(PORT, () => {
  console.log(`\n🍽️  Canteen backend running on http://localhost:${PORT}`);
  console.log(`📋 Database: PostgreSQL (canteen)`);
});
