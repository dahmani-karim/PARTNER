import api from './api';

export default Object.fromEntries(['get', 'post', 'put', 'delete'].map(method => [
  method, (path, ...args) => api[method](`/api${path}`, ...args),
]));
