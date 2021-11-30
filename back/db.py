'''
Author: 小田
Date: 2021-05-19 21:05:42
LastEditTime: 2021-11-18 21:41:23
'''
from os import PRIO_PROCESS
from config import CONFIG
from pymongo import MongoClient

EVALUATE = {
    'transport-type-walk': 50,
    'transport-type-bicycle': 100,
    'transport-type-car': 250
}


class DBHandler():
    def __init__(self) -> None:
        DB = CONFIG.DB
        self.client = MongoClient(
            f"mongodb://{DB['host']}:{DB['port']}/{DB['database']}", connect=False)
        self._db = self.client['soda']
        self.restaurant = self._db['restaurant']

    def res_name(self, restaurant):
        # print({"properties.xiaoqu": {"$regex": f".*{xiaoqu}.*"}})
        # print(self.restaurant.find(
        #     {"properties.xiaoqu": {"$regex": f".*{xiaoqu}.*"}}))
        return self.restaurant.find({"properties.name": {"$regex": f".*{restaurant}.*"}})

    def res_filter(self, query):
        # print("QUERY: ", query)
        return self.restaurant.find(query)

    def res_advanced(self, coordinates, rating_range, transport):

        if coordinates is None:
            query_polygon = {}
        else:
            query_polygon = {
                'geometry': {
                    '$geoWithin': {
                        '$geometry': {
                            'type': 'MultiPolygon',
                            'coordinates': coordinates
                        }
                    }
                },
            }
        if rating_range is None:
            query_rating = []
        else:
            query_rating = [
                {"properties.rating": {"$gte": rating_range['min']}},
                {"properties.rating": {"$lte": rating_range['max']}}]

        if transport is None:
            query_transport = {}
        else:
            query_transport = {
                'geometry': {
                    "$near": {
                        "$geometry": {
                            'type': "Point",
                            'coordinates': transport['coordinates']
                        },
                        '$maxDistance': EVALUATE[transport['type']] * transport['time'],
                        '$minDistance': 0
                    }
                }
            }
        print(query_transport)
        return self.res_filter({"$and": [query_polygon, query_transport, *query_rating]})
