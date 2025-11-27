/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsCombustionResponse {
  creator_login?: string;
  date_create?: string;
  date_finish?: string;
  date_update?: string;
  final_result?: number;
  id?: number;
  moderator_login?: string;
  molar_volume?: number;
  status?: string;
}

export interface DsLoginResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: DsUsers;
}

export interface DsUsers {
  id?: number;
  is_moderator?: boolean;
  login?: string;
  name?: string;
}

export interface HandlerLoginRequest {
  /** @example "user123" */
  login: string;
  /** @example "password123" */
  password: string;
}

export interface HandlerLoginResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: DsUsers;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Расчёт горения топлива
 * @version 1.0
 * @license AS IS (NO WARRANTY)
 * @baseUrl http://localhost:8080
 * @contact Репозиторий (https://github.com/RogeReksuby/web_rip)
 *
 * Система для формирования и модерации заявок на расчёт параметров горения топлива. Позволяет пользователям добавлять топливо в заявку, заполнять молярный объём, а модераторам — проверять и утверждать расчёты.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Возвращает список расчетов горения с возможностью фильтрации. Обычные пользователи видят только свои расчеты, модераторы видят все расчеты в системе.
     *
     * @tags Combustions
     * @name CombustionsList
     * @summary Получить список расчетов горения
     * @request GET:/api/combustions
     * @secure
     */
    combustionsList: (
      query?: {
        /** Фильтр по статусу расчета */
        status?:
          | "черновик"
          | "сформирован"
          | "завершён"
          | "отклонён"
          | "удалён";
        /** Фильтр по дате создания (начало периода в формате DD.MM.YYYY) */
        start_date?: string;
        /** Фильтр по дате создания (конец периода в формате DD.MM.YYYY) */
        end_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        Record<string, DsCombustionResponse[]>,
        Record<string, string>
      >({
        path: `/api/combustions`,
        method: "GET",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет активную (черновик) заявку на расчёт горения текущего пользователя. Заявка определяется автоматически по ID пользователя.
     *
     * @tags Combustions
     * @name CombustionsDelete
     * @summary Удалить текущую заявку на расчёт горения
     * @request DELETE:/api/combustions
     * @secure
     */
    combustionsDelete: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/combustions`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает ID текущей активной заявки и количество добавленных топлив (услуг) для авторизованного пользователя.
     *
     * @tags Combustions
     * @name CombustionsCartIconList
     * @summary Получить данные для иконки корзины расчёта горения
     * @request GET:/api/combustions/cart-icon
     * @secure
     */
    combustionsCartIconList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/combustions/cart-icon`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает детальную информацию о конкретном расчете горения включая список используемого топлива
     *
     * @tags Combustions
     * @name CombustionsDetail
     * @summary Получить детали расчета горения по ID
     * @request GET:/api/combustions/{id}
     * @secure
     */
    combustionsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/combustions/${id}`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет значение молярного объема для расчета горения. Доступно только для расчетов в статусе "черновик".
     *
     * @tags Combustions
     * @name CombustionsUpdate
     * @summary Обновить молярный объем расчета горения
     * @request PUT:/api/combustions/{id}
     * @secure
     */
    combustionsUpdate: (
      id: number,
      input: Record<string, number>,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/combustions/${id}`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит расчет горения из статуса "черновик" в статус "сформирован". Расчет должен содержать хотя бы одно топливо и заполненный молярный объем.
     *
     * @tags Combustions
     * @name CombustionsFormUpdate
     * @summary Сформировать расчет горения
     * @request PUT:/api/combustions/{id}/form
     * @secure
     */
    combustionsFormUpdate: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/combustions/${id}/form`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Модератор может завершить (одобрить) или отклонить расчёт горения. Требуется роль модератора.
     *
     * @tags Combustions
     * @name CombustionsModerateUpdate
     * @summary Завершить или отклонить расчёт горения
     * @request PUT:/api/combustions/{id}/moderate
     * @secure
     */
    combustionsModerateUpdate: (
      id: number,
      request: {
        is_complete?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/combustions/${id}/moderate`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет объём указанного топлива в текущей активной заявке пользователя.
     *
     * @tags Fuel-combustions
     * @name FuelCombustionsUpdate
     * @summary Обновить объём топлива в заявке
     * @request PUT:/api/fuel-combustions
     * @secure
     */
    fuelCombustionsUpdate: (
      request: {
        fuel_id?: number;
        fuel_volume?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuel-combustions`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет указанное топливо из текущей активной заявки пользователя. Топливо задаётся через query-параметр fuel_id.
     *
     * @tags Fuel-combustions
     * @name FuelCombustionsDelete
     * @summary Удалить топливо из заявки на расчёт горения
     * @request DELETE:/api/fuel-combustions
     * @secure
     */
    fuelCombustionsDelete: (
      query: {
        /**
         * ID топлива для удаления
         * @example 5
         */
        fuel_id: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuel-combustions`,
        method: "DELETE",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает все виды топлива. Поддерживается фильтрация по названию через query-параметр ?title=...
     *
     * @tags Fuels
     * @name FuelsList
     * @summary Получить список топлива
     * @request GET:/api/fuels
     */
    fuelsList: (
      query?: {
        /** Фильтр по названию топлива (частичное совпадение) */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, any>({
        path: `/api/fuels`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Создаёт новую запись топлива. Обязательные поля: title, heat. Остальные — опциональны. Требуется роль модератора.
     *
     * @tags Fuels
     * @name FuelsCreate
     * @summary Создать новое топливо
     * @request POST:/api/fuels
     * @secure
     */
    fuelsCreate: (
      request: {
        density?: number;
        full_desc?: string;
        heat?: number;
        is_gas?: boolean;
        molar_mass?: number;
        short_desc?: string;
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuels`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о топливе по указанному идентификатору. Доступен без авторизации.
     *
     * @tags Fuels
     * @name FuelsDetail
     * @summary Получить данные топлива по ID
     * @request GET:/api/fuels/{id}
     */
    fuelsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuels/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Частично обновляет информацию о топливе по указанному ID. Все поля опциональны — можно отправить только те, что нужно изменить. Требуется роль модератора.
     *
     * @tags Fuels
     * @name FuelsUpdate
     * @summary Обновить данные топлива
     * @request PUT:/api/fuels/{id}
     * @secure
     */
    fuelsUpdate: (
      id: number,
      request: {
        card_image?: string;
        full_desc?: string;
        heat?: number;
        is_gas?: boolean;
        molar_mass?: number;
        short_desc?: string;
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuels/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет запись топлива по указанному ID. Требуется роль модератора. Выполняется мягкое удаление (запись помечается как удалённая).
     *
     * @tags Fuels
     * @name FuelsDelete
     * @summary Удалить топливо
     * @request DELETE:/api/fuels/{id}
     * @secure
     */
    fuelsDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuels/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет указанное топливо в текущую активную заявку (корзину) авторизованного пользователя.
     *
     * @tags Fuels
     * @name FuelsAddToCombCreate
     * @summary Добавить топливо в заявку на расчёт горения
     * @request POST:/api/fuels/{id}/add-to-comb
     * @secure
     */
    fuelsAddToCombCreate: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuels/${id}/add-to-comb`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Загружает изображение для указанного топлива. Требуется роль модератора. Файл должен быть передан в поле 'image' формы.
     *
     * @tags Fuels
     * @name FuelsImageCreate
     * @summary Загрузить изображение для топлива
     * @request POST:/api/fuels/{id}/image
     * @secure
     */
    fuelsImageCreate: (
      id: number,
      data: {
        /** Файл изображения (JPEG, PNG) */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/fuels/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Выполняет вход пользователя в систему и возвращает JWT токен для доступа к защищенным endpoint'ам
     *
     * @tags Users
     * @name UsersLoginCreate
     * @summary Аутентификация пользователя
     * @request POST:/api/users/login
     */
    usersLoginCreate: (
      request: HandlerLoginRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerLoginResponse,
        {
          description?: string;
          status?: string;
        }
      >({
        path: `/api/users/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет JWT токен в черный список
     *
     * @tags Users
     * @name UsersLogoutCreate
     * @summary Выход пользователя
     * @request POST:/api/users/logout
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/api/users/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает данные профиля авторизованного пользователя (без пароля и других служебных полей).
     *
     * @tags Users
     * @name UsersProfileList
     * @summary Получить профиль текущего пользователя
     * @request GET:/api/users/profile
     * @secure
     */
    usersProfileList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/users/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет указанные поля профиля текущего пользователя. Все поля опциональны — можно отправить только те, что нужно изменить.
     *
     * @tags Users
     * @name UsersProfileUpdate
     * @summary Частично обновить профиль пользователя
     * @request PUT:/api/users/profile
     * @secure
     */
    usersProfileUpdate: (
      request: {
        is_moderator?: boolean;
        login?: string;
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/api/users/profile`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт нового пользователя и возвращает JWT-токен для авторизации. Поле is_moderator игнорируется — только администратор может назначать модераторов.
     *
     * @tags Users
     * @name UsersRegisterCreate
     * @summary Регистрация нового пользователя
     * @request POST:/api/users/register
     */
    usersRegisterCreate: (
      request: {
        is_moderator?: boolean;
        login?: string;
        name?: string;
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsLoginResponse, Record<string, string>>({
        path: `/api/users/register`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
