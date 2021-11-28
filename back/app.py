'''
Author: 小田
Date: 2021-05-19 15:21:48
LastEditTime: 2021-11-18 20:22:20
'''
from flask import Flask, request
from handler import *
from flask_cors import *
import logging

app = Flask(__name__)
handler = RequestHandler()


@app.route("/search", methods=["POST"])
@cross_origin()
def search():
    data = json.loads(request.data.decode("utf-8"))
    print(data)
    rq_type = data['type']

    if rq_type == "xiaoqu":
        xiaoqu = data['xiaoqu']
        logging.info("查询小区: " + xiaoqu)
        return handler.query_within_restaurant_name(xiaoqu), 200, {'content-type': 'application/json'}

    elif rq_type == "advanced":
        returndata = handler.query_within_restaurant_advanced(
            data['polygon'], data['rating'], data['transport'])
        print(returndata)
        return returndata, 200, {'content-type': 'application/json'}
