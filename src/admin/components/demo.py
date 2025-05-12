# coding:utf-8
# author:Wayne
# date:2025-05-08
# 实现strapi一键从英文翻译到其他语种的功能。

from HtmlParseService import HtmlParseServices
from StrapiApiService import StrapiApiService
from TranslationService import TranslationService

if __name__ == '__main__':
    import os
    from dotenv import load_dotenv, find_dotenv

    load_dotenv(find_dotenv())
    AUTH_KEY = os.getenv("DEEPL_AUTH_KEY")
    STRAPI_JWT = os.getenv('STRAPI_JWT')
    STRAPI_BASE_URL = os.getenv('STRAPI_BASE_URL')

    strapi = StrapiApiService(base_url=STRAPI_BASE_URL, jwt=STRAPI_JWT)
    translator = TranslationService(AUTH_KEY)
    html_parse_service = HtmlParseServices()

    locales = strapi.get_all_locales()

    # 根据slug获取entry内容
    entry = strapi.get_entry_from_slug(slug='how-to-use-perpetural-futures-fast-order', locale='en', uid='articles',
                                       populate='*')
    title = entry.get('title')
    content = entry.get('content')
    category = entry.get('category')
    tags = entry.get('tags')
    slug = entry.get('slug')
    entry_id = entry.get('documentId')
    cover_picture = entry.get('coverPicture')
    if cover_picture:
        cover_picture_id = cover_picture.get('id')
    else:
        cover_picture_id = 1

    for locale in locales:
        if locale == 'en':
            continue
        # 获取本地化翻译
        article_html = f'<h1>{title}</h1>{content}'
        striped, attrs = html_parse_service.decompose(article_html)
        translated_html = translator.translate(html=striped, target_lang=locale)
        re_compose_html = html_parse_service.recompose(translated_html, attrs)
        final_html = html_parse_service.clean_for_strapi(re_compose_html)
        new_title, final_content = final_html.split('</h1>')
        final_title = new_title.replace('<h1>', '')

        # 获取tags信息
        local_tags_list = [i.get('documentId') for i in tags]

        # 构造请求信息
        paydata = {
            'slug': slug,
            'title': final_title,
            'content': final_content,
            'category': category.get('documentId'),
            'tags': local_tags_list,
            'coverPicture': {
                "connect": [
                    {"id": cover_picture_id}
                ]
            }
        }

        res = strapi.publish_entry(uid='articles', entry_id=entry_id, locale=locale, data=paydata, draft=True)
        print('发布成功', res)
