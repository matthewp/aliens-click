import fritz from 'fritz';
import indexRoute from './index.js';
import articleRoute from './article.js';

const app = fritz();

app
  .configure(indexRoute)
  .configure(articleRoute);

/**
 * Color scheme
 * https://coolors.co/fefffe-e5fcf5-b3dec1-210124-750d37
 */
