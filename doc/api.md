client-server API设计
====
Resources
----
用户、荣誉、奖学金、表单、字段的JSON object表示, 除了少数属性外, 基本上与数据库里属性一一对应。需要注意的是: 表单是一个可由API访问的资源, 字段资源由后台逻辑inline的放在表单里返回。

>NOTATION: 
> * 属性用下划线命名法, 与Javascript的标准驼峰命名法并不一样。
> * 注释中标记了每个属性的类型, 有[required]标识的字段是必有的, 其它字段可能为空, 在此时v1 API设计为不返回该字段, 而不是返回null值。

### 用户 User
```javascript
{
    // Number[required]: id唯一标识用户
    "id": 1, 
    // Number[required]: 用户组id
    "group_id": 2,
    // String[required]: 入学年份
    "group": "2016", 
    // String[required]: 类型 - "undergraduate" / "graduate"
    "type": "undergraduate", 
    // String[required]: 名字
    "name": "张三", 
    // String[required]: 学号或者工作证号等
    "student_id": "2016011067", 
    // String: 邮箱
    "email": "xxxxxxxx@gmail.com", 
    // String: 班级
    "class": "无66", 
    // Number: 换算成百分制的GPA
    "gpa": 93.3, 
    // Number: 班级排名
    "class_rank": 1, 
    // Number: 年级排名
    "year_rank": 3, 
    // [String]: 该用户有的权限列表: login有效, apply可申请荣誉/奖学金, user用户管理, form表单管理,
    //           honor荣誉管理, scholar奖学金管理, user_honor用户-荣誉关系管理, user_scholar用户-奖学金关系管理, export学校对接
    "permissions": ["login"]
}
```

### 荣誉 Honor
```javascript
{
    // Number[required]: id唯一标识荣誉
    "id": 2, 
    // String[required]: 荣誉名字
    "name": "学业优秀奖", 
    // String[required]: 该荣誉的年份
    "year": "2017", 
    // String[required]: 该荣誉开始申请的时间(ISO format)
    "start_time": "2017-09-01T10:54:24.738793",  
    // String[required]: 该荣誉结束申请的时间(ISO format)
    "end_time": "2017-09-28T10:54:24.738793",
    // Number: 总名额数量, 不存在则代表直接由各个group的名额得到.
    // FIXME: 这个需要嘛?
    "quota": 15, 
    // Array(Object)[required]: 每个不同的group有多少个名额, 如果此列表为空,
    //                          代表无用户组可申请此荣誉
    "group_quota": [
        {
            "group_id": 2,
            "group": "2015",
            "type": "undergraduate",
            "quota": 10
        },
        {
	          "group_id": 3,
            "group": "2016",
            "type": "undergraduate",
            "quota": 4
        }
    ],
    // Number[required]: 申请该荣誉时需要填写的表单id
    "form_id": 4 
}
```

### 奖学金 Scholarship
```javascript
{
    // Number[required]: id唯一标识奖学金
    "id": 3,
    // String[required]: 奖学金名字
    "name": "国家奖学金",
    // String[required]: 该奖学金的年份
    "year": "2017", 
    // Number[required]: 该奖学金获得者需要填写的感谢表单id
    "form_id": 6,
    // String[required]: 分配方式: "quota", "money"
    "alloc": "quota",
    // Array(Object)[required]: 如果分配方式为"quota", 代表每个不同的group有多少个名额; 如果分配方式为"money",
    //                          代表每个不同的group有多少钱
    "group_quota": [
        {
            "group_id": 2,
            "group": "2015",
            "type": "undergraduate",
            "quota": 10
        },
        {
            "group_id": 3,
            "group": "2016",
            "type": "undergraduate",
            "quota": 4
        }
    ],
    // Array(Object)[required]: 如果分配方式为"quota", 代表每个不同的group已经分配了多少个名额; 如果分配方式为"money",
    //                          代表每个不同的group已经分配了多少钱
    "group_alloc_quota": [
        {
            "group_id": 2,
            "group": "2015",
            "type": "undergraduate",
            "quota": 5
        },
        {
            "group_id": 3,
            "group": "2016",
            "type": "undergraduate",
            "quota": 2
        }
    ],
    // Number[required]: 如果分配方式为"quota", 代表为每人可以分多少钱; 如果分配方式为"money", 字段无效
    "money": 1000
}
```

