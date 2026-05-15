import axios from 'axios';
window.axios = axios;
//testy
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
