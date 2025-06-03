"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiToken = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * 获取API Token
 * @returns API Token字符串
 */
const getApiToken = () => {
    const token = process.env.STRAPI_API_TOKEN;
    if (!token) {
        throw new Error('STRAPI_API_TOKEN 环境变量未设置');
    }
    return token;
};
exports.getApiToken = getApiToken;
/**
 * Strapi API 服务类 - 处理与 Strapi 后端的所有 API 交互
 */
class StrapiApiService {
    /**
     * 构造函数 - 初始化 API 客户端
     * @param baseUrl Strapi实例的基础URL，如 "http://localhost:1337"
     * @param token API 令牌，如果不提供，将使用 getApiToken 获取
     */
    constructor(baseUrl, token) {
        this.token = token || (0, exports.getApiToken)();
        this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除尾部斜杠
        // 创建 axios 实例
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        });
        // 添加响应拦截器进行错误处理
        this.client.interceptors.response.use(response => response, error => {
            var _a;
            console.error('API 请求错误:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            return Promise.reject(error);
        });
    }
    /**
     * 获取 API Token
     * @returns 当前使用的 API Token
     */
    getToken() {
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
    async getEntry(uid, entryId, locale = null, populate = "*") {
        var _a;
        try {
            const url = `/api/${uid}/${entryId}`;
            // 构建请求参数
            const params = {
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
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
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
    async publishEntry(uid, entryId, locale, data, draft = true) {
        var _a;
        try {
            const url = `/api/${uid}/${entryId}`;
            // 构建请求参数和数据
            const params = {
                locale: locale,
                status: draft ? 'draft' : 'publish'
            };
            const payload = {
                data: data
            };
            const response = await this.client.put(url, payload, { params });
            return (_a = response.data.data) === null || _a === void 0 ? void 0 : _a.title;
        }
        catch (error) {
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
    async getEntryFromSlug(uid, slug, locale = null, populate = null) {
        try {
            const url = `/api/${uid}`;
            // 构建请求参数
            const params = {
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
        }
        catch (error) {
            console.error('根据slug获取条目失败:', error);
            throw error;
        }
    }
    /**
     * 获取所有支持的语言配置
     * @returns 语言代码列表
     */
    async getAllLocales() {
        try {
            const url = `/api/i18n/locales`;
            const response = await this.client.get(url);
            return response.data.map((locale) => locale.code);
        }
        catch (error) {
            console.error('获取语言配置失败:', error);
            throw error;
        }
    }
}
exports.default = StrapiApiService;