### 表单 Form
```javascript
{
    // Number[required]: id唯一标识表单
    "id": 4, 
    // String[required]: 代表表单是用于申请的表单还是用于感谢的表单 apply/thanks
    "type": "apply"
    // String[required]: 表单名字
    "name": "学业优秀荣誉申请模版2",
    // Array(Field)[required]: 有序字段列表
    "fields": [
        {
            // Number[required]: 字段类型：说明文字（1）、数字（2）、邮箱（3）、手机（4）、单行字符串（5）、
            //                   多行字符串（6）、多选框（7）、单选框（8）、附件(管理员上传的说明文件)（9）、
            //                   上传文件(用户需要上传的材料)（10）。
            "type": 2, 
            // Number[required]: 限制字段填写的最长/最短长度。当字段类型为邮箱、手机、单行字符串、多行字符串时,
            //                   含义为字符串长度,值<0表示没有限制;当字段类型为数字时,含义为最小值与最大值,
            //                   最大值小于最小值表示没有限制；当字段类型为上传文件时,含义为文件大小限制(byte),
            //                   值<0表示没有限制;当为其他字段类型时,无用。
            "max_len": 1000, 
            "min_len": 1000,
            // Boolean[required]: 这个字段是否必填
            "required": true, 
            // String: 该字段的说明文字
            "description": "请填写您的科创经历, 此项最好不要为空", 
            // Object: 当字段类型为附件时,含义为附件id; 当字段类型为多选框或单选框时,含义为选项的列表Array[String]；
            //         当为其他字段类型时,无用。
            "content": null
        }
    ], 
    // String: 打印格式(暂定latex模版),
    //         如果不存在则代表该表单不支持打印格式输出
    "template": ""
}
```

一个创建表单测试样例:

```
http --auth-type=jwt --auth=<token> POST http://localhost:3000/api/v1/forms name="测试表单1" type="apply" fields:='[{
"type": 1,
"max_len": -1,
"min_len": -1,
"required": false,
"description": "说明文字",
"content": null}]'
```

### 表单填充情况 Form-Fill-Content
```javascript
{
    // Number[required]: id唯一标识表单填充情况
    "id": 6666,
    // Number[required]: 填写该表单的用户id
    "user_id": 1,
    // Number[required]: 该表单的id
    "form_id": 4,
    // Object[required]: JSON, 标记表单每个字段填写什么. key为字段id, value为内容
    "fill_content": {
        "1234": "张三",
        "2345": "xxxx@gmail.com"
    }
}
```

### 用户-荣誉申请情况 User-Honor-State
```javascript
{
        // Number[required]: 申请id
        "apply_id": 10,
        // Number[required]: 用户id
        "user_id": 123,
        // Number[required]: 荣誉id
        "honor_id": 2,
        "id": "987654321", 
        // String[required]: 申请时间
	      "apply_time":  "2017-09-28T10:54:24.738793",
        // String[required]: 当前用户对该荣誉的申请状况, success/fail/applied/temp 分别代表
      	//                   申请成功/申请失败/已申请/暂存
        "state": "applied",
        //  Array(Score)[required]: 评分情况列表
        "scores": [
         		{
         			// Number[required]: 评分辅导员/老师id
         			"scorer_id": 1,
         			// JSON String[required]: 该辅导员/老师给此申请的评分
         			"score": '{"score1":[7,9],"score2":[8],"score3":14}',
         			// String[required]: 创建该打分的可读timestamp (ISO format)
         			"created_at": "2017-05-28T10:48:51.416731",
         			// String[required]: 最后更新该打分的可读timestamp (ISO format)
         			"updated_at": "2017-05-28T10:48:51.416731"
         		}
       	],
        // Number[required]: 用户的申请表填写情况ID. // 用这个ID可以拿到具体这个用户这个申请表填写的内容. 不可以...
        "fill_id": 111,
      	// Form-Fill-Content[required]: 内联的申请表填写情况
	      "fill": Form-Fill-Content{...}
}
```

