var _ = require('lodash')

const dummy = (blogs) => {
    return 1
  }
  
  

const totalLikes = (blogs) => {
    return blogs.reduce((summa, like) => summa + like.likes, 0)    
}

const favoriteBlog = (blogs) => {
  const suurinLuku = Math.max(...blogs.map(blog => blog.likes))
  return blogs.find(blog => blog.likes === suurinLuku)
}

const mostBlogs = (blogs) => {
  const nimet = blogs.map(blog => blog.author)
  const laskuri = _.countBy(nimet)
  return _.maxBy(Object.keys(laskuri), nimi => laskuri[nimi])

}

const mostLikes = (blogs) => {
  const tykkaykset = {}
  blogs.forEach((blog) => {

      if (!tykkaykset[blog.author]) {
        tykkaykset[blog.author] = { author: blog.author, likes: blog.likes }
      }
      else {
        tykkaykset[blog.author].likes += blog.likes
      }
    })
  return _.maxBy(Object.values(tykkaykset), 'likes')
  
  
  }

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }