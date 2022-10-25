import { config } from 'dotenv';
config();

export default {
  database: {
    MongoDB: process.env.MONGO_DB_URI,
  },
  apiKey: process.env.API_KEY,
  blockchain: {
    xpub: process.env.XPUB,
    infuraKey: process.env.INFURA_KEY,
  },
};