### 用户-奖学金获得情况 User-Scholar-State
```javascript
{
    // Number[required]: 用户id
    "user_id": 1234,
    // Number[required]: 获奖id
    "apply_id": 10,
    // Number[required]: 奖学金id
    "scholar_id": 2,
    // String[required]: 奖学金感谢信状态, success代表已获得
    "state": "success",
    // Number: 用户的感谢信表填写情况ID // 用这个ID可以拿到具体这个用户这个申请表填写的内容. 现在不可以
    //         如果该字段不存在, 则该用户还没有填写感谢信
    "fill_id": 111,
    // Form-Fill-Content[required]: 内联的申请表填写情况. 如果该字段不存在, 则该用户还没填写感谢信
    "fill": Form-Fill-Content{...}
    // Number[required]: 获得的金额数目
    "money": 5000
}
```
API
----
下面按功能给出所有API接口及其作用、权限、返回值、重要的filter query等说明。在很多权限说明中将使用``me``代表当前客户端用户的id。

所有GET列表的API都支持pagination, 用户端可以用``page``和``per_page`` query parameter指定第几页和每页多少个item: eg. ``GET /api/v1/users?group=2016&page=2&per_page=60``代表每页60个, 第二页。默认``per_page=20``。并且response里会包括Link Header, 客户端可以考虑读取Link Header而不是自己拼接URL, 例如:

```
Link: <https://{HOST_NAME}/api/v1/users?group=2016&page=3&per_page=20>; rel="next", <https://{HOST_NAME}/users?group=2016&page=14&per_page=20>; rel="last"
```

所有GET列表的API都支持sorting, 用户端可以用``sort`` query parameter指定按照哪个字段sort: eg. ``GET /api/v1/users?sort=student_id``

所有GET列表的API都支持filtering, 用户端可以用query parameter指用哪个字段的哪个值做filtering, 具体例子写在每个API的介绍里。

> NOTE:
> 
> * 权限满足只代表不会被返回401/403, 后台在很多接口都可能由于query、payload不合法返回400: 比如修改单个用户信息的``POST /api/v1/users/{id}``接口后台会对不同信息字段判断合法性
> * 现在只写出了成功时的返回值, 需要明确指定一下失败时的返回值

### 用户管理
用户列表:
* ``GET /api/v1/users``: 得到用户列表
    * **权限**: 用户管理
    * **返回**: [User]
    * 加入query来过滤用户, 比如``?group=2016``, ``?class=无23``, ``?admin=1``(得到所有有管理权限的用户)等等
* ``POST /api/v1/users``: 新增用户
    * **权限**: 用户管理
    * **返回**: User

单个用户信息:
* ``GET /api/v1/users/me``: 得到当前登录用户的信息
    * **权限**:
    * **返回**: User
* ``GET /api/v1/users/{id}``: 得到某个``{id}``的用户的信息
    * **权限**: 用户管理 OR ``id == me``
    * **返回**: User
* ``PUT /api/v1/users/{id}``: 修改``{id}``的用户信息
    * **权限**: 用户管理 OR ``id == me`` 
    * **返回**: User
* ``PUT /api/v1/users/{id}/newPassword``: 随机重置``{id}``的用户密码, 新密码将发至该用户邮箱
    * **权限**: 用户管理
    * **返回**:
