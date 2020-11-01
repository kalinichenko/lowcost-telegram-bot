import axios from "axios";

const BASE_URL = 'https://wizzair.com/static_fe';

export const getApiUrl = async () => {
    const resp = await axios.get(`${BASE_URL}/metadata.json`)
    return resp.data.apiUrl;
}



