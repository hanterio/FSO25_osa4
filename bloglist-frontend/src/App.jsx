import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login' 

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [message, setMessage] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }
  const handleLogout = async (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    console.log(blogFormRef.current)
    blogService
      .create(blogObject)
      .then(response => {
        setMessage(
          `a new blog ${blogObject.title} by ${blogObject.author} added`
        )
        setTimeout(() => {
          setMessage(null)
        }, 2000)
        setBlogs(blogs.concat(response))
      })
      .catch(error => {
        console.log(error.response.data)
      })
  }

  const handleLike = async (paivitettyBlogi) => {
    try {
      const paivitettavaBlogi = {
        ...paivitettyBlogi,
        likes: paivitettyBlogi.likes + 1
      }
      const uusiBlogi = await blogService.update(paivitettavaBlogi.id, paivitettavaBlogi)

      setBlogs(blogs.map(blog => blog.id !== uusiBlogi.id ? blog : uusiBlogi))
    } catch (error) {
      console.error('Tykkäyksen päivittäminen epäonnistui', error)
    }
  }

  const handlePoisto = async (blog) => {
    const vahvistus = window.confirm(`Remove ${blog.title} by ${blog.author}?`)
    if (!vahvistus) {
      return
    }

    try {
      await blogService.remove(blog.id)

      setBlogs(prevBlogs => {
        const newBlogs = prevBlogs.filter(b => b.id !== blog.id)
        return newBlogs
      })
    } catch (error) {
      console.error("Error removing blog entry")
    }
  }

  const loginForm = () => (
    
    <form onSubmit={handleLogin}>
      <div>
      <h2>Login</h2>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>      
  )

  const logoutButton = () => (
        <button type="button" onClick={handleLogout}>logout</button>      
  )


  return (
    <div>       
      <Notification
        message={message || errorMessage}
        className={errorMessage ? 'errorMessage' : 'message'}/>
      {!user && loginForm()}
      {user && <div>
      <h2>Blogs</h2>
      <p> {user.name} logged in {logoutButton()}</p>
      <Togglable buttonLabel='new Blog' ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>

      {blogs.sort((a, b) => a.likes - b.likes).map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          user={user}
          onLike={handleLike}
          poistaBlogi={handlePoisto}
        />
      )}
      </div>}
    </div>
  )}

export default App