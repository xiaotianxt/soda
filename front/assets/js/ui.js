/*
 * @Author: 小田
 * @Date: 2021-05-31 11:26:45
 * @LastEditTime: 2021-11-18 21:39:34
 */

import Chart from "chart.js/auto";

import { priceSearch } from "./server";
import {
  clearTransportLocate,
  drawTransportLocate,
  getTransportPoint,
  toggleTag,
  toggleHeatmap,
} from "./map";
export var chart = null;
export var data = null;

// 演示用
const dates = ["2015", "2016", "2017", "2018", "2019", "2020", "2021"];

export function getPriceRange() {
  if (!$("#price-checkbox").is(":checked")) {
    return { min: 0, max: 0xffffff }; // not checked
  }
  var minPrice = $(
    "#price-range > div > div.input-group.mb-3 > input:nth-child(1)"
  ).val();
  minPrice = minPrice != "" ? minPrice : 0;
  var maxPrice = $(
    "#price-range > div > div.input-group.mb-3 > input:nth-child(3)"
  ).val();
  maxPrice = maxPrice != "" ? maxPrice : 0xffffff;

  return { min: parseFloat(minPrice), max: parseFloat(maxPrice) };
}

export function getTransportRange() {
  if (!$("#transport-checkbox").is(":checked")) {
    return null;
  }

  var transportType = $(".transport-type:checked").attr("id");
  var time = parseInt($("#transport-time").val());
  var geometry = getTransportPoint();

  if (geometry == null) {
    return null;
  }

  return { type: transportType, time: time, coordinates: geometry };
}

export function initUI() {
  initSliders();
  //initChart();

  $("#search-result-info-back").on("click", function (e) {
    $("#info-prev").trigger("click");
  });

  $("#toggle-heatmap").on("click", toggleHeatmap);
  $("#toggle-tag").on("click", toggleTag);
}

const removeClass = (item) => {
  item.removeClass("text-success");
  item.removeClass("text-warning");
  item.removeClass("text-danger");
};

export function showInfo(item) {
  var firstpage = $(".carousel-item").eq(0);
  if (firstpage.hasClass("active")) {
    $("#info-next").trigger("click");
  }

  var rating = item.properties.rating;
  var o_rating = item.properties.o_rating;

  var itm_rating = $("#search-result-rating");
  var itm_o_rating = $("#search-result-o_rating");

  var grade_rating = $("#rating-grade");
  var grade_o_rating = $("#o_rating-grade");

  var des_rating = $("#rating-description");
  var des_o_rating = $("#o_rating-description");

  var mine = ratingFormatter.format(item.properties.rating);
  var platform = ratingFormatter.compare(
    item.properties.rating,
    item.properties.o_rating
  );

  removeClass(itm_rating);
  removeClass(itm_o_rating);
  removeClass(grade_rating);
  removeClass(grade_o_rating);

  itm_rating.html(rating.toFixed(2));
  itm_o_rating.html(o_rating.toFixed(2));

  itm_rating.addClass(mine.class);
  itm_o_rating.addClass(platform.class);

  grade_rating.addClass(mine.class);
  grade_o_rating.addClass(platform.class);

  grade_rating.html(mine.grade);
  grade_o_rating.html(platform.grade);

  des_rating.html(mine.description);
  des_o_rating.html(platform.description);

  // console.log(mine, platform);

  $("#search-result-info-title").html(item.properties.name);
}

export const ratingFormatter = {
  format: function (rating) {
    if (rating >= 4) {
      return {
        rating: rating.toFixed(2),
        grade: "A",
        class: "text-success",
        description: "饭店卫生条件良好，出现食品安全隐患可能低",
      };
    } else if (rating >= 3) {
      return {
        rating: rating.toFixed(2),
        grade: "B",
        class: "text-warning",
        description: "饭店卫生条件一般，可能出现食品安全隐患",
      };
    }
    return {
      rating: rating.toFixed(2),
      grade: "C",
      class: "text-danger",
      description: "饭店卫生条件较差，存在食品安全隐患",
    };
  },
  compare: function (rating, o_rating) {
    var res = this.format(o_rating);

    if (o_rating - rating > 0.5) {
      res.description = "系统发现平台分数显著高于本系统得分，存在刷分嫌疑";
      res.class = "text-danger";
      res.grade = "F";
    } else {
      res.description = "得分与平台得分相似，值得信任";
    }
    return res;
  },
};

export function updateChart(prices) {
  initChart();
  dates.forEach((item, index) => {
    chart.data.labels.push(item);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(
        prices[0]["_id"]["price"] *
          (1 + (1 - Math.random() + 0.3 * index) * 0.01)
      );
    });
    chart.update();
  });
}

function initSliders() {
  const func = function (contents, buttons) {
    contents.find(".close").on("click", function (e) {
      var index = contents.find(".close").index(this);
      contents.eq(index).slideUp(() => {
        buttons.eq(index).slideDown(10);
      });
    });

    buttons.on("click", function (e) {
      var index = buttons.index(this);
      buttons.eq(index).slideUp(10, (e) => {
        contents.eq(index).slideDown();
      });
    });
    contents.find(".close");
  };

  var leftContents = $(".sidebar-left .sidebar-item-content");
  var rightContents = $(".sidebar-right .sidebar-item-content");

  var leftButtons = $(".sidebar-left .sidebar-item-button");
  var rightButtons = $(".sidebar-right .sidebar-item-button");

  func(leftContents, leftButtons);
  func(rightContents, rightButtons);

  $("#transport-choose-locate").on("click", function (e) {
    if ($(this).hasClass("active")) {
      // 如果已经在active状态, 那么用户取消绘制中心点
      clearTransportLocate();

      $(this).removeClass("active");
    } else {
      // 否则用户需要开始绘制一个中心点
      drawTransportLocate();

      $(this).addClass("active");
    }
  });
}

function initChart() {
  data = {
    labels: [],
    datasets: [
      {
        label: "平均成交价格",
        backgroundColor: "#3579f6",
        borderColor: "#3579f6",
        data: [],
        tension: 0.4,
      },
    ],
  };
  const config = {
    type: "line",
    data: data,
    scales: {
      y: {
        ticks: {
          color: "#00ff00",
        },
      },
    },
  };
  if (chart != null) {
    chart.destroy();
  }
  chart = new Chart(document.getElementById("myChart"), config);
  chart.scales.y.callback = function (label, index, labels) {
    return label / 1000 + "k";
  };
}
