const axios = require('axios')
const AV = require('leancloud-storage')
const striptags = require('striptags')
AV.init({
  appId: process.env.APP_ID,
  appKey: process.env.APP_KEY,
  masterKey: process.env.MASTER_KEY
})

AV.Cloud.useMasterKey(true);

const Post = AV.Object.extend('Post')

const api = axios.create({
  baseURL: 'https://seewang.me/wp-json/wp/v2/'
})

const categories = [
  {
    id: 17,
    name: '编程'
  },
  {
    id: 27,
    name: '生活'
  },
  {
    id: 94,
    name: '动漫'
  }
];

(async () => {
  const query = new AV.Query('Post')
  posts = await query.find()
  await AV.Object.destroyAll(posts)

  categories.map(async category => {
    const { data } = await api.get('posts', {
      params: {
        categories: category.id,
        per_page: 100
      }
    })

    data.map(item => {
      post = new Post()
      post.set('title', item.title.rendered)
      post.set('excerpt', striptags(item.excerpt.rendered))
      post.set('content', item.content.rendered)
      post.set('publishedAt', new Date(item.date_gmt))
      post.set('category', category.name)
      post.save()
    })
  })
})()

