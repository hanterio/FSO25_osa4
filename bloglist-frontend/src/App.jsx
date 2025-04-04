import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
 

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [message, setMessage] = useState(null)

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

  const handleBlogAdd = (event) => {
    event.preventDefault()
    const uusiBlogi = {
      title: newTitle,
      author: newAuthor,
      url: newUrl
    }
    blogService
      .create(uusiBlogi)
      .then(response => {
        setMessage(
          `a new blog ${uusiBlogi.title} by ${uusiBlogi.author} added`
        )
        setTimeout(() => {
          setMessage(null)
        }, 2000)
        setBlogs(blogs.concat(response))
        setNewTitle('')
        setNewAuthor('')
        setNewUrl('')
      })
      .catch(error => {
        console.log(error.response.data)
      })

  }
  const handleTitleAdd = async (event) => {
    setNewTitle(event.target.value)
    
  }
  const handleAuthorAdd = async (event) => {
    setNewAuthor(event.target.value)
    
  }
  const handleUrlAdd = async (event) => {
    setNewUrl(event.target.value)
  }
  const blogForm = () => (
    <form onSubmit={handleBlogAdd}>
      <div>
        title:
        <input
        type="text"
        value={newTitle}
        name="Title"
        onChange={handleTitleAdd}
        />
      </div>
      <div>
        author:
        <input
        type="text"
        value={newAuthor}
        name="Author"
        onChange={handleAuthorAdd}
        />
      </div>
      <div>
        url:
        <input
        type="text"
        value={newUrl}
        name="Url"
        onChange={handleUrlAdd}
        />
      </div>
      <button type="submit">create</button>
    </form>
  )
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
      <h2>blogs</h2>
      <p> {user.name} logged in {logoutButton()}</p>
      
      {blogForm()}
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
      </div>}
    </div>
  )}

export default App