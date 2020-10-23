const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const app = express()
const {Restaurant, sequelize, Item} = require('./models')

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/restaurants', async (req, res) => {
    console.log(req.body)
    await Restaurant.create(req.body)
    res.redirect('/restaurants')
})

app.get(['/', '/restaurants'], async (request, response) => {
    const restaurants = await Restaurant.findAll({
        include: 'menus'
    })
    response.render('restaurants', {restaurants})
})

app.get('/restaurants/:id', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    const menus = await restaurant.getMenus({
        include: [{model: Item, as: "items"}],
        nest: true
    })
    res.render('restaurant', {restaurant, menus})
})

app.get('/restaurants/:id/delete', (req, res) => {
    Restaurant.findByPk(req.params.id)
        .then(restaurant => {
            restaurant.destroy()
            res.redirect('/')
        })
})

app.post('/restaurants/:id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    await restaurant.update(req.body)
    res.redirect(`/restaurants/${restaurant.id}`)
})

app.listen(3000, async () => {
    await sequelize.sync()
    console.log('web server running on port 3000')
})