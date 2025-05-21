// stock-price-service.js
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Base URL for the stock exchange test API
const TEST_API_BASE_URL = 'http://20.244.56.144/evaluation-service';

// Middleware for JSON parsing
app.use(express.json());

/**
 * Calculate average of an array of numbers
 * @param {number[]} numbers - Array of numbers to average
 * @return {number} - The calculated average
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param {number[]} x - First array of values
 * @param {number[]} y - Second array of values
 * @return {number} - The correlation coefficient
 */
function calculateCorrelation(x, y) {
  if (!x || !y || x.length === 0 || y.length === 0 || x.length !== y.length) {
    return 0;
  }

  const n = x.length;
  
  // Calculate means
  const meanX = x.reduce((acc, val) => acc + val, 0) / n;
  const meanY = y.reduce((acc, val) => acc + val, 0) / n;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let sumSquaredDeviationsX = 0;
  let sumSquaredDeviationsY = 0;
  
  for (let i = 0; i < n; i++) {
    const deviationX = x[i] - meanX;
    const deviationY = y[i] - meanY;
    
    covariance += deviationX * deviationY;
    sumSquaredDeviationsX += deviationX * deviationX;
    sumSquaredDeviationsY += deviationY * deviationY;
  }
  
  covariance /= (n - 1);
  const stdDevX = Math.sqrt(sumSquaredDeviationsX / (n - 1));
  const stdDevY = Math.sqrt(sumSquaredDeviationsY / (n - 1));
  
  // Calculate Pearson correlation coefficient
  if (stdDevX === 0 || stdDevY === 0) {
    return 0; // Avoid division by zero
  }
  
  return covariance / (stdDevX * stdDevY);
}

/**
 * GET endpoint for average stock price
 * Calculates the average price for a specific stock over the last 'm' minutes
 */
