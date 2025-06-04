import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      host: '0.0.0.0',
      port: 1337,
      // 允许外部域名访问
      allowedHosts: [
        'learn.waynechen.xyz',
        'localhost',
        '127.0.0.1',
        '0.0.0.0'
      ],
      // 禁用主机检查（在可信环境中使用）
      disableHostCheck: true,
    },
    // 预览服务器配置（用于生产构建预览）
    preview: {
      host: '0.0.0.0',
      port: 1337,
    }
  });
}; 