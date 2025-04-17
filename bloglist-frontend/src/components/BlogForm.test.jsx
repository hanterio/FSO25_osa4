import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('lomake kutsuu takaisinkutsufunktiota oikeilla tiedoilla', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const inputTitle = screen.getByPlaceholderText('title')
  const inputAuthor = screen.getByPlaceholderText('author')
  const inputUrl = screen.getByPlaceholderText('url')
  const createButton = screen.getByText('create')

  await user.type(inputTitle, 'Esimerkkiblogi' )
  await user.type(inputAuthor, 'Erkki Esimerkki' )
  await user.type(inputUrl, 'esimerkkiblogi.com' )
  await user.click(createButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'Esimerkkiblogi',
    author: 'Erkki Esimerkki',
    url: 'esimerkkiblogi.com'
  })
})