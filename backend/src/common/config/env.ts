import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port:                  process.env.PORT || 5000,
  nodeEnv:               process.env.NODE_ENV || 'development',
  databaseUrl:           process.env.DATABASE_URL || '',
  jwtSecret:             process.env.JWT_SECRET || 'supersecret',
  razorpayKeyId:         process.env.RAZORPAY_KEY_ID      || '',
  razorpayKeySecret:     process.env.RAZORPAY_KEY_SECRET  || '',
  cloudinaryCloudName:   process.env.CLOUDINARY_CLOUD_NAME  || '',
  cloudinaryApiKey:      process.env.CLOUDINARY_API_KEY     || '',
  cloudinaryApiSecret:   process.env.CLOUDINARY_API_SECRET  || '',
} as const;
