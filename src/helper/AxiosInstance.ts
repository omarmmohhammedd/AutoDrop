import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

const { BASE_URL } = {
  BASE_URL: 'https://apis.autodrop.me/'
  // BASE_URL: 'http://localhost:3000/'
};
const axiosInstance = axios.create({
  baseURL: BASE_URL
});

axiosInstance.interceptors.request.use(function (
  request: InternalAxiosRequestConfig<AxiosRequestConfig>
) {
  const token = localStorage.getItem('@token');

  if (token) request.headers.Authorization = 'Bearer ' + token;

  return request;
});

axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
