const cheerio = require('cheerio');
const axios = require('axios');
const Promise = require("bluebird");
const _ = require('lodash');

const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const { Article } = require('./article.js');
mongoose.connect('mongodb://localhost:27017/graphql', { useNewUrlParser: true });

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
        tags.push(text);
      }
    });
    if (tags.length === 0) {
      tags.push('other');
    }

    articles.push({
      title, url, description, tags, num
    });
  });

  return articles;
}

async function getData(num){
  const url = `https://weekly.75team.com/issue${num}.html`;
  const redirectRes = await axios.get(url);

  const articles = formatData(redirectRes.data, num);
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