/**
 * 生产环境
 */
;(function () {
  window.SITE_CONFIG = {};

  let target,num
  num = 1
switch(num){
  case 1 :
    target = 'https://58hongren.com/renren-fast/'
    break;
    case 2 : 
    target = 'http://47.111.107.98:9000/renren-fast/'
    break;
    case 3 : 
    target = 'http://192.168.110.185:9000/renren-fast/'
    break;
}
  // api接口请求地址
  window.SITE_CONFIG['baseUrl'] = target;
  //https://58hongren.com/renren-fast
  // http://47.111.107.98:9000/renren-fast/
  // http://192.168.110.185:9000/renren-fast/
  // cdn地址 = 域名 + 版本号
  window.SITE_CONFIG['domain']  = './'; // 域名
  window.SITE_CONFIG['version'] = '';   // 版本号(年月日时分)
  window.SITE_CONFIG['cdnUrl']  = window.SITE_CONFIG.domain + window.SITE_CONFIG.version;
})();
