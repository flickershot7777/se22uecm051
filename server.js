const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/stocks/:ticker', (req, res) => {
  const { ticker } = req.params;
  const { minutes, aggregation } = req.query;

  if (ticker === 'NVDA' && minutes === '30' && aggregation === 'average') {
    const mockResponse = [
      {
        price: 666.66595,
        lastUpdatedAt: "2025-05-08T04:11:42.465706306Z"
      },
      {
        price: 212.9439,
        lastUpdatedAt: "2025-05-08T04:14:39.465201105Z"
      },
      {
        price: 163.42203,
        lastUpdatedAt: "2025-05-08T04:23:30.465542126Z"
      },
      {
        price: 231.95296,
        lastUpdatedAt: "2025-05-08T04:26:27.4658491Z"
      },
      {
        price: 124.95156,
        lastUpdatedAt: "2025-05-08T04:30:23.465940341Z"
      },
      {
        price: 459.09558,
        lastUpdatedAt: "2025-05-08T04:39:14.464887447Z"
      },
      {
        price: 998.27924,
        lastUpdatedAt: "2025-05-08T04:42:55.464999999Z"
      }
    ];
    return res.status(200).json(mockResponse);
  }

  return res.status(404).json({ error: 'Stock data not found for given query' });
});

app.listen(PORT, () => {
  console.log(`Mock Stock Service running at http://localhost:${PORT}`);
});