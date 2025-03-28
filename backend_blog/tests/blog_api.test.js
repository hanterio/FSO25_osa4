const { test, after, beforeEach, describe } = require('node:test')

const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})

describe('Testing api', () => {
    test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('there are two blog entrys', async () => {
        const response = await api.get('/api/blogs')
    
        assert.strictEqual(response.body.length, 2)
    })

    test('blog id is id, not _id', async () => {
        const response = await api.get('/api/blogs')

        response.body.forEach(blog => {
            assert.strictEqual(typeof blog.id === 'string', true)
        })
    })
})
describe('adding blogs', () => {
    test('a blog can be added', async () => {
        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
            likes: 122,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')

        const contents = response.body.map(b => b.title)

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

        assert(contents.includes('Uusi blogipäivitys, testi'))
    })
    test('if likes not added then 0', async () => {
        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        const lisattyBlog = response.body[response.body.length - 1]

        assert.strictEqual(lisattyBlog.likes, 0)
    })
    test('if title missing then 400', async () => {
        const newBlog = {
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
            likes: 120,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

    })
    test('if url missing then 400', async () => {
        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            likes: 120,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

    })
})

describe('deleting blogs', () => {
    test('blog can be deleted', async () => {
        const blogAtStart = await helper.blogsInDb()
        const blogToDelete = blogAtStart[0]
    
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .expect(204)
    
        const blogsAtEnd = await helper.blogsInDb()
    
        const contents = blogsAtEnd.map(r => r.title)
        assert(!contents.includes(blogToDelete.title))
    
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      })
})
after(async () => {
  await mongoose.connection.close()
})