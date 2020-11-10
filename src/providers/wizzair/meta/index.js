import axios from "axios";
import { logger } from "../../../logger";

const BASE_URL = "https://wizzair.com";
export const getApiUrl = async () => {
  const resp = await axios.get(`${BASE_URL}/static_fe/metadata.json`);
  logger.debug("[wizzair] get apiUrl: %o", resp.data.apiUrl);
  return resp.data.apiUrl;
};
