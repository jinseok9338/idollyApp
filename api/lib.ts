import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const responseHandler = (res: ApiResponse) => {
  if (res.code === 500) {
    console.error(res.code, res.message);
    throw { code: res.code, message: res.message };
  } else if (res.code !== undefined && res.code !== 200) {
    throw { code: res.code, message: res.message };
  }
  return res.data ?? true;
};

const plainRequestTransformer = (data: any, headers: any) => {
  headers["Content-Type"] = "application/json";
  return JSON.stringify(data);
};

const plainResponseTransformer = (data: any) => {
  return typeof data === "string" ? JSON.parse(data) : data;
};

/**
 * API 설정을 위한 인터페이스입니다.
 * @template T 요청에서 사용되는 데이터의 타입입니다.
 * @template D 응답에서 받은 데이터의 타입입니다.
 */
interface ApiConfig<T = any, D = any> {
  rootPath: string;
  /** 요청 설정을 전처리하는 콜백 함수입니다. */
  preProcessingCallback?: (
    config?: AxiosRequestConfig<T>
  ) => AxiosRequestConfig<T>;
  postProcessingCallback?: (
    response?: AxiosResponse<D>,
    restData?: any
  ) => void;
  apiErrorHandler?: () => void;
  additionalHeader?: Record<string, string>;
  transformRequest?: ((data: T, headers?: Record<string, string>) => any)[];
  transformResponse?: ((data: D) => any)[];
}

export default class API {
  static _instance: API;

  private _axiosInstance: AxiosInstance;
  private static _config: ApiConfig = { rootPath: "" };

  constructor() {
    this._axiosInstance = axios.create();

    this._axiosInstance.interceptors.request.use(
      (config: any) => {
        const extendedConfig: any = API._config.preProcessingCallback?.(config);
        return extendedConfig ?? config;
      },
      (error: any) => {
        API._config.preProcessingCallback?.();
        API._config.apiErrorHandler?.();
        return Promise.reject(error);
      }
    );

    this._axiosInstance.interceptors.response.use(
      (response, ...rest) => {
        API._config.postProcessingCallback?.(response, rest);
        return response;
      },
      (error) => {
        API._config.postProcessingCallback?.();
        API._config.apiErrorHandler?.();
        return Promise.reject(error);
      }
    );
  }

  public static configure(config: ApiConfig) {
    this._config = config;
  }

  public static get instance() {
    if (!this._instance) this._instance = new API();
    return this._instance;
  }

  public get axiosInstance() {
    return this._axiosInstance;
  }

  private static getUrl(apiPath: string) {
    return (
      this._config.rootPath +
      (apiPath.charAt(0) === "/" ? apiPath : `/${apiPath}`)
    );
  }

  private static addGlobalConfig(config: any | undefined) {
    const transformers = {
      ...(this._config.transformRequest &&
      this._config.transformRequest?.length > 0
        ? { transformRequest: this._config.transformRequest }
        : {}),
      ...(this._config.transformResponse &&
      this._config.transformResponse?.length > 0
        ? { transformResponse: this._config.transformResponse }
        : {}),
    };
    const headers = {
      ...(config?.headers || {}),
      "X-ENCRYPTED":
        !!this._config.transformRequest &&
        this._config.transformRequest?.length > 0
          ? "yes"
          : "no",
    };

    return { ...transformers, ...config, headers, withCredentials: true };
  }

  public static async get(
    apiPath: string,
    config?: any | undefined
  ): Promise<boolean | any> {
    const response = await API.instance.axiosInstance.get<ApiResponse>(
      this.getUrl(apiPath),
      this.addGlobalConfig(config)
    );
    return responseHandler(response.data);
  }

  public static async post(
    apiPath: string,
    data?: any | undefined,
    config?: any | undefined
  ): Promise<boolean | any> {
    const response = await API.instance.axiosInstance.post(
      this.getUrl(apiPath),
      data,
      this.addGlobalConfig(config)
    );
    return responseHandler(response.data);
  }

  public static postRaw(
    apiPath: string,
    data?: any | undefined,
    config?: any | undefined
  ): Promise<boolean | any> {
    return API.instance.axiosInstance.post(
      this.getUrl(apiPath),
      data,
      this.addGlobalConfig(config)
    );
  }

  public static postTransformed(
    apiPath: string,
    data?: any | undefined,
    transformRequest?: (data: any, headers: any) => string,
    transformResponse?: (data: any) => string,
    config?: any | undefined
  ): Promise<boolean | any> {
    const conf = {
      ...config,
      headers: {
        ...config?.headers,
        "X-ENCRYPTED": "yes",
      },
      transformRequest: [transformRequest ?? plainRequestTransformer],
      transformResponse: [transformResponse ?? plainResponseTransformer],
    };

    return API.instance.axiosInstance.post(this.getUrl(apiPath), data, {
      ...conf,
      withCredentials: true,
    });
  }

  public static async patch(
    apiPath: string,
    data?: any | undefined,
    config?: any | undefined
  ): Promise<boolean | any> {
    const response = await API.instance.axiosInstance.post(
      this.getUrl(apiPath),
      data,
      this.addGlobalConfig(config)
    );
    return responseHandler(response.data);
  }

  public static async put(
    apiPath: string,
    data?: any | undefined,
    config?: any | undefined
  ): Promise<boolean | any> {
    const response = await API.instance.axiosInstance.put(
      this.getUrl(apiPath),
      data,
      this.addGlobalConfig(config)
    );
    return responseHandler(response.data);
  }

  public static async delete(
    apiPath: string,
    config?: any | undefined
  ): Promise<boolean | any> {
    const response = await API.instance.axiosInstance.delete(
      this.getUrl(apiPath),
      this.addGlobalConfig(config)
    );
    return responseHandler(response.data);
  }
}

export interface ApiResponse {
  code: number;
  data?: any;
  message?: string;
  timestamp?: string;
}
