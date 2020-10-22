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

app.get('/', async (request, response) => {
    const restaurants = await Restaurant.findAll({
        include: 'menus'
    })
    response.render('restaurants', {restaurants})
})

app.get('/about', (request, response) => {
    response.render('about', {date: new Date(), name: "Louis"})
})

app.get('/faqs', (request, response) => {
    response.render('faqs', {date: new Date()})
})

app.get('/restaurants', async (request, response) => {
    const restaurants = await Restaurant.findAll()
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

app.listen(3000, async () => {
    await sequelize.sync()
    console.log('web server running on port 3000')
})