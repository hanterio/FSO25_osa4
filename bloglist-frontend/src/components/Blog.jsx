import { useState } from 'react'

const Blog = ({ blog, onLike, poistaBlogi, user }) => {
  const [viewAll, setViewAll] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }


  const toggleView = () => setViewAll(!viewAll)
  const showWhenVisible = { display: viewAll ? '' : 'none' }

  const handleLiketys = () => {
    onLike(blog)
  }
  const handlePoisto = () => {
    poistaBlogi(blog)
  }

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleView}>{viewAll ? 'hide' : 'view'}</button>
      </div>
      <div style={showWhenVisible}>
        <div>{blog.url}</div>
        <div>
          likes {blog.likes}
          <button onClick={handleLiketys}>like</button>
        </div>
        <div>{blog.user.name}</div>
        {user && blog.user.username === user.username && (
          <button onClick={handlePoisto}>remove</button>
        )}
      </div>
    </div>
  )}
export default Blog