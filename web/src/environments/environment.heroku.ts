import baseEnv from './base';

export const environment = Object.assign({}, baseEnv, {
  production: true,
  baseUrl: 'https://xwordio.herokuapp.com/api',
});
