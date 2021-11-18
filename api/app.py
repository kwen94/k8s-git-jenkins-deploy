import gevent.monkey
gevent.monkey.patch_all() # 不开启猴子补丁会导致单线程，而非协程

from web import create_app, socketio
from flask import Response


app = create_app()

@app.after_request
def show(resp:Response):
    print(resp)
    return resp

if __name__ == '__main__':
    socketio.run(app, debug=False, port=7001, host='0.0.0.0') # debug 不能为True