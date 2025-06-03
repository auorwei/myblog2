"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlParseService = void 0;
/**
 * HTML解析服务 - 用于处理HTML内容的解析、拆分和重组
 */
class HtmlParseService {
    /**
     * 拆解：移除所有属性，返回简化后的 HTML 和属性列表
     * @param html 原始HTML字符串
     * @returns [简化后的HTML, 属性列表]
     */
    static decompose(html) {
        const tokens = html.split(/(<[^>]+>)/);
        const attrList = [];
        const stripped = [];
        const tagRe = /<\s*(\/?)([^\s/>]+)([^>]*)>/;
        for (const t of tokens) {
            const m = t.match(tagRe);
            if (m) {
                const [, slash, tag, rest] = m;
                let raw = rest.trim();
                const selfClosing = raw.endsWith('/');
                if (selfClosing) {
                    raw = raw.slice(0, -1).trim();
                }
                // 存下原始属性和自闭合信息
                attrList.push([slash, tag, raw, selfClosing]);
                // 生成无属性标签
                stripped.push(`<${slash}${tag}${selfClosing ? " /" : ""}>`);
            }
            else {
                stripped.push(t);
            }
        }
        return [stripped.join(''), attrList];
    }
    /**
     * 重组：只对"和原始标签名匹配"的标签插入属性
     * @param translatedHtml 翻译后的HTML
     * @param attrList 属性列表(来自decompose)
     * @returns 重组后的HTML
     */
    static recompose(translatedHtml, attrList) {
        const tokens = translatedHtml.split(/(<[^>]+>)/);
        const recomposed = [];
        let idx = 0;
        const tagRe = /<\s*(\/?)([^\s/>]+)([^>]*)>/;
        for (const t of tokens) {
            const m = t.match(tagRe);
            if (m && idx < attrList.length) {
                const [, slash, tag] = m;
                const [origSlash, origTag, attrs, selfClosing] = attrList[idx];
                // 只有标签名和闭合类型都"对得上号"才插属性
                if (slash === origSlash && tag === origTag) {
                    if (attrs) {
                        // 恢复成 <tag attrs> 或 <tag attrs/>
                        const tail = selfClosing ? '/' : '';
                        recomposed.push(`<${slash}${tag} ${attrs}${tail}>`);
                    }
                    else {
                        const tail = selfClosing ? '/' : '';
                        recomposed.push(`<${slash}${tag}${tail}>`);
                    }
                    idx++;
                }
                else {
                    // 这可能是翻译引擎新增/修改的标签，原样保留
                    recomposed.push(t);
                }
            }
            else {
                // 普通文本或已耗尽 attrList
                recomposed.push(t);
            }
        }
        return recomposed.join('');
    }
    /**
     * 清理HTML，移除不必要的属性，适配Strapi内容管理
     * @param html 原始HTML
     * @returns 清理后的HTML
     */
    static cleanForStrapi(html) {
        // 1) 去掉所有 class、id、data-* 属性
        let cleaned = html.replace(/\s+(?:class|id|data-[\w-]+)="[^"]*"/g, '');
        // 2) 删除 <figure>、<svg> 及其全部内容
        cleaned = cleaned.replace(/<(figure|svg)[\s\S]*?<\/\1>/g, '');
        // 3) 删除空的 <div> 容器
        cleaned = cleaned.replace(/<div>\s*<\/div>/g, '');
        // 4) 修正多余的 </p></p>
        cleaned = cleaned.replace(/<\/p><\/p>/g, '</p>');
        return cleaned;
    }
}
exports.HtmlParseService = HtmlParseService;
