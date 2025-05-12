# coding:utf-8
# author:Wayne
# date:2023-xx-xx
# coding: utf-8
# author: Wayne (改写版)
# date: 2025-05-08

import os
import requests
from dotenv import load_dotenv, find_dotenv

class TranslationService(object):
    """
    原生 requests 实现的 DeepL HTML 翻译服务：
      1. 读取 HTML
      2. 拆分过长的 HTML 段落
      3. 逐段调用 DeepL HTTP API 翻译
    """

    def __init__(self, auth_key: str, max_len: int = 30000):
        """
        Args:
            auth_key (str): DeepL API authentication key
            max_len (int): 单次请求最大字符数（含标签），超出则拆分
        """
        self.auth_key = auth_key
        # DeepL API 翻译端点
        self.api_url = "https://api.deepl.com/v2/translate"
        self.max_len = max_len

    def _chunk_html(self, html: str):
        """
        按 </p> 标签拆分 HTML，确保每块长度不超过 max_len
        """
        parts = html.split("</p>")
        chunks, buffer = [], ""
        for part in parts:
            fragment = part + "</p>"
            if len(buffer) + len(fragment) > self.max_len:
                chunks.append(buffer)
                buffer = fragment
            else:
                buffer += fragment
        if buffer:
            chunks.append(buffer)
        return chunks

    def translate(self, html: str, target_lang: str = "ZH"):
        """
        翻译整段 HTML。
        Returns:
            str: 翻译后的 HTML 拼接结果
        """
        chunks = self._chunk_html(html)
        translated_chunks = []

        for chunk in chunks:
            data = {
                "auth_key": self.auth_key,
                "text": chunk,
                "target_lang": target_lang,
                # HTML 标签处理
                "tag_handling": "html",
                # 不翻译 <code> 和 <pre> 中的内容
                "ignore_tags": "code,pre",
                # 将这几个标签作为拆分句子的依据
                "splitting_tags": "p,li,div",
                # 这些标签内不拆分句子
                "non_splitting_tags": "span,strong,em",
                # 保持原始格式
                "preserve_formatting": 1
            }
            resp = requests.post(self.api_url, data=data)
            resp.raise_for_status()
            result = resp.json()
            # 取第一个翻译结果的 text 字段
            translated_chunks.append(result["translations"][0]["text"])

        return "".join(translated_chunks)


if __name__ == "__main__":
    # 加载 .env 中的 DEEPL_AUTH_KEY
    load_dotenv(find_dotenv())
    AUTH_KEY = os.getenv("DEEPL_AUTH_KEY")

    service = TranslationService(AUTH_KEY)
    html_input = '<h1>PHP是世界上最好的语言</h1>'
    translated = service.translate(html_input, target_lang="RU")
    print(translated)
