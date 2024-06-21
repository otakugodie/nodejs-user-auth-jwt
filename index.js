import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()
app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())

app.use(req, res, next) => {
    const token = req.cookies.access_token
    let data = null
}
// const PORT = process.env.PORT ?? 3000



app.get('/', (req, res) => {
  // res.send('<h1>Hello</h1>')  
  if (!token) return res.render('index')
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    // res.render('protected', data)
    res.render('index', data)
  } catch (error) {
    res.render('index')
  }
  // res.render('index')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign(
      { id: user._id, username: user.username },
      SECRET_JWT_KEY,
      {
        expiresIn: '1h'
      })
    res
      .cookie('access_token', token, {
        httpOnly: true, // cookie available only in server
        secure: process.env.NODE_ENV === 'production', // cookie available only in https
        sameSite: 'strict', // cookie available only with the same domain
        maxAge: 1000 * 60 * 60 // 1h
      })
      .send({ user, token })
  } catch (error) {
    res.status(401).send(error.message)
  }
})
app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)
  // console.log({ username, password })

  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    // console.log(`Error: ${error}`)
    res.status(400).send(error.message)
  }
})

app.post('/logout', (req, res) => {})

app.get('/protected', (req, res) => {
  const token = req.cookies.access_token
  if (!token) {
    return res.status(403).send('Access not authorized')
  }
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    // console.log(data)
    res.render('protected', data)
  } catch (error) {
    res.status(401).send('Access not authorized')
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
