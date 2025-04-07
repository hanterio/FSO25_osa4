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

  const hideWhenVisible = { display: viewAll ? 'none' : '' }
  const showWhenVisible = { display: viewAll ? '' : 'none' }

  const handleLiketys = () => {
    onLike(blog)
  }
  const handlePoisto = () => {
    poistaBlogi(blog)
  }

  return (
    <div style={blogStyle}>
      <div style={hideWhenVisible}>
        {blog.title} {blog.author} <button onClick={() => setViewAll(true)}>view</button>
      </div>
      <div style={showWhenVisible}>
        {blog.title} {blog.author} <button onClick={() => setViewAll(false)}>hide</button><br />
        {blog.url}<br />
        likes {blog.likes} <button onClick={handleLiketys}>like</button><br />
        {blog.user.name}<br />
        {user && blog.user.username === user.username && (
          <button onClick={handlePoisto}>remove</button>
        )}
      </div>
    </div>
  )}
export default Blog