# EO Space Config

- 解压`eo_space.zip`到任意位置

```bash
unzip eo_space.zip
cd eo_space
```

- 配置`python`环境

```bash
python3 -m venv venv
source venv/bin/activate
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

- 配置`Nginx`代理

```bash
# 新开终端或退出虚拟环境
# 安装nginx
sudo apt-get install nginx
# 配置nginx
cd /etc/nginx/sites-available/
sudo touch eospace_nginx.conf
sudo vim eospace_nginx.conf
# 修改eospace_nginx.conf为:
```

```json
# the upstream component nginx needs to connect to
upstream django {
    # server unix:///path/to/your/mysite/mysite.sock; # for a file socket
    server 127.0.0.1:8001; # for a web port socket (we'll use this first)
}

# configuration of the server
server {
    # the port your site will be served on
    listen      80;
    # the domain name it will serve for
    server_name localhost; 
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    location /media  {
        alias /home/ubuntu/eo_space/media;  **# 这里改成eo_space工程根目录 + /media**
    }

    location /static {
        alias /home/ubuntu/eo_space/static; **# 这里改成eo_space工程根目录 + /static**

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     uwsgi_params; # the uwsgi_params file you installed
    }
}
```

```bash
# 保存eospace_nginx.conf并为其创建软链接
sudo ln -s /etc/nginx/sites-available/eospace_nginx.conf /etc/nginx/sites-e
nabled
cd ..  # 退回到nginx配置目录
sudo vim nginx.conf
# 修改nginx.conf为：
```

```json
user ubuntu;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
}

http {
	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	access_log /var/log/nginx/access.log;
	error_log /var/log/nginx/error.log;

	gzip on;

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
```

```bash
# 创建或修改该目录下文件uwsgi_params为：
```

```json
uwsgi_param  QUERY_STRING       $query_string;
uwsgi_param  REQUEST_METHOD     $request_method;
uwsgi_param  CONTENT_TYPE       $content_type;
uwsgi_param  CONTENT_LENGTH     $content_length;

uwsgi_param  REQUEST_URI        $request_uri;
uwsgi_param  PATH_INFO          $document_uri;
uwsgi_param  DOCUMENT_ROOT      $document_root;
uwsgi_param  SERVER_PROTOCOL    $server_protocol;
uwsgi_param  REQUEST_SCHEME     $scheme;
uwsgi_param  HTTPS              $https if_not_empty;

uwsgi_param  REMOTE_ADDR        $remote_addr;
uwsgi_param  REMOTE_PORT        $remote_port;
uwsgi_param  SERVER_PORT        $server_port;
uwsgi_param  SERVER_NAME        $server_name;
```

- 配置`uwsgi`

```bash
# 返回eo_space项目位置，激活虚拟环境
cd /home/ubuntu/eo_space
source venv/bin/activate
# 安装uwsgi
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple uwsgi
# 新建uwsgi.ini文件，编辑内容为：
```

```json
[uwsgi]
chdir = /home/ubuntu/eo_space  # 工程文件根目录
module = eo_space.wsgi:application
socket = :8001
master = true

buffer-size = 30000
vacuum = true
daemonize = /home/ubuntu/eo_space/uwsgi.log  # 根据工程文件根目录相应修改
pidfile = /home/ubuntu/eo_space/uwsgi.pid  # 根据工程文件根目录相应修改
virtualenv=/home/ubuntu/eo_space/venv  # 根据工程文件根目录相应修改
disable-logging = true
```

```bash
sudo nginx -t  # 可以检查nginx配置语法是否正确
sudo service nginx start
uwsgi --ini uwsgi.ini
# 使用IP+/ssrpg/SLSentiment作为URL访问检查是否成功
```

- Debug

```bash
# 如果没有成功：
cd /home/ubuntu/eo_space/eo_space
vim settings.py
# settings.py中ALLOWED_HOSTS=["*"]或改为本机IP
# 重新运行项目：
sudo service nginx restart
uwsgi --reload uwsgi.pid

# 还是没有成功：
# 检查项目根目录下uwsgi.log
# 检查nginx错误日志，位置：/var/log/nginx/error.log
# 编辑settings.py，添加如下代码，开启Django日志以查看：
```

```python
import os

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```