* ``DELETE /api/v1/users/{id}``: 删除``{id}``的用户
    * **权限**: 用户管理
    * **返回**:

### 组管理
* ``GET /api/v1/groups``: 得到组列表
	* **权限**: 用户管理
	* **返回**: [Group]
* ``POST /api/v1/groups``: 创建新组
	* **权限**: 用户管理
	* **返回**: Group
* ``PUT /api/v1/groups/{id}``: 修改``{id}``的组信息
	* **权限**: 用户管理
	* **返回**: Group

### 权限管理
* ``GET /api/v1/permissions``: 得到权限列表
    * **权限**: 权限管理
    * **返回**: [Permission]
* ``GET /api/v1/permissions/{permissionName}/users``: 得到拥有某权限的用户列表
    * **权限**: 权限管理
    * **返回**: [Users]
* ``POST /api/v1/permissions/{permissionName}/users``: 给某个用户加入权限
    * **参数**: `userId`=需要加入权限的user的id
    * **权限**: 权限管理
    * **返回**:
* ``DELETE /api/v1/permissions/{permissionName}/users/{userId}``: 删除某个用户的某个权限
    * **权限**: 权限管理
    * **返回**:

### 荣誉相关
* ``GET /api/v1/honors``: 得到荣誉的列表
    * **权限**:
    * **返回**: Honor
    * 可以加入query来过滤荣誉, 比如``?year=2017``。特别的，query``?group_id=``可以搜索group_quota中包含该group的荣誉，query``?available=1``可以搜索当前时间在荣誉可申请时间段内的荣誉
* ``GET /api/v1/honors/{id}``: 得到荣誉信息
    * **权限**:
    * **返回**: Honor
* ``POST /api/v1/honors``: 创建荣誉
    * **权限**: 荣誉管理
    * **返回**: Honor
* ``PUT /api/v1/honors/{id}``
    * **权限**: 荣誉管理
    * **返回**: Honor
* ``DELETE /api/v1/honors/{id}``: 删除某荣誉
    * **权限**: 荣誉管理

### 组-荣誉相关
* ``GET /api/v1/groups/{id}/honors``: 得到某个``{id}``组里的所有用户的荣誉申请情况列表
    * **权限**: 用户管理 AND 荣誉管理
    * **返回**: {`user_id`: User-Honor-State}, dict中每个value为一个list, 代表`user_id`用户的各个荣誉情况, 如果组里某用户没有申请这些荣誉, 省略其key-value对
    * （必选）加入query来限制honor id:
        * ``?honor_ids=12,34,13``: 荣誉id用单个逗号分隔, 不要空格

### 用户-荣誉相关
* ``GET /api/v1/users/{id}/honors``: 得到某个``{id}``用户-荣誉申请情况列表
    * **权限**: 用户管理 OR ``me == id``
    * **返回**: [User-Honor-State]
    * 加入query来得到这个用户的不同状态的荣誉, 或者限制荣誉id列表, 比如:
        * ``?honor_id=12``: 荣誉id
        * ``?state=applied``: 只返回此用户已申请未审批的荣誉
        * ``?state=fail``: 只返回此用户曾申请但未获得的荣誉
        * ``?state=success``: 只返回此用户成功申请的荣誉
* ``POST /api/v1/users/{id}/honors``: 申请荣誉, 申请表格fill内容内联上传
    * **权限**: ``me == id``
    * **返回**: User-Honor-State
* ``PUT /api/v1/users/{id}/honors/{honor_id}/admin``: 改变一个用户申请荣誉状态的所有信息, 包括表格等
    * **权限**: 用户管理 AND 荣誉管理
    * **返回**: User-Honor-State
* ``PUT /api/v1/users/{id}/honors/{honor_id}``: 提交已暂存的申请表, 或者在荣誉状态为暂存的时候修改申请表
    * **权限**: 用户管理 AND 荣誉管理 OR ``me == id``
    * **返回**: User-Honor-State
