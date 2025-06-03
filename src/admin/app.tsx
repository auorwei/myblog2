// src/admin/app.tsx
import React from 'react';
import type { StrapiApp } from '@strapi/strapi/admin';

import TranslateButton from './components/TranslateButton';
import InsertLinksButton from './components/InsertLinksButton';
import CopyInfo from './components/CopyInfo';

export default {
  config: {
    locales: ["en", "fr", "de", "es",'zh-Hans','zh-Hant','ru'],
  },

  bootstrap(app: StrapiApp) {
    const cm = app.getPlugin('content-manager') as any;

      // 给编辑页右侧链接区／侧边栏都可以
      cm.injectComponent('editView', 'right-links', {
        name: 'translate-button',
        Component: TranslateButton,
      });

    

    

    // — 或者用侧边栏 API —
    //cm.apis.addEditViewSidePanel([TranslatePanel, InsertLinksPanel]);
  },
};

