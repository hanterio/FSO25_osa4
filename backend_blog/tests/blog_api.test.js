const { test, after, beforeEach, describe } = require('node:test')

const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const helper = require('./test_helper')

const User = require('../models/user')
const Blog = require('../models/blog')
const { send } = require('node:process')
beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'kokeilu', passwordHash })
    await user.save()

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
        const kirjautuminen = {
            username: 'kokeilu',
            password: 'salainen'
        }
        const loginResponse = await api
            .post('/api/login')
            .send(kirjautuminen)
        
        const token = loginResponse.body.token

        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
            likes: 122,
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const response = await api.get('/api/blogs')

        const contents = response.body.map(b => b.title)

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

        assert(contents.includes('Uusi blogipäivitys, testi'))
    })
    test('if likes not added then 0', async () => {        
        const kirjautuminen = {
            username: 'kokeilu',
            password: 'salainen'
        }
        const loginResponse = await api
            .post('/api/login')
            .send(kirjautuminen)
        
        const token = loginResponse.body.token

        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        const lisattyBlog = response.body[response.body.length - 1]

        assert.strictEqual(lisattyBlog.likes, 0)
    })
    test('if title missing then 400', async () => {
        const kirjautuminen = {
            username: 'kokeilu',
            password: 'salainen'
        }
        const loginResponse = await api
            .post('/api/login')
            .send(kirjautuminen)
        
        const token = loginResponse.body.token
        
        const newBlog = {
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
            likes: 120,
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

    })
    test('if url missing then 400', async () => {
        const kirjautuminen = {
            username: 'kokeilu',
            password: 'salainen'
        }
        const loginResponse = await api
            .post('/api/login')
            .send(kirjautuminen)
        
        const token = loginResponse.body.token
        
        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            likes: 120,
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)

    })
    test('a blog can not be added if token is missing', async () => {        

        const newBlog = {
            title: 'Uusi blogipäivitys, testi',
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
            likes: 122,
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        
        const response = await api.get('/api/blogs')

        const contents = response.body.map(b => b.title)

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
})

describe('deleting blogs', () => {
    test('blog can be deleted', async () => {
        const passwordHash = await bcrypt.hash('salainen', 10)
        const user = new User({ username: 'kokeilu2', passwordHash })
        await user.save()
        const newBlog = new Blog({
            title: 'Uusi blogipäivitys tuhoamista varten, testi',
            author: 'Pekka Päivittäjä',
            url: 'osoite.fi',
            likes: 122,
            user: user._id
        })
        await newBlog.save()
        const kirjautuminen = {
            username: 'kokeilu2',
            password: 'salainen'
        }
        const loginResponse = await api
            .post('/api/login')
            .send(kirjautuminen)
        
        const token = loginResponse.body.token

        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart.find(b => b.title === 'Uusi blogipäivitys tuhoamista varten, testi')
        console.log('Blog user ID:', blogToDelete.user.toString());
        console.log('Authenticated user ID:', user._id.toString())
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)
    
        const blogsAtEnd = await helper.blogsInDb()
    
        const contents = blogsAtEnd.map(r => r.title)
        assert(!contents.includes(blogToDelete.title))
    
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      })
})
describe('blogien muokkaamista', () => {
    test('the likes of a blog can be changed', async () => {
        const blogAtStart = await helper.blogsInDb()
        const blogToChange = blogAtStart[0]
        
        const updatedBlogData = {
            title: blogToChange.title,
            author: blogToChange.author,
            url: blogToChange.url,
            likes: blogToChange.likes + 1
        }

        const response = await api
          .put(`/api/blogs/${blogToChange.id}`)
          .send(updatedBlogData)
          .expect(200)
          .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb()
        
        const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToChange.id)
        assert.strictEqual(updatedBlog.likes, blogToChange.likes + 1)
      })

})
describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
      test('username creation fails with proper statuscode and message if username too short', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'ro',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('is shorter than the minimum allowed length (3).'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
      test('username creation fails with proper statuscode and message if password too short', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'root1',
          name: 'Superuser',
          password: 'sa',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('password too short'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      })
  })
after(async () => {
  await mongoose.connection.close()
})