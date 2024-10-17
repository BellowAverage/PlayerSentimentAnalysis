## Introduction

- This repo hosts my work constructing a data integration platform when serving as a data analyst for a game company.
- Data revealed in this version is completely regenerated randomly as example, and discloses no company-specific or confidential information.

## A Business Intelligence Workspace

[Me Introducing this Project](https://youtu.be/q-u6D0fzDCo)
- This video was filmed for a course's discussion. This project's part starts from 1:52.

## EO Space Deployment

- Unzip `eo_space.zip` to any location

```bash
unzip eo_space.zip
cd eo_space
```

- Configure the `python` environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

- Configure `Nginx` Proxy

```bash
# Open a new terminal or exit the virtual environment
# Install nginx
sudo apt-get install nginx
# Configure nginx
cd /etc/nginx/sites-available/
sudo touch eospace_nginx.conf
sudo vim eospace_nginx.conf
# Modify eospace_nginx.conf as follows:
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
        alias /home/ubuntu/eo_space/media;  **# Change this to eo_space project root directory + /media**
    }

    location /static {
        alias /home/ubuntu/eo_space/static; **# Change this to eo_space project root directory + /static**

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     uwsgi_params; # the uwsgi_params file you installed
    }
}
```

```bash
# Save eospace_nginx.conf and create a symbolic link for it
sudo ln -s /etc/nginx/sites-available/eospace_nginx.conf /etc/nginx/sites-enabled
cd ..  # Return to the nginx configuration directory
sudo vim nginx.conf
# Modify nginx.conf as follows:
```

```bash
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
# Create or modify the uwsgi_params file in this directory:
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

- Configure `uwsgi`

```bash
# Return to the eo_space project directory, activate the virtual environment
cd /home/ubuntu/eo_space
source venv/bin/activate
# Install uwsgi
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple uwsgi
# Create a new uwsgi.ini file, and edit its content as follows:
```

```json
[uwsgi]
chdir = /home/ubuntu/eo_space  # Project root directory
module = eo_space.wsgi:application
socket = :8001
master = true

buffer-size = 30000
vacuum = true
daemonize = /home/ubuntu/eo_space/uwsgi.log  # Modify according to the project root directory
pidfile = /home/ubuntu/eo_space/uwsgi.pid  # Modify according to the project root directory
virtualenv=/home/ubuntu/eo_space/venv  # Modify according to the project root directory
disable-logging = true
```

```bash
sudo nginx -t  # You can check if the nginx configuration syntax is correct
sudo service nginx start
uwsgi --ini uwsgi.ini
# Use IP+/ssrpg/SLSentiment as the URL to check if it works
```

- Debug

```bash
# If it didn't work:
cd /home/ubuntu/eo_space/eo_space
vim settings.py
# In settings.py, set ALLOWED_HOSTS=["*"] or change it to your local IP
# Rerun the project:
sudo service nginx restart
uwsgi --reload uwsgi.pid

# If it still didn't work:
# Check the uwsgi.log in the project root directory
# Check the nginx error log located at /var/log/nginx/error.log
# Edit settings.py, add the following code to enable Django logging for further inspection:
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
