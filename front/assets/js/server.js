/*
 * @Author: 小田
 * @Date: 2021-05-31 13:24:12
 * @LastEditTime: 2021-11-19 12:29:53
 */

// jQuery
const $ = require("jquery");
window.jQuery = $;
jQuery = $;
window.$ = window.jQuery;

// map.js
import {
  changeCenter,
  addTag,
  getMultiPolygon,
  addSelect,
  clearXiaoqu,
  updateHeatmap,
  resSource,
} from "./map";
import {
  getPriceRange as getRatingRange,
  showInfo,
  updateChart,
  getTransportRange,
  ratingFormatter,
} from "./ui";
import { transform } from "ol/proj";

import thumbs from "../img/thumb/*.png";

// server url configs
// const url = "https://restaurant.xiaotianxt.cn";
const url = "http://localhost:5001";
const search_url = url + "/search";

// search results
export const searchPanel = $("#search-result-panel"); // 结果记录位置
export var searchResults; // 小区搜索结果

import olpjch from "ol-proj-ch";
const code = olpjch.GCJ02.CODE;

export function mocksimpleNameSearch(e) {
  e.preventDefault();
  showList();
  solveResult();
}

export function simpleNameSearch(e) {
  e.preventDefault();
  showList();
  var name = $("#xiaoqu-locate input").val();
  console.log(JSON.stringify({ type: "name", name: name }));
  fetch(search_url, {
    body: JSON.stringify({ type: "name", name: name }),
    method: "post",
    mode: "cors",
    headers: {
      "user-agent": "Mozilla/4.0 MDN Example",
      "content-type": "application/json;charset=utf-8",
    },
  })
    .then((res) => {
      //   console.log(res);
      return res.json();
    })
    .then(solveResult);
}

export function advancedSearch(e) {
  e.preventDefault();
  showList();
  var multipolygon = getMultiPolygon();
  var rating = getRatingRange();
  var transport = getTransportRange();

  var data = {
    polygon: multipolygon,
    rating: rating,
    transport: transport,
    type: "advanced",
  };
  // console.log(data);
  fetch(search_url, {
    mode: "cors",
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then(solveResult);
}

export function priceSearch(item) {
  var data = {
    item: item.properties,
    type: "prices",
  };
  // console.log(JSON.stringify(item));
  return fetch(search_url, {
    mode: "cors",
    method: "post",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((js) => {
      updateChart(js);
    });
}

function showList() {
  var firstpage = $(".carousel-item").eq(0);
  if (!firstpage.hasClass("active")) {
    $("#info-prev").trigger("click");
  }
}

function itemClicked() {
  // 获得选择的小区
  var item_index = $(this).attr("_id");
  var item = searchResults[item_index];
  // console.log(item);
  // 重新定位到该小区
  var transformedCor = transform(item.geometry.coordinates, code, "EPSG:3857");
  addSelect(transformedCor);
  changeCenter(transformedCor);
  showInfo(item);
}

export function insertOneItem(element, index) {
  var $elem = $(
    `

              <a href="#" _id="${index}" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="row">
              <img src="${
                thumbs[parseInt((Math.random() * 100) % 33)]
              }" alt="..." class="col-3 mg-thumbnail img-fluid col-3">
              <div class="col-9">
                  <div class="d-flex w-100 justify-content-between">

                      <h6 class="mb-1">${element.properties.name}</h6>
                      <h6 class="text-right badge badge-primary text-nowrap">${element.properties.rating.toFixed(
                        1
                      )}</h6>
                  </div>
                  <p class="mb-1">${element.properties.address}</p>
		</div>
		</div>
              </a>
          `
  );
  var coordinates = transform(element.geometry.coordinates, code, "EPSG:3857");
  addTag(coordinates, index, element.properties.rating);

  $elem.on("click", itemClicked);
  searchPanel.append($elem);
}

function solveResult(js) {
  searchResults = js;
  searchPanel.children().remove(); // remove items
  clearXiaoqu();

  if ($("#result-card").css("display") == "none") {
    $("#result-button").trigger("click");
  }

  js.forEach(insertOneItem);
  updateHeatmap();
}
