import axios from "axios";

const apiUrl = 'https://testaccount1rif-001-site1.anytempurl.com/';
const baseHeaders = (accesToken: string) => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Authorization': 'Bearer ' + accesToken,
})

export const apiCall = (accesToken: string) => axios.create({
  baseURL: apiUrl,
  timeout: 7000,
  headers: baseHeaders(accesToken),
  // transformResponse: [
  //   (data) => {
  //     let resp

  //     try {
  //       resp = JSON.parse(data)
  //     } catch (error) {
  //       throw Error(`[requestClient] Error parsing response JSON data - ${JSON.stringify(error)}`)
  //     }

  //     if (resp.status === 'success') {
  //       return resp.data
  //     } else {
  //       throw Error(`[requestClient] Request failed with reason -  ${data}`)
  //     }
  //   }
  // ]
});

  