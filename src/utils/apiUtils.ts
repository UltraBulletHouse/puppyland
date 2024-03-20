import axios, { AxiosError } from 'axios';

import { alertNotifyDanger } from './alertsUtils';

const apiUrl = 'https://mydogapi.azurewebsites.net/';

const baseHeaders = (accesToken?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  if (accesToken) {
    headers['Authorization'] = 'Bearer ' + accesToken;
  }
  return headers;
};

interface ApiError {
  message: string;
}

export const apiCall = (accesToken?: string) => {
  const api = axios.create({
    baseURL: apiUrl,
    timeout: 7000,
    headers: baseHeaders(accesToken),
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const msg = error.response?.data?.message;

      alertNotifyDanger(msg ?? error.message);
    }
  );

  return api;
};
