schorlarship management website
====

vue.js + node.js + mysql


DEVELOP
--------

* 安装mysql, node, npm等
* ``git clone https://github.com/walkerning/schorlarshipWeb``
* ``src/config/database.js``文件里是development模式下database连接的配置文件, 可以修改, 其中`user`和`database`需要提前mysql client登陆并创建好.
* ``src/config/server.js``文件里是development模式下server监听的host和port配置.
* ``npm install`` 安装项目依赖
* ``npm install -g grunt-cli``
* ``grunt database``: 初始化数据库, 建立表格, 插入实验数据
* ``grunt dev``: 运行development server

* please!!! 在commit之前运行`jsfmt`... 实在不能忍格式不对...

API
-----------

见[API文档](doc/api.md)

Some issues
-----------

* There is a little bug in grunt plugin grunt-express-server, see [issue](https://github.com/ericclemmons/grunt-express-server/issues/105), still don't know what cause the stop method being called. But seems it's [this statement](https://github.com/ericclemmons/grunt-express-server/blob/eced2b73817fc4bf9cf73fce65998c7200794730/tasks/lib/server.js#L135) cause the error: `Fatal error: Cannot read property 'hardStop' of null` 

Deploy
-----------

* 安装mysql-server, node, npm等
* `npm install -g grunt`
* `npm install`
* 从环境变量读数据库名, 数据库用户名, 密码等, 需要设置:
    * `JXJ_DATABASE`
    * `JXJ_USERNAME`
    * `JXJ_PASSWORD`
* Database migration, import from sql or `grunt remigration initdb`. 但是现在的migration代码里的初始值并不是对的...
* 运行之前必须设置`JXJ_ATTACHMENT_BASENAME`环境变量, 为存放公告附件的目录.
* grunt prod
* NGINX配置, 给`/auth`和`/api` location设置`proxy_pass`到app server, serve静态attachments的目录.
