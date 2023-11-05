import axios, { AxiosRequestConfig } from "axios";

export default function SallaRequest({
  url,
  method,
  data,
  token,
}: AxiosRequestConfig<any> & { token: string }) {
  const options: AxiosRequestConfig<any> = {
    baseURL: process.env.SALLA_ENDPOINT as string,
    url,
    method,
    data,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  };

  return axios(options);
}
