import express from 'express';
import morgan from 'morgan';
import { v1Router } from './routes/v1-routes.js';
import connectDB from './db.js';
import cors from 'cors';
import admin  from 'firebase-admin';
import serviceAccount from './kma-server-firebase-adminsdk-v06dv-429cab45a0.json' assert { type: 'json' };


// * Test the connection to MongoDB
connectDB();

admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount)
  }
);

const app = express();

// * Morgan is used for logging the requests
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ClientURL = process.env.ClientURL;
const ClientURL2 = process.env.ClientURL2;

// * Define the URLs for CORS
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || process.env.NODE_ENV === 'development') {
        callback(null, true);
  
      } else {
        const allowedOrigins = [ClientURL, ClientURL2];
  
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      }
    }
};
  
app.use(cors(corsOptions));

// * Middleware to set the Cache-Control header
app.use(function (req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  next();
});


// * Middleware to forward the request to the v1Router
app.use('/api/v1', v1Router);

// * Define the port for the server
const PORT = process.env.PORT || 8080;

// * Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ? Export the firebaseApp
export { admin };
