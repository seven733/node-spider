const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  // 标题
  title: { type: String, index: true },
  // 描述
  description: { type: String },
  // 笔画
  num: { type: Number, default: 0 },
  // 结构
  url: { type: String },
  // 发音
  tags: { type: [String], default: [] }
})

const Article = mongoose.model('Article', articleSchema);

module.exports = { Article };
