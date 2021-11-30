'''
Author: 小田
Date: 2021-05-19 15:21:48
LastEditTime: 2021-11-18 20:22:20
'''
from flask import Flask, request
from flask.helpers import make_response
from handler import *
from flask_cors import *
import logging

app = Flask(__name__)
CORS(app, supports_credentials=True)
handler = RequestHandler()


@app.route("/search", methods=["POST"])
@cross_origin()
def search():
    data = json.loads(request.data.decode("utf-8"))
    rq_type = data['type']

    if rq_type == "name":
        name = data['name']
        logging.info("查询饭店: " + name)
        return handler.query_within_restaurant_name(name), 200, {'content-type': 'application/json; charset=utf-8'}

    elif rq_type == "advanced":
        returndata = handler.query_within_restaurant_advanced(
            data['polygon'], data['rating'], data['transport'])
        print(returndata)
        return returndata, 200, {'content-type': 'application/json'}


app.run('0.0.0.0', 5001, True)
