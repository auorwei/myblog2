# coding:utf-8
# author:Wayne
# date:2025-05-08


import deepl


class TranslationService(object):
    """
    Encapsulates the full workflow:
      1. Read HTML
      2. Chunk long HTML into DeepL-safe pieces
      3. Translate each chunk via DeepL API
    """

    def __init__(self, auth_key: str, max_len: int = 30000):
        self.translator = deepl.Translator(auth_key)
        self.max_len = max_len

    def _chunk_html(self, html: str):
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

        # 1. Chunk
        chunks = self._chunk_html(html)

        # 2. Translate each chunk
        translated_chunks = []
        for chunk in chunks:
            result = self.translator.translate_text(
                chunk,
                target_lang=target_lang,
                tag_handling="html",
                ignore_tags=["code", "pre"],
                splitting_tags=["p", "li", "div"],
                non_splitting_tags=["span", "strong", "em"],
                preserve_formatting=True
            )
            translated_chunks.append(result.text)

        return "".join(translated_chunks)


if __name__ == "__main__":
    import os
    from dotenv import load_dotenv, find_dotenv

    load_dotenv(find_dotenv())

    AUTH_KEY = os.getenv("DEEPL_AUTH_KEY")
    translator = TranslationService(AUTH_KEY)
    res = translator.translate('<h1>PHP是世界上最好的语言<h1>',target_lang='ru')
    print(res)
