import axios, { AxiosRequestConfig } from "axios";
import { ZodType, ZodError } from "zod";

// Define a function to create a schema validator
const createSchemaValidator =
  <T>(schema: ZodType<T>) =>
  (data: unknown): T => {
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      throw new ZodError(result.error.issues);
    }
  };

const baseHeaders = {
  "Content-Type": "application/json",
};

const axiosInstance = axios.create({
  headers: baseHeaders,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // this is where the response is not in 200 range
    return Promise.reject(error);
  }
);

async function getRequest<T = any>({
  config,
}: {
  config: Omit<AxiosRequestConfig, "data"> & {
    ResponseDataSchema: ZodType<T>;
  };
}): Promise<T> {
  const newConfig = {
    ...config,
    ResponseDataSchema: undefined,
  };

  const extendedConfig: AxiosRequestConfig = {
    ...newConfig,
    method: "get",
  };

  const response = await axiosInstance.request(extendedConfig);
  // Validate the response data using the schema for type T
  const validatedResponse = createSchemaValidator(config.ResponseDataSchema)(
    response.data
  );
  return validatedResponse;
}

// Modify the postRequest function to include Zod schema validation
async function postRequest<T = any, D = any>({
  config,
  data,
}: {
  config: Omit<AxiosRequestConfig, "data"> & {
    ResponseDataSchema: ZodType<T>;
    RequestPayloadSchema: ZodType<D>;
  };
  data: D;
}): Promise<T> {
  // Validate the request data using the schema for type D
  const validatedData = createSchemaValidator(config.RequestPayloadSchema)(
    data
  );

  const newConfig = {
    ...config,
    ResponseDataSchema: undefined,
    RequestPayloadSchema: undefined,
  };
  const extendedConfig: AxiosRequestConfig = {
    ...newConfig,
    data: validatedData,
    method: "post",
  };

  // Make the request
  const response = await axiosInstance.request(extendedConfig);

  // Validate the response data using the schema for type T
  const validatedResponse = createSchemaValidator(config.ResponseDataSchema)(
    response.data
  );

  return validatedResponse;
}

// Modify the postRequest function to include Zod schema validation
async function putRequest<T = any, D = any>({
  config,
  data,
}: {
  config: Omit<AxiosRequestConfig, "data"> & {
    ResponseDataSchema: ZodType<T>;
    RequestPayloadSchema: ZodType<D>;
  };
  data: D;
}): Promise<T> {
  // Validate the request data using the schema for type D
  const validatedData = createSchemaValidator(config.RequestPayloadSchema)(
    data
  );

  const newConfig = {
    ...config,
    ResponseDataSchema: undefined,
    RequestPayloadSchema: undefined,
  };
  const extendedConfig: AxiosRequestConfig = {
    ...newConfig,
    data: validatedData,
    method: "put",
  };

  // Make the request
  const response = await axiosInstance.request(extendedConfig);

  // Validate the response data using the schema for type T
  const validatedResponse = createSchemaValidator(config.ResponseDataSchema)(
    response.data
  );

  return validatedResponse;
}
// Modify the postRequest function to include Zod schema validation
async function patchRequest<T = any, D = any>({
  config,
  data,
}: {
  config: Omit<AxiosRequestConfig, "data"> & {
    ResponseDataSchema: ZodType<T>;
    RequestPayloadSchema: ZodType<D>;
  };
  data: D;
}): Promise<T> {
  // Validate the request data using the schema for type D
  const validatedData = createSchemaValidator(config.RequestPayloadSchema)(
    data
  );

  const newConfig = {
    ...config,
    ResponseDataSchema: undefined,
    RequestPayloadSchema: undefined,
  };
  const extendedConfig: AxiosRequestConfig = {
    ...newConfig,
    data: validatedData,
    method: "patch",
  };

  // Make the request
  const response = await axiosInstance.request(extendedConfig);

  // Validate the response data using the schema for type T
  const validatedResponse = createSchemaValidator(config.ResponseDataSchema)(
    response.data
  );

  return validatedResponse;
}

async function deleteRequest<T = any>({
  config,
}: {
  config: Omit<AxiosRequestConfig, "data"> & {
    ResponseDataSchema: ZodType<T>;
  };
}): Promise<T> {
  const newConfig = {
    ...config,
    ResponseDataSchema: undefined,
  };

  const extendedConfig: AxiosRequestConfig = {
    ...newConfig,
    method: "delete",
  };

  const response = await axiosInstance.request(extendedConfig);
  // Validate the response data using the schema for type T
  const validatedResponse = createSchemaValidator(config.ResponseDataSchema)(
    response.data
  );
  return validatedResponse;
}

const API = {
  get: getRequest,
  post: postRequest,
  put: putRequest,
  patch: patchRequest,
  delete: deleteRequest,
};

export default API;
