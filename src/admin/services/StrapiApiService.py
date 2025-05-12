# coding:utf-8
# author:Wayne
# date:2023-xx-xx
import requests
from typing import Optional, Dict, Any


class StrapiApiService(object):
    """
    A simple Python client for Strapi v5 REST API.
    Supports content retrieval, creation, update, and publishing.
    """

    def __init__(self, base_url: str, jwt: str):
        """
        Initialize the service with Strapi base URL and JWT token.

        Args:
            base_url (str): The base URL of the Strapi instance, e.g. "http://localhost:1337".
            jwt (str): A valid JWT for Strapi API (from /auth/local).
        """
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "Authorization": f"Bearer {jwt}",
            "Content-Type": "application/json"
        }

    def get_entry(
            self,
            uid: str,
            entry_id: str,
            locale: Optional[str] = None,
            populate: Optional[str] = "*"
    ) -> Optional[Dict[str, Any]]:
        """
        根据 entry_id 和 locale 获取条目（同时包含草稿和已发布）。

        使用详情接口并添加 publicationState=preview 参数即可同时获取草稿和已发布版本。

        Args:
            uid (str): 内容类型的路由名（复数），如 "articles"。
            entry_id (int): 条目数字 ID。
            locale (Optional[str]): 语言代码，如 "zh-Hant"。
            populate (Optional[str]): 关联字段填充参数，如 "*"。

        Returns:
            Optional[Dict[str, Any]]: 返回条目 data 或 None。
        """
        url = f"{self.base_url}/api/{uid}/{entry_id}?status=draft"
        params: Dict[str, Any] = {}
        if locale:
            params['locale'] = locale
        if populate:
            params['populate'] = populate

        resp = requests.get(url, headers=self.headers, params=params)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json().get('data')

    def publish_entry(
            self,
            uid: str,
            entry_id: str,
            locale: str,
            data: Dict[str, Any],
            draft: bool = True,
    ) -> Dict[str, Any]:

        """
        Publish a draft entry (requires draftAndPublish enabled).

        Args:
            uid (str): The content-type UID.
            entry_id (int): The numeric ID of the entry.
            locale (Optional[str]): I18N locale code to target.
            data:data for update
            draft: publish or just draft

        Returns:
            Dict[str, Any]: The JSON response from Strapi.
        """
        url = f"{self.base_url}/api/{uid}/{entry_id}"
        params = dict()
        params['locale'] = locale

        if draft:
            params['status'] = 'draft'
        else:
            params['status'] = 'publish'
        payload = {
            "data": data
        }

        response = requests.put(url, headers=self.headers, params=params, json=payload)
        response.raise_for_status()
        return response.json().get('data').get('title')

    def get_entry_from_slug(
            self,
            uid: str,
            slug: str,
            locale: Optional[str] = None,
            populate: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        根据 slug 和 locale 获取条目（同时包含草稿和已发布）。

        Args:
            uid (str): 内容类型的路由名（复数），如 "articles"。
            slug (str): 条目的 slug。
            locale (Optional[str]): 语言代码，如 "zh-Hant"。
            populate (Optional[str]): 关联字段填充参数，如 "*"。

        Returns:
            Optional[Dict[str, Any]]: 返回条目 data 或 None。
        """
        url = f"{self.base_url}/api/{uid}?status=draft"
        # url = f"{self.base_url}/api/{uid}?filters[slug][$eq]={slug}&populate=*"
        params: Dict[str, Any] = {
            # status=draft 可同时获取草稿和已发布版本
            'status': 'draft',
            # 过滤 slug
            'filters[slug][$eq]': slug
        }
        if locale:
            params['locale'] = locale
        if populate:
            params['populate'] = populate

        resp = requests.get(url, headers=self.headers, params=params)
        resp.raise_for_status()
        items = resp.json().get('data', [])
        return items[0] if items else None

    def get_all_locales(self):
        """
        Fetch all supported locales configured in Strapi.

        Returns:
            List[Dict[str, Any]]: A list of locale objects (code, name, isDefault, etc.).
        """
        url = f"{self.base_url}/api/i18n/locales"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()

        return [i.get('code') for i in response.json()]


if __name__ == '__main__':
    JWT = '3dbb23dd3d19da0d24cc29a46c5ab7a73d242a3e2054f3ca6b932f9bf50c2b5bb32cde3ab53412c5f8dfd2dceb5aa1b4e03efaa27e62c27d0312443bb9875c6b5b72e3f47237148dcea1bd0b7dbc74b67064f54ef56897d5ec0b6376a8e44339b398e0930161d7292bcb16b279a4ed9721cc44988344474c0f1a12e98389cd88'
    base_url = 'http://127.0.0.1:1337'
    service = StrapiApiService(base_url=base_url, jwt=JWT)

    # category_id = 'd06baauqntszupo9h0f7f44w'
    # article_id = 'i9fi5aekugf63imc8tbbcl4s'
    # # res = service.get_entry(uid='articles', entry_id=article_id, locale='en')
    # # print(res)
    #
    # res = service.get_entry_from_slug(slug='bitcoin', locale='en', uid='articles')
    # print(res)

    all_locales = service.get_all_locales()
    print(all_locales)

# Example usage:
# service = StrapiApiService("http://localhost:1337", jwt="YOUR_JWT_HERE")
# article = service.get_entry("api::article.article", 1, locale="en", populate="*")
# print(article)
# new_entry = service.create_entry("api::article.article", {"title": "Hello"}, locale="en", draft=True)
# updated = service.update_entry("api::article.article", 2, {"title": "Updated"})
# published = service.publish_entry("api::article.article", 2)
