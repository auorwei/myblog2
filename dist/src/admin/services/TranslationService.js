"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
/**
 * 翻译服务 - 使用DeepL API翻译HTML内容
 *
 * 完整工作流程：
 * 1. 读取HTML
 * 2. 将长HTML分块为DeepL安全的片段
 * 3. 通过DeepL API翻译每个块
 */
const axios_1 = __importDefault(require("axios"));
class TranslationService {
    /**
     * 初始化翻译服务
     * @param authKey DeepL API认证密钥
     * @param maxLen 每个翻译块的最大长度，默认30000字符
     */
    constructor(authKey, maxLen = 30000) {
        this.authKey = authKey;
        this.apiUrl = "https://api.deepl.com/v2/translate";
        this.maxLen = maxLen;
    }
    /**
     * 将HTML切分为较小的块，以适应DeepL API的限制
     * @param html 原始HTML内容
     * @returns 切分后的HTML块数组
     * @private
     */
    _chunkHtml(html) {
        const parts = html.split('</p>');
        const chunks = [];
        let buffer = '';
        for (const part of parts) {
            const fragment = part + '</p>';
            if (buffer.length + fragment.length > this.maxLen) {
                chunks.push(buffer);
                buffer = fragment;
            }
            else {
                buffer += fragment;
            }
        }
        if (buffer) {
            chunks.push(buffer);
        }
        return chunks;
    }
    /**
     * 翻译HTML内容，保持HTML标签结构
     * @param html 原始HTML内容
     * @param targetLang 目标语言代码，默认为中文
     * @returns 翻译后的HTML
     */
    async translate(html, targetLang = 'ZH') {
        // 1. 将HTML切分为块
        const chunks = this._chunkHtml(html);
        // 2. 翻译每个块
        const translatedChunks = [];
        for (const chunk of chunks) {
            try {
                const data = {
                    auth_key: this.authKey,
                    text: chunk,
                    target_lang: targetLang,
                    // HTML 标签处理
                    tag_handling: 'html',
                    // 不翻译 <code> 和 <pre> 中的内容
                    ignore_tags: 'code,pre',
                    // 将这几个标签作为拆分句子的依据
                    splitting_tags: 'p,li,div',
                    // 这些标签内不拆分句子
                    non_splitting_tags: 'span,strong,em',
                    // 保持原始格式
                    preserve_formatting: 1
                };
                const response = await axios_1.default.post(this.apiUrl, data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                // 获取翻译结果
                translatedChunks.push(response.data.translations[0].text);
            }
            catch (error) {
                console.error('翻译块失败:', error);
                // 如果翻译失败，保留原始块
                translatedChunks.push(chunk);
            }
        }
        // 3. 合并所有翻译后的块
        return translatedChunks.join('');
    }
}
exports.TranslationService = TranslationService;
exports.default = TranslationService;
