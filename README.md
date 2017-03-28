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