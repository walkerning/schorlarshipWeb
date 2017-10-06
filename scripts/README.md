导出信息到学校系统
--------------------

从jxj系统中出来的信息需要后处理, 辅导员审核之后提供一个excel文件, 跑一个脚本导入学校系统.

运行`export_to_info.py`脚本, 需要安装`openpyxl`(excel解析)和`pyquery`(html解析):

```
pip install -r requirements.txt
```

具体使用方法运行`python export_to_info.py --help`进行查看.
