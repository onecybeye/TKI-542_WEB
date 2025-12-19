
import express from 'express'
import cors from 'cors'
import pg from 'pg'

let pool = new pg.Pool({
    user: 'input your user',
    host: 'input your host',
    database: 'input your db',
    password: 'input your password',
    port: 5432});

let router = new express.Router();

class UserController 
{
    async createProduct(req, res)	{
        let { name, price } = req.body
        let newProduct = await pool.query(`INSERT INTO products (name, price) values ($1, $2) RETURNING *`, [ name, price ])
        res.json(newProduct.rows[0])
    }

    async getProducts(req, res){
        let products = await pool.query('SELECT * FROM products')
        res.json(products.rows)
    }

    async getProduct(req, res){
        let id = req.params.id
        let product = await pool.query('SELECT * FROM products WHERE id = $1', [id])
        res.json(product.rows[0])
    }

    async updateProduct(req, res){
        let { id, name, price } = req.body
        let updatedProduct = await pool.query('UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *', [name, price, id])
        res.json(updatedProduct.rows[0])
    }

    async deleteProduct(req, res){
        let id = req.params.id
        await pool.query('DELETE FROM products WHERE id = $1', [id])
        res.json({message: `Product with id ${id} deleted`})
    }

    async createSupplier(req, res)	{
        let { name } = req.body
        let newSupplier = await pool.query(`INSERT INTO suppliers (name) values ($1) RETURNING *`, [ name ])
        res.json(newSupplier.rows[0])
    }

    async getSuppliers(req, res){
        let suppliers = await pool.query('SELECT * FROM suppliers')
        res.json(suppliers.rows)
    }

