import axios from 'axios';
import DOMPurify from "dompurify";
import { URL_API } from "./keys";

let csrfToken = null;
const purify = DOMPurify;

const isFormDataPayload = (data) =>
  typeof FormData !== 'undefined' && data instanceof FormData;

const setCommonHeaders = async (config, baseUrl) => {
  config.headers['X-IS-MOBILE'] = 'false';

  // Detect FormData
  if (isFormDataPayload(config.data)) {
    // Important: let browser/axios set multipart boundary
    delete config.headers['Content-Type'];
  } else {
    if (config.headers['Content-Type'] && !config.headers['Content-Type'].includes('charset=utf-8')) {
      config.headers['Content-Type'] += '; charset=utf-8';
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json; charset=utf-8';
    }
  }

  if (config.method !== 'get') {
    // if (!csrfToken) {
    //   const res = await fetch(`${baseUrl}/pkk/csrf`, { credentials: 'include' });
    //   const data = await res.json();
    //   csrfToken = data.csrf_token;
    // }
    // config.headers['X-CSRF-TOKEN'] = csrfToken;
  } else {
    delete config.headers['X-CSRF-TOKEN'];
  }
  return config;
};

const sanitizeRequestData = (config) => {
  // Skip sanitizing FormData
  if (isFormDataPayload(config.data)) return config;

  if (config.data && typeof config.data === "object") {
    for (let key in config.data) {
      if (typeof config.data[key] === "string") {
        // Sanitize lalu hapus spasi di akhir
        config.data[key] = purify.sanitize(config.data[key]).trimEnd();
      }
    }
  }
  return config;
};

const createApiInstance = (baseURL, apiSpecificUrl) => {
  const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    async (config) => {
      try {
        return await setCommonHeaders(config, apiSpecificUrl || baseURL);
      } catch (error) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)))
      }
    },
    (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
  );

  instance.interceptors.request.use(
    sanitizeRequestData,
    (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
  );

  return instance;
};

const API = createApiInstance(URL_API, URL_API);

export {
  API,
};
