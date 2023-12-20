import axios, { AxiosError } from 'axios';

import { alertNotifyDanger } from './alertsUtils';

// const corsAny = 'https://cors-anywhere.herokuapp.com/'
const apiUrl = 'https://testaccount1rif-001-site1.anytempurl.com/';
const baseHeaders = (accesToken: string) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Authorization': 'Bearer ' + accesToken,
});

interface ApiError {
  message: string;
}

export const apiCall = (accesToken: string) => {
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
