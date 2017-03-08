switch (process.env.NODE_ENV) {
  case 'production':
    // Add production config here
    break;

  case 'test':
    process.env.PORT = 3001;
    process.env.MONGODB_URI = 'mongodb://localhost/todoapp_test';
    break;
  
  case 'development':
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost/todoapp';
    break;

  default:
    throw new Error('Set NODE_ENV to development, test or production');
}