app.get('/stocks/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const minutes = req.query.minutes || 5; // Default to 5 minutes if not specified
    
    if (req.query.aggregation === 'average') {
      // Fetch stock price history from the test API
      const response = await axios.get(`${TEST_API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`, {
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3ODIzNzEzLCJpYXQiOjE3NDc4MjM0MTMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImMzYTdhYjBhLTEwMTUtNGJkOS04ODA0LTM3YTNmYjQzZTAzOSIsInN1YiI6InNlMjJ1ZWNtMDUxQG1haGluZHJhdW5pdmVyc2l0eS5lZHUuaW4ifSwiZW1haWwiOiJzZTIydWVjbTA1MUBtYWhpbmRyYXVuaXZlcnNpdHkuZWR1LmluIiwibmFtZSI6InZhcnVuY2hlbGlrYW5pIiwicm9sbE5vIjoic2UyMnVlY20wNTEiLCJhY2Nlc3NDb2RlIjoiVHBNc0doIiwiY2xpZW50SUQiOiJjM2E3YWIwYS0xMDE1LTRiZDktODgwNC0zN2EzZmI0M2UwMzkiLCJjbGllbnRTZWNyZXQiOiJYeHZCenFhWmRNclJtWWZiIn0.q-lEQfrWGaeixLmNyZSIA8ORELBI17sLTxBhxLzbNJQ` // your full token here
  }
});
      const priceHistory = response.data;
      
      // Extract prices for averaging
      const prices = priceHistory.map(item => item.price);
      const averagePrice = calculateAverage(prices);
      
      // Return the calculated average and price history
      return res.status(200).json({
        averageStockPrice: averagePrice,
        priceHistory: priceHistory
      });
    } 
    
    // If no aggregation specified, just pass through the data from test API
    const response = await axios.get(`${TEST_API_BASE_URL}/stocks/${ticker}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

/**
 * GET endpoint for stock correlation
 * Calculates correlation between two stocks over the last 'm' minutes
 */
app.get('/stockcorrelation', async (req, res) => {
  try {
    const { minutes } = req.query;
    const tickers = req.query.ticker;
    
    if (!tickers || tickers.length !== 2) {
      return res.status(400).json({ error: 'Exactly 2 tickers must be specified' });
    }
    
    // Fetch data for both stocks
    const [ticker1, ticker2] = tickers;
    const [stock1Response, stock2Response] = await Promise.all([
   axios.get(`${TEST_API_BASE_URL}/stocks/${ticker1}?minutes=${minutes}`, {
  headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3ODIzNzEzLCJpYXQiOjE3NDc4MjM0MTMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImMzYTdhYjBhLTEwMTUtNGJkOS04ODA0LTM3YTNmYjQzZTAzOSIsInN1YiI6InNlMjJ1ZWNtMDUxQG1haGluZHJhdW5pdmVyc2l0eS5lZHUuaW4ifSwiZW1haWwiOiJzZTIydWVjbTA1MUBtYWhpbmRyYXVuaXZlcnNpdHkuZWR1LmluIiwibmFtZSI6InZhcnVuY2hlbGlrYW5pIiwicm9sbE5vIjoic2UyMnVlY20wNTEiLCJhY2Nlc3NDb2RlIjoiVHBNc0doIiwiY2xpZW50SUQiOiJjM2E3YWIwYS0xMDE1LTRiZDktODgwNC0zN2EzZmI0M2UwMzkiLCJjbGllbnRTZWNyZXQiOiJYeHZCenFhWmRNclJtWWZiIn0.q-lEQfrWGaeixLmNyZSIA8ORELBI17sLTxBhxLzbNJQ` }
}),
axios.get(`${TEST_API_BASE_URL}/stocks/${ticker2}?minutes=${minutes}`, {
  headers: { Authorization: `BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3ODIzNzEzLCJpYXQiOjE3NDc4MjM0MTMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImMzYTdhYjBhLTEwMTUtNGJkOS04ODA0LTM3YTNmYjQzZTAzOSIsInN1YiI6InNlMjJ1ZWNtMDUxQG1haGluZHJhdW5pdmVyc2l0eS5lZHUuaW4ifSwiZW1haWwiOiJzZTIydWVjbTA1MUBtYWhpbmRyYXVuaXZlcnNpdHkuZWR1LmluIiwibmFtZSI6InZhcnVuY2hlbGlrYW5pIiwicm9sbE5vIjoic2UyMnVlY20wNTEiLCJhY2Nlc3NDb2RlIjoiVHBNc0doIiwiY2xpZW50SUQiOiJjM2E3YWIwYS0xMDE1LTRiZDktODgwNC0zN2EzZmI0M2UwMzkiLCJjbGllbnRTZWNyZXQiOiJYeHZCenFhWmRNclJtWWZiIn0.q-lEQfrWGaeixLmNyZSIA8ORELBI17sLTxBhxLzbNJQ ` }
})
    ])
    
    const stock1Data = stock1Response.data;
    const stock2Data = stock2Response.data;
    
    // Calculate average prices for both stocks
    const prices1 = stock1Data.map(item => item.price);
    const prices2 = stock2Data.map(item => item.price);
    
    const averagePrice1 = calculateAverage(prices1);
    const averagePrice2 = calculateAverage(prices2);
    
    // Calculate correlation between the two stocks
    const correlation = calculateCorrelation(prices1, prices2);
    
    // Prepare response
    const response = {
      correlation: correlation,
      stocks: {
        [ticker1]: {
          averagePrice: averagePrice1,
          priceHistory: stock1Data
        },
        [ticker2]: {
          averagePrice: averagePrice2,
          priceHistory: stock2Data
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error calculating correlation:', error.message);
    res.status(500).json({ error: 'Failed to calculate correlation' });
  }
});

/**
 * GET endpoint for fetching all available stocks
 */
app.get('/stocks', async (req, res) => {
  try {
    const response = await axios.get(`${TEST_API_BASE_URL}/stocks`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Stock Price Aggregation Service running on port ${PORT}`);
});