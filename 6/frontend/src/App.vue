<script>
export default {
  data() {
    return {
      activeTab: 'Products',
      products: [],
      suppliers: [],
      shops: [],
      helpText: '',
      newProduct: { name: '', price: 0 },
      newSupplier: { name: '' },
      newShop: { name: '' },
      host: 'http://localhost:8080',
      selectedSupplier: null,
      selectedProduct: null,
      supplierProductQuantity: null,
      selectedShop: null,
      shopOrderSummary: null
    };
  },
  methods: {
    async fetchData(endpoint) {
      try {
        const res = await fetch(this.host + endpoint);
        return await res.json();
      } catch (e) {
        console.error('Ошибка:', e);
      }
    },
    async addData(endpoint, data) {
      try {
        const res = await fetch(this.host + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await res.json();
      } catch (e) {
        console.error('Ошибка:', e);
      }
    },
    async addProduct() {
      await this.addData('/products', this.newProduct);
      this.products = await this.fetchData('/products')
      this.newProduct = { name: '', price: 0 };

    },
    async addSupplier() {
      await this.addData('/suppliers', this.newSupplier);
      this.suppliers = await this.fetchData('/suppliers');
      this.newSupplier = { name: '' };
    },
    async addShop() {
      await this.addData('/shops', this.newShop);
      this.shops = await this.fetchData('/shops');
      this.newShop = { name: '' };
    },
    async deleteData(endpoint, id) {
        try {
            await fetch(this.host + endpoint + '/' + id, {
                method: 'DELETE',
            });
        } catch (e) {
            console.error('Ошибка:', e);
        }
    },
    async deleteProduct(id) {
        await this.deleteData('/products', id);
        this.products = await this.fetchData('/products');
    },
    async deleteSupplier(id) {
        await this.deleteData('/suppliers', id);
        this.suppliers = await this.fetchData('/suppliers');
    },
    async deleteShop(id) {
        await this.deleteData('/shops', id);
        this.shops = await this.fetchData('/shops');
    },
    async getSupplierProductQuantity() {
        if (this.selectedSupplier && this.selectedProduct) {
            const result = await this.fetchData(`/supplier_orders/${this.selectedSupplier}/products/${this.selectedProduct}`);
            this.supplierProductQuantity = result.total_quantity;
        }
    },
    async getShopOrderSummary() {
        if (this.selectedShop) {
            this.shopOrderSummary = await this.fetchData(`/shop_orders/${this.selectedShop}/summary`);
        }
    }
  },
  async mounted() {
    this.products = await this.fetchData('/products');
    this.suppliers = await this.fetchData('/suppliers');
    this.shops = await this.fetchData('/shops');
    const help = await this.fetchData('/help');
    this.helpText = help.text;

    if (this.suppliers.length > 0) {
        this.selectedSupplier = this.suppliers[0].id;
    }
    if (this.products.length > 0) {
        this.selectedProduct = this.products[0].id;
    }
    if (this.shops.length > 0) {
        this.selectedShop = this.shops[0].id;
    }

    this.getSupplierProductQuantity();
    this.getShopOrderSummary();
  },
};
</script>

<template>
  <div>
    <button @click="activeTab = 'Products'">Ассортимент</button>
    <button @click="activeTab = 'Suppliers'">Поставщики</button>
    <button @click="activeTab = 'Shops'">Магазины</button>
    <button @click="activeTab = 'SupplierOrders'">Заказы поставщикам</button>
    <button @click="activeTab = 'ShopOrders'">Заказы от магазинов</button>
    <button @click="activeTab = 'Help'">Справка</button>

    <div v-if="activeTab === 'Products'">
      <h2>Ассортимент</h2>
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Цена</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.price }}</td>
            <td><button @click="deleteProduct(product.id)">Удалить</button></td>
          </tr>
        </tbody>
      </table>
        <div>
            <input v-model="newProduct.name" placeholder="Название продукта"/>
            <input v-model="newProduct.price" placeholder="Цена" type="number"/>
            <button @click="addProduct">Добавить продукт</button>
        </div>
    </div>

    <div v-if="activeTab === 'Suppliers'">
      <h2>Поставщики</h2>
       <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in suppliers" :key="supplier.id">
            <td>{{ supplier.name }}</td>
            <td><button @click="deleteSupplier(supplier.id)">Удалить</button></td>
          </tr>
        </tbody>
      </table>
       <div>
            <input v-model="newSupplier.name" placeholder="Название поставщика"/>
            <button @click="addSupplier">Добавить поставщика</button>
        </div>
    </div>

    <div v-if="activeTab === 'Shops'">
      <h2>Магазины</h2>
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shop in shops" :key="shop.id">
            <td>{{ shop.name }}</td>
            <td><button @click="deleteShop(shop.id)">Удалить</button></td>
          </tr>
        </tbody>
      </table>
        <div>
            <input v-model="newShop.name" placeholder="Название магазина"/>
            <button @click="addShop">Добавить магазин</button>
        </div>
    </div>

    <div v-if="activeTab === 'SupplierOrders'">
        <h2>Заказы поставщикам</h2>
        <div>
            <select v-model="selectedSupplier" @change="getSupplierProductQuantity">
                <option v-for="supplier in suppliers" :value="supplier.id" :key="supplier.id">{{ supplier.name }}</option>
            </select>
            <select v-model="selectedProduct" @change="getSupplierProductQuantity">
                <option v-for="product in products" :value="product.id" :key="product.id">{{ product.name }}</option>
            </select>
            <div v-if="supplierProductQuantity !== null">
                Количество: {{ supplierProductQuantity }}
            </div>
        </div>
    </div>

    <div v-if="activeTab === 'ShopOrders'">
        <h2>Заказы от магазинов</h2>
        <div>
            <select v-model="selectedShop" @change="getShopOrderSummary">
                <option v-for="shop in shops" :value="shop.id" :key="shop.id">{{ shop.name }}</option>
            </select>
            <div v-if="shopOrderSummary">
                <h3>Общая сумма заказа: {{ shopOrderSummary.total_order_amount }}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Продукт</th>
                            <th>Количество</th>
                            <th>Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in shopOrderSummary.items" :key="item.name">
                            <td>{{ item.name }}</td>
                            <td>{{ item.total_quantity }}</td>
                            <td>{{ item.total_amount }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div v-if="activeTab === 'Help'">
      <h2>Справка</h2>
      <p>{{ helpText }}</p>
    </div>
  </div>
</template>
