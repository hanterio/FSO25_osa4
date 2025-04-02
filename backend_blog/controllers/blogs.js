const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1 })
      response.json(blogs)
      })

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'missing or invalid token' }) // 🔹 Muista 401!
  }
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch(exception) {
    next(exception)
  }      
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }
  if (!user) {
    return response.status(401).json({ error: "user not found" });
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: "not allowed, wrong user" });
  }
  
  if ( blog.user.toString() === user._id.toString() ) {
    await Blog.findByIdAndDelete(request.params.id)  
    response.status(204).end()
  } 
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const { title, author, url, likes } = request.body

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(404).end()
      }

      blog.title = title
      blog.author = author
      blog.url = url
      blog.likes = likes

      const updatedBlog = await blog.save()
      response.json(updatedBlog)
      } catch (error) {
        next(error)
      }
    })

module.exports = blogsRouter