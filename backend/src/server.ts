import express from 'express';
import cors from 'cors';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/orders', ordersRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Canteen Preorder Backend' });
});

app.listen(PORT, () => {
  console.log(`\n🍽️  Canteen backend running on http://localhost:${PORT}`);
  console.log(`📋 Orders will be saved to: orders.csv\n`);
});
