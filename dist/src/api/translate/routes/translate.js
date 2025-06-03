"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        // 获取支持的语言列表
        {
            method: 'GET',
            path: '/translate/locales',
            handler: 'translate.getLocales',
            config: {
                auth: false,
            },
        },
        // 翻译内容
        {
            method: 'POST',
            path: '/translate/content',
            handler: 'translate.translateContent',
            config: {
                auth: false,
            },
        },
    ],
};
