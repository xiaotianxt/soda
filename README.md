# 基于智能计算与多元数据融合的餐饮店铺食品安全风险评估系统

Soda 2021 复赛项目

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)

可视化展示餐饮店铺食品安全评分数据，支持多种方式查询。

在线查看[food.xiaotianxt.cn](https://food.xiaotianxt.cn)

## 运行截图

> 还没有

![使用截图]()

## 安装

### 前端

使用`npm`安装依赖, 利用`parcel-bundler`打包.

开发:

```bash
  cd front
  npm install --dependencies
  npm start
```

打包:

```bash
  parcel build index.html
```

### 后端

使用`python flask`响应请求.

开发:

```bash
  pip3 install pymongo flask flask-cors
  flask run --host=0.0.0.0
```

部署:
使用`uWSGI` + `NGINX`部署.

### 数据库部署

使用 MongoDB 进行部署

## 作者

- [@xiaotianxt](https://www.github.com/xiaotianxt)
