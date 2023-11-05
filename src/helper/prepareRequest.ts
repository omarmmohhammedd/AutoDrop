import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from './AxiosInstance';
import generateAlert from './generateAlert';

export default async function prepareRequest(
  config: AxiosRequestConfig,
  cb: (data: any | null, error: any | null) => void
) {
  return axiosInstance(config)
    .then(({ data }) => cb(data, null))
    .catch((error: AxiosError | any) => {
      const response = error.response;
      const { config, data } = response;
      const type = config?.responseType;
      const { result, message } = data || {};

      if (type === 'blob')
        return generateAlert('There is something went wrong while doing this process.', 'error');

      if (message instanceof Object) {
        return cb(null, message);
      }

      return generateAlert(message, 'error');
    });
}
