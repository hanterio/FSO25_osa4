
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let blog
  let user

  beforeEach(() => {
    blog = {
      title: 'esimerkkiblogin otsikko',
      author: 'Bobi Blogisti',
      url: 'esimerkki.com',
      likes: 5,
      user: {
        username: 'testikäyttäjä',
        name: 'Testi Käyttäjä'
      }
    }

    user = {
      username: 'testikäyttäjä',
      name: 'Testi Käyttäjä'
    }

  })

  test('renderöi titlen ja authorin, ei urlia ja likeä', () => {
    render(<Blog blog={blog} user={user} onLike={() => {}} poistaBlogi={() => {}} />)
    const titleAndAuthorElement = screen.getByText('esimerkkiblogin otsikko Bobi Blogisti')
    expect(titleAndAuthorElement).toBeDefined()
  })
  
  test('näyttää urlin, likejen määrän ja käyttäjän nimen kun "view"-nappia on painettu', async () => {
    render(<Blog blog={blog} user={user} onLike={() => {}} poistaBlogi={() => {}} />)
    const userActions = userEvent.setup()

    const button = screen.getByText('view')
    await userActions.click(button)

    expect(screen.getByText('esimerkki.com')).toBeDefined()
    expect(screen.getByText('likes 5')).toBeDefined()
    expect(screen.getByText('Testi Käyttäjä')).toBeDefined()
  })

  test('kun like-nappia painetaan kaksi kertaa tapahtumaa kutsutaan kaksi kertaa', async () => {

    const mockHandler = vi.fn()

    render(
      <Blog blog={blog} onLike={mockHandler} poistaBlogi={() => {}} />
    )

    const userActions = userEvent.setup()

    const viewButton = screen.getByText('view')
    await userActions.click(viewButton)

    const likeButton = await screen.getByText('like')
    await userActions.click(likeButton)
    await userActions.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })
})
