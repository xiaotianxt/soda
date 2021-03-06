'''
Author: 小田
Date: 2021-05-19 21:00:00
LastEditTime: 2021-06-17 20:08:43
'''

from db import DBHandler
import json
from bson import ObjectId
from datetime import datetime


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        elif isinstance(o, datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


class RequestHandler():
    def __init__(self) -> None:
        self.db = DBHandler()

    def query_within_res_name(self, restaurant):
        return json.dumps(list(self.db.xiaoqu_name(restaurant)), cls=JSONEncoder)

    def query_within_restaurant_name(self, restaurant):
        print(list(self.db.res_name(restaurant)))
        return json.dumps(list(self.db.res_name(restaurant)), cls=JSONEncoder)

    def query_within_restaurant_advanced(self, coordinates, price, transport):
        return json.dumps(list(self.db.res_advanced(coordinates, price, transport)), cls=JSONEncoder)
