const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Blogia pukkaa',
        author: 'Pasi Pukkaaja',
        url: 'osoite.com',
        likes: 22,
    },
    {
        title: 'Testi 2',
        author: 'Pilvi Pössyttelijä',
        url: 'mainio.com',
        likes: 322,
    },
  ]
const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ nimi: 'poistetaanpian' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
}