    async getSupplier(req, res){
        let id = req.params.id
        let supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id])
        res.json(supplier.rows[0])
    }

    async updateSupplier(req, res){
        let { id, name } = req.body
        let updatedSupplier = await pool.query('UPDATE suppliers SET name = $1 WHERE id = $2 RETURNING *', [name, id])
        res.json(updatedSupplier.rows[0])
    }

    async deleteSupplier(req, res){
        let id = req.params.id
        await pool.query('DELETE FROM suppliers WHERE id = $1', [id])
        res.json({message: `Supplier with id ${id} deleted`})
    }

    async createShop(req, res)	{
        let { name } = req.body
        let newShop = await pool.query(`INSERT INTO shops (name) values ($1) RETURNING *`, [ name ])
        res.json(newShop.rows[0])
    }

    async getShops(req, res){
        let shops = await pool.query('SELECT * FROM shops')
        res.json(shops.rows)
    }

    async getShop(req, res){
        let id = req.params.id
        let shop = await pool.query('SELECT * FROM shops WHERE id = $1', [id])
        res.json(shop.rows[0])
    }

    async updateShop(req, res){
        let { id, name } = req.body
        let updatedShop = await pool.query('UPDATE shops SET name = $1 WHERE id = $2 RETURNING *', [name, id])
        res.json(updatedShop.rows[0])
    }

    async deleteShop(req, res){
        let id = req.params.id
        await pool.query('DELETE FROM shops WHERE id = $1', [id])
        res.json({message: `Shop with id ${id} deleted`})
    }

    async createShopOrder(req, res)	{
        let { shop_id, order_date, items } = req.body
        let newOrder = await pool.query(`INSERT INTO shop_orders (shop_id, order_date) values ($1, $2) RETURNING *`, [ shop_id, order_date ])
        let orderId = newOrder.rows[0].id
        for (let item of items) {
            await pool.query('INSERT INTO shop_order_items (shop_order_id, product_id, quantity) values ($1, $2, $3)', [orderId, item.product_id, item.quantity])
        }
        res.json(newOrder.rows[0])
    }

    async getShopOrders(req, res){
        let orders = await pool.query('SELECT * FROM shop_orders')
        res.json(orders.rows)
    }
    
    async getShopOrder(req, res){
        let id = req.params.id;
        let order = await pool.query('SELECT * FROM shop_orders WHERE id = $1', [id])
        let items = await pool.query('SELECT * FROM shop_order_items WHERE shop_order_id = $1', [id])
        order.rows[0].items = items.rows
        res.json(order.rows[0])
    }

    async createSupplierOrder(req, res)	{
        let { supplier_id, order_date, items } = req.body
        let newOrder = await pool.query(`INSERT INTO supplier_orders (supplier_id, order_date) values ($1, $2) RETURNING *`, [ supplier_id, order_date ])
        let orderId = newOrder.rows[0].id
        for (let item of items) {
            await pool.query('INSERT INTO supplier_order_items (supplier_order_id, product_id, quantity, amount) values ($1, $2, $3, $4)', [orderId, item.product_id, item.quantity, item.amount])
        }
        res.json(newOrder.rows[0])
    }

    async getSupplierOrders(req, res){
        let orders = await pool.query('SELECT * FROM supplier_orders')
        res.json(orders.rows)
    }

    async getSupplierOrder(req, res){
        let id = req.params.id
        let order = await pool.query('SELECT * FROM supplier_orders WHERE id = $1', [id])
        let items = await pool.query('SELECT * FROM supplier_order_items WHERE supplier_order_id = $1', [id])
        order.rows[0].items = items.rows
        res.json(order.rows[0])
    }

    async getHelp(req, res){
        let help = await pool.query('SELECT * FROM help')
        res.json(help.rows[0])
    }

    async getSupplierOrderProduct(req, res){
        let { supplier_id, product_id } = req.params
        let result = await pool.query('SELECT SUM(quantity) as total_quantity FROM supplier_order_items soi JOIN supplier_orders so ON soi.supplier_order_id = so.id WHERE so.supplier_id = $1 AND soi.product_id = $2', [supplier_id, product_id])
        res.json(result.rows[0])
    }

    async getShopOrderSummary(req, res){
        let { shop_id } = req.params
        let result = await pool.query('SELECT p.name, SUM(soi.quantity) as total_quantity, SUM(soi.quantity * p.price) as total_amount FROM shop_order_items soi JOIN products p ON soi.product_id = p.id JOIN shop_orders so ON soi.shop_order_id = so.id WHERE so.shop_id = $1 GROUP BY p.name', [shop_id])
        let total_order_amount = await pool.query('SELECT SUM(soi.quantity * p.price) as total_order_amount FROM shop_order_items soi JOIN products p ON soi.product_id = p.id JOIN shop_orders so ON soi.shop_order_id = so.id WHERE so.shop_id = $1', [shop_id])
        res.json({items: result.rows, total_order_amount: total_order_amount.rows[0].total_order_amount})
    }
}

let userController = new UserController()

router.post('/products', userController.createProduct)
router.get('/products', userController.getProducts)
router.get('/products/:id', userController.getProduct)
router.put('/products', userController.updateProduct)
router.delete('/products/:id', userController.deleteProduct)

router.post('/suppliers', userController.createSupplier)
router.get('/suppliers', userController.getSuppliers)
router.get('/suppliers/:id', userController.getSupplier)
router.put('/suppliers', userController.updateSupplier)
router.delete('/suppliers/:id', userController.deleteSupplier)

router.post('/shops', userController.createShop)
router.get('/shops', userController.getShops)
router.get('/shops/:id', userController.getShop)
router.put('/shops', userController.updateShop)
router.delete('/shops/:id', userController.deleteShop)

router.post('/shop_orders', userController.createShopOrder)
router.get('/shop_orders', userController.getShopOrders)
router.get('/shop_orders/:id', userController.getShopOrder)

router.post('/supplier_orders', userController.createSupplierOrder)
router.get('/supplier_orders', userController.getSupplierOrders)
router.get('/supplier_orders/:id', userController.getSupplierOrder)

router.get('/help', userController.getHelp)
router.get('/supplier_orders/:supplier_id/products/:product_id', userController.getSupplierOrderProduct)
router.get('/shop_orders/:shop_id/summary', userController.getShopOrderSummary)


let PORT = process.env.PORT || 8080;

let app = express();

app.use(express.json())

app.use(cors())

app.use('', router)

app.listen(PORT, () => console.log(`Сервер запущен на порте ${PORT}`))
