#!/bin/bash

gunicorn --bind 0.0.0.0:7001 -k gevent -w 1 app:app
