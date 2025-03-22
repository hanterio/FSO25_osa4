const dummy = (blogs) => {
    return 1
  }
  
  

const totalLikes = (blogs) => {
    return blogs.reduce((summa, like) => summa + like.likes, 0)    
}

module.exports = {
    dummy,
    totalLikes
  }