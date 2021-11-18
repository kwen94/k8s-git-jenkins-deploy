const { override, fixBabelImports, addLessLoader} = require('customize-cra');
const aliyunTheme =  require('@ant-design/aliyun-theme');


module.exports = override(
   fixBabelImports('import', {
     libraryName: 'antd',
     libraryDirectory: 'es',
    style: 'css',
   }),
   addLessLoader({
      javascriptEnabled: true,
      // modifyVars: {'@primary-color': '#1DA57A'},
      // modifyVars: {'@primary-color': '#1890FF'},
      modifyVars: aliyunTheme,
  }),
);