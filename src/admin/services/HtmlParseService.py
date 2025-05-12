# coding:utf-8
# author:Wayne
# date:2025-05-08

import re


class HtmlParseServices(object):

    @staticmethod
    def decompose(html: str):
        """
        拆解：移除所有属性，返回简化后的 HTML 和
        [(slash, tag, attrs, self_closing), …] 列表
        """
        tokens = re.split(r'(<[^>]+>)', html)
        attr_list = []
        stripped = []
        tag_re = re.compile(r'<\s*(/?)([^\s/>]+)([^>]*)>')

        for t in tokens:
            m = tag_re.match(t)
            if m:
                slash, tag, rest = m.groups()
                raw = rest.strip()
                self_closing = raw.endswith('/')
                if self_closing:
                    raw = raw[:-1].strip()
                # 存下原始属性和自闭合信息
                attr_list.append((slash, tag, raw, self_closing))
                # 生成无属性标签
                stripped.append(f'<{slash}{tag}{" /" if self_closing else ""}>')
            else:
                stripped.append(t)

        return ''.join(stripped), attr_list

    @staticmethod
    def recompose(translated_html: str, attr_list):
        """
        重组：只对“和原始标签名匹配”的标签插入属性，
        对翻译时新增的标签原样保留，不抛错。
        """
        tokens = re.split(r'(<[^>]+>)', translated_html)
        recomposed = []
        idx = 0
        tag_re = re.compile(r'<\s*(/?)([^\s/>]+)([^>]*)>')

        for t in tokens:
            m = tag_re.match(t)
            if m and idx < len(attr_list):
                slash, tag, _ = m.groups()
                orig_slash, orig_tag, attrs, self_closing = attr_list[idx]
                # 只有标签名和闭合类型都“对得上号”才插属性
                if slash == orig_slash and tag == orig_tag:
                    if attrs:
                        # 恢复成 <tag attrs> 或 <tag attrs/>
                        tail = '/' if self_closing else ''
                        recomposed.append(f'<{slash}{tag} {attrs}{tail}>')
                    else:
                        tail = '/' if self_closing else ''
                        recomposed.append(f'<{slash}{tag}{tail}>')
                    idx += 1
                else:
                    # 这可能是翻译引擎新增/修改的标签，原样保留
                    recomposed.append(t)
            else:
                # 普通文本或已耗尽 attr_list
                recomposed.append(t)

        # （可选）这里可检查 idx == len(attr_list) 来确认所有原始标签都被重组
        return ''.join(recomposed)

    @staticmethod
    def clean_for_strapi(html: str) -> str:
        """
        去掉不必要的属性，有的内容是从网页粘贴的，保留原来的属性会影响展示
        style样式需要保留
        """
        # 1) 去掉所有 class、id、data-* 属性
        html = re.sub(r'\s+(?:class|id|data-[\w-]+)="[^"]*"', '', html)
        # 2) 删除 <figure>、<svg> 及其全部内容
        html = re.sub(r'<(figure|svg)[\s\S]*?</\1>', '', html)
        # 3) 删除空的 <div> 容器
        html = re.sub(r'<div>\s*</div>', '', html)
        # 4) 修正多余的 </p></p>
        html = html.replace('</p></p>', '</p>')
        return html
