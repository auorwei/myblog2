import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * 请求参数接口
 */
interface RequestParams {
  [key: string]: any;
}

/**
 * 入口信息接口
 */
interface EntryResponse {
  documentId: string;
  [key: string]: any;
}

/**
 * 语言配置接口
 */
interface Locale {
  code: string;
  name: string;
  isDefault: boolean;
}

/**
 * 获取API Token
 * @returns API Token字符串
 */
export const getApiToken = (): string => {
  const token = process.env.STRAPI_API_TOKEN;
  if (!token) {
    throw new Error('STRAPI_API_TOKEN 环境变量未设置');
  }
  return token;
};

/**
 * Strapi API 服务类 - 处理与 Strapi 后端的所有 API 交互
 */
class StrapiApiService {
  private client: AxiosInstance;
  private token: string;
  private baseUrl: string;

  /**
   * 构造函数 - 初始化 API 客户端
   * @param baseUrl Strapi实例的基础URL，如 "http://localhost:1337"
   * @param token API 令牌，如果不提供，将使用 getApiToken 获取
   */
  constructor(baseUrl: string, token?: string) {
    this.token = token || getApiToken();
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除尾部斜杠
    
    // 创建 axios 实例
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    // 添加响应拦截器进行错误处理
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('API 请求错误:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 获取 API Token
   * @returns 当前使用的 API Token
   */
  getToken(): string {
    return this.token;
  }

  /**
   * 根据 entry_id 和 locale 获取条目（同时包含草稿和已发布）
   * @param uid 内容类型的路由名（复数），如 "articles"
   * @param entryId 条目的ID
   * @param locale 语言代码，如 "zh-Hant"，默认为 null
   * @param populate 关联字段填充参数，如 "*"，默认为 "*"
   * @returns 条目详细信息或 null
   */
  async getEntry(
    uid: string, 
    entryId: string, 
    locale: string | null = null, 
    populate: string | null = "*"
  ): Promise<any | null> {
    try {
      const url = `/api/${uid}/${entryId}`;
      
      // 构建请求参数
      const params: RequestParams = {
        status: 'draft' // 同时获取草稿和已发布版本
      };
      
      if (locale) {
        params.locale = locale;
      }
      
      if (populate) {
        params.populate = populate;
      }
      
      const response = await this.client.get(url, { params });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('获取条目失败:', error);
      throw error;
    }
  }

  /**
   * 发布或保存条目草稿
   * @param uid 内容类型的路由名（复数），如 "articles"
   * @param entryId 条目的ID
   * @param locale 语言代码，如 "zh-Hant"
   * @param data 要更新的数据
   * @param draft 是否为草稿，默认为 true
   * @returns 发布/保存结果
   */
  async publishEntry(
    uid: string, 
    entryId: string, 
    locale: string,
    data: any,
    draft: boolean = true
  ): Promise<any> {
    try {
      const url = `/api/${uid}/${entryId}`;
      
      // 构建请求参数和数据
      const params: RequestParams = {
        locale: locale,
        status: draft ? 'draft' : 'publish'
      };
      
      const payload = {
        data: data
      };
      
      const response = await this.client.put(url, payload, { params });
      return response.data.data?.title;
    } catch (error) {
      console.error('发布/保存条目失败:', error);
      throw error;
    }
  }

  /**
   * 根据 slug 和 locale 获取条目（同时包含草稿和已发布）
   * @param uid 内容类型的路由名（复数），如 "articles"
   * @param slug 条目的 slug
   * @param locale 语言代码，如 "zh-Hant"，默认为 null
   * @param populate 关联字段填充参数，如 "*"，默认为 null
   * @returns 条目详细信息或 null
   */
  async getEntryFromSlug(
    uid: string,
    slug: string,
    locale: string | null = null,
    populate: string | null = null
  ): Promise<any | null> {
    try {
      const url = `/api/${uid}`;
      
      // 构建请求参数
      const params: RequestParams = {
        status: 'draft', // 同时获取草稿和已发布版本
        'filters[slug][$eq]': slug
      };
      
      if (locale) {
        params.locale = locale;
      }
      
      if (populate) {
        params.populate = populate;
      }
      
      const response = await this.client.get(url, { params });
      const items = response.data.data || [];
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('根据slug获取条目失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有支持的语言配置
   * @returns 语言代码列表
   */
  async getAllLocales(): Promise<string[]> {
    try {
      const url = `/api/i18n/locales`;
      const response = await this.client.get(url);
      return response.data.map((locale: any) => locale.code);
    } catch (error) {
      console.error('获取语言配置失败:', error);
      throw error;
    }
  }
}

export default StrapiApiService; 