* ``DELETE /api/v1/users/{id}/honors/{honor_id}``: 删除申请
    * **权限**: ``me == id``
* ``POST /api/v1/users/{id}/honors/{honor_id}/scores/``: 提交对某个荣誉申请的评分
    * **权限**: 用户管理 AND 荣誉管理
    * **返回**: User-Honor-State
* ``PUT /api/v1/users/{id}/honors/{honor_id}/scores/{scorer_id}``: 修改自己对某个荣誉申请的评分
    * **权限**: 用户管理 AND 荣誉管理 AND ``me == scorer_id``
    * **返回**: User-Honor-State
* ``DELETE /api/v1/users/{id}/honors/{honor_id}/scores/{scorer_id}``: 删除自己对某个荣誉申请的评分
    * **权限**: 用户管理 AND 荣誉管理 AND ``me == scorer_id``

### 奖学金相关
* ``GET /api/v1/scholars``: 获得奖学金列表
    * **权限**:
    * **返回**: [Scholarship]
    * 可以加入query来过滤荣誉, 比如``?year=2017``
* ``GET /api/v1/scholars/{id}``: 获得奖学金信息
    * **权限**:
    * **返回**: Scholarship
* ``POST /api/v1/scholars``: 创建奖学金
    * **权限**: 奖学金管理
    * **返回**: Scholarship
* ``PUT /api/v1/scholars/{id}``: 修改奖学金信息
    * **权限**: 奖学金管理
    * **返回**: Scholarship
* ``DELETE /api/v1/scholars/{id}``: 删除某奖学金
    * **权限**: 奖学金管理

### 组-奖学金相关
* ``GET /api/v1/groups/{id}/scholars``: 得到某个``{id}``组里的所有用户的奖学金分配情况列表
    * **权限**: 用户管理 AND 奖学金管理
    * **返回**: {`user_id`: User-Scholar-State}, dict中每个value为一个list, 代表`user_id`用户的奖学金情况, 如果组里某用户没有获得奖学金, 省略其key-value对
    * （必选）加入query来限制scholar:
        * ``?scholar_ids=12,34,13``: 奖学金id用单个逗号分隔, 不要空格

### 用户-奖学金相关
* ``GET /api/v1/users/{id}/scholars``: 得到某个``{id}``用户获得奖学金的列表
    * **权限**: 用户管理 OR ``me == id``
    * **返回**: [User-Scholar-State]
* ``POST /api/v1/users/{id}/scholars``: 给某个用户分配一个新的奖学金
    * **权限**: 用户管理 AND 奖学金管理
    * **返回**: User-Scholar-State
* ``PUT /api/v1/users/{id}/scholars/{scholar_id}``: 修改用户在一个money类奖学金的获奖金额
    * **权限**: 用户管理 AND 奖学金管理
    * **返回**: User-Scholar-State
* ``POST /api/v1/users/{id}/scholars/{scholar_id}/thanksletter``: 提交感谢信表格
    * **权限**: ``me == id``
    * **返回**: User-Scholar-State
* ``PUT /api/v1/users/{id}/scholars/{scholar_id}/thanksletter``: 修改感谢信表格。
    * **权限**: ``me == id`` OR 奖学金管理
    * **返回**: User-Scholar-State
* ``DELETE /api/v1/users/{id}/scholars/{scholar_id}``: 删除一个用户得到的某个奖学金
    * **权限**: 用户管理 AND 奖学金管理

### 表单相关
* ``GET /api/v1/forms``: 获得表单列表
    * **返回**: Form
    * 可以加入query来过滤荣誉, 比如``?type=apply``或者``?type=thanks``
* ``POST /api/v1/forms/``: 增加表单
    * **权限**: 表单管理
    * **返回**: Form
* ``GET /api/v1/forms/{id}``: 获得表单
    * **返回**: Form
