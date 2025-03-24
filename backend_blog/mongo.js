const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const title = process.argv[3]
const author = process.argv[4]
const url = process.argv[5]
const likes = process.argv[6]

const testUrl =
  `mongodb+srv://hanterio:${password}@fso2025.b68e4.mongodb.net/testBlogApp?retryWrites=true&w=majority&appName=FSO2025`

mongoose.set('strictQuery', false)
mongoose.connect(testUrl)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
  title: `${title}`,
  author: `${author}`,
  url: `${url}`,
  likes: `${likes}`,
})

blog.save().then(() => {
  console.log('blog saved!')
  mongoose.connection.close()
})
/*
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})*/