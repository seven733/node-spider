const cheerio = require('cheerio');
const axios = require('axios');
const Promise = require("bluebird");
const _ = require('lodash');

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const { Article } = require('./article.js');
mongoose.connect('mongodb://localhost:27017/graphql', { useNewUrlParser: true });


function getTagText(text) {
  if (text.indexOf("node") !== -1) {
    return 'node'
  }

  if (text.indexOf("css") !== -1 || text.indexOf('sass') !== -1) {
    return 'css'
  }

  if (text.indexOf("http") !== -1) {
    return 'http'
  }

  if (text.indexOf("html") !== -1) {
    return 'html'
  }

  if (text.indexOf("vue") !== -1) {
    return 'vue'
  }

  if (text.indexOf("react") !== -1) {
    return 'react'
  }

  if (text.indexOf("推荐") !== -1) {
    return;
  }

  if (text.indexOf("翻译") !== -1) {
    return "翻译";
  }

  if (text.indexOf("性能") !== -1) {
    return "性能";
  }

  if (text.indexOf("安全") !== -1) {
    return "安全";
  }

  if (text.indexOf("mobile") !== -1 || text.indexOf("移动") !== -1) {
    return "移动端";
  }

  if (text.indexOf("动画") !== -1 || text.indexOf("设计") !== -1) {
    return "设计";
  }

  if (text.indexOf("前端") !== -1 || text.indexOf('web') !== -1 || text.indexOf('浏览器') !== -1 || text.indexOf('chrome') !== -1) {
    return 'web';
  }

  return text;
}

function formatData(data, num) {
  const $ = cheerio.load(data);
  let articles = [];
  $('#content .article').each((_, item) => {
    const title = $(item).find('a').text();
    const url = $(item).find('a').attr('href');

    const description = $(item).find('.desc').text();
    let tags = [];
    $(item).find('.meta span').each((_, tag) => {
      let text = $(tag).text();
      if (text !== '奇舞推荐' && text) {
        text = getTagText(text.toLowerCase());
        if (text) {
          tags.push(text);
        }
      }
    });

    articles.push({
      title, url, description, tags, num
    });
  });

  return articles;
}

async function getData(num){
  const url = `https://weekly.75team.com/issue${num}.html`;
  const res = await axios.get(url);

  const articles = formatData(res.data, num);
  await Article.insertMany(articles);
}

(async function() {
  console.log('🚀 🚀 🚀 start。。。。');
  console.time("time");

  await Article.deleteMany({});
  const nums = _.range(1, 305);
  await Promise.mapSeries(nums, async num => {
    await getData(num);
  });

  console.timeEnd("time");
  console.log('END');
  process.exit(0);
})()