* ``PUT /api/v1/forms/{id}``: 改变表单内容
    * **权限**: 表单管理
    * **返回**: Form
* ``DELETE /api/v1/forms/{id}``: 删除表单
    * **权限**: 表单管理

### 文件相关
* ``GET /api/v1/users/{id}/files/{file_id}``

Batch requests
--------------
批量请求太多时, 过多的HTTP requests使用不同的connection, 增加了服务器负担, 多次网络round trip增加了用户进行批量操作时的延时, 所以需要对一些经常会批量操作的接口提供batch requests接口。

### 请求格式
* ``POST /api/v1/batch``
* **Body**:
* **Return**:

Status Code
----
简化版的API至少需要以下五种HTTP status code标志操作是否正确:

* 200 OK
* 400 Bad Request - malformed request or illegal request
* 401 Unauthorized - no valid authentication
* 403 Forbidden - not authorized for this resource
* 500 Internal Server Error

不一定要有的, 但是可以考虑区分的:
* 201 Created - Response to a POST that results in a creation. Should be combined with a Location header pointing to the location of the new resource
* 429 Too Many Requests - rejected due to rate limiting


Errors
----
除了标准的HTTP status提供的错误信息以外, 如果用户提交的请求是非法的, 则返回400并且带上错误提示, JSON payload如下:
```javascript
{
    "code": 123,
    "message": "",
    "description": ""
}
```

由于401, 403错误码对应的错误原因十分明了, 所以其response里可以不带该payload。

Authentication
----
JWT-based authentication.

1. ``POST /auth``拿到token, 参数: `student_id`和`password`json信息

以下是一个登录成功的HTTP respponse示例

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 183
Content-Type: application/json; charset=utf-8
Date: Sun, 26 Mar 2017 08:26:21 GMT
ETag: W/"b7-JBKO74hFNC9VtkVO2PeHoB+vl3U"
X-Powered-By: Express

{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNDkwNTE2NzgxLCJleHAiOjE0OTA1MzQ3ODEsImlzcyI6InRoZVZlcnlGb3hmaU5pbmcifQ.i74QFI2_-QN9cSo5HDy5cXzaKiLPuNUrNr-LcAGm2ck"
}
```

以下是两个登录失败的HTTP response示例
```
HTTP/1.1 401 Unauthorized
Cache-Control: no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0
Connection: keep-alive
Content-Length: 154
Content-Type: application/json; charset=utf-8
Date: Sun, 26 Mar 2017 08:29:13 GMT
ETag: W/"9a-/jj5RxQ/PksPxCxFsrjnN+X3K0I"
X-Powered-By: Express

{
    "message": "Student ID do not exists.",
    "name": "UnauthorizedError",
    "trace": {
        "message": "Student ID do not exists.",
        "name": "UnauthorizedError",
        "status": 401
    }
}
```

```
HTTP/1.1 401 Unauthorized
Cache-Control: no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0
Connection: keep-alive
Content-Length: 142
Content-Type: application/json; charset=utf-8
Date: Sun, 26 Mar 2017 08:29:36 GMT
ETag: W/"8e-OMAFo76DAhbVnsu97D8s4Onvlk4"
X-Powered-By: Express

{
    "message": "Password incorrect.",
    "name": "UnauthorizedError",
    "trace": {
        "message": "Password incorrect.",
        "name": "UnauthorizedError",
        "status": 401
    }
}
```

2. 拿到token后, 用JWT token的标准方法(详细细节可见[jwt介绍](https://jwt.io/introduction/#how-do-json-web-tokens-work-)), 在之后的每个HTTP request的包头的`Authorization`字段使用Bearer schema携带该token即可.

一个用`httpie`命令行工具(并用了[`httpie-jwt-auth`插件](https://github.com/teracyhq/httpie-jwt-auth))的示例如下:
```
http --auth-type="jwt" --auth="<token>" GET ...
```
