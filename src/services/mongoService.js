import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.REACT_APP_MONGODB_URI;
let client = null;

export const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db('zanzibar-dev');
};

export const getCPUEData = async (landingSite, startDate, endDate) => {
  const db = await connectToDatabase();
  const collection = db.collection('monthly-cpue');
  
  const query = {
    landing_site: landingSite,
    month_date: {
      $gte: startDate,
      $lte: endDate
    }
  };

  return await collection
    .find(query)
    .sort({ month_date: 1 })
    .toArray();
}; 