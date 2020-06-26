var PRODUCTS_LOAD_COUNT = 4;
var monitor;

new Vue({
	el: "#app",
	data: {
		totalPrice: 0,
		products: [],
		cart: [],
		results: [],
		searchText: "cat",
		lastSearchText: "",
		isLoading: false,
	},
	methods: {
		addToCart: function (product) {
			this.totalPrice += product.price;

			for (var i = 0; i < this.cart.length; ++i) {
				if (this.cart[i].id === product.id) {
					// Update the item quantity if the item is already in the cart
					++this.cart[i].qty;
					return;
				}
			}

			this.cart.push({
				id: product.id,
				title: product.title,
				price: product.price,
				qty: 1,
			});
		},
		incrementQty: function (item) {
			++item.qty;
			this.totalPrice += item.price;
		},
		decrementQty: function (item) {
			--item.qty;
			this.totalPrice -= item.price;

			if (item.qty <= 0) {
				this.cart.splice(this.cart.indexOf(item), 1);
			}
		},
		onSearch: function () {
			this.products = [];
			this.results = [];
			this.isLoading = true;

			var url = "/search?q=" + this.searchText;
			this.$http.get(url).then(function (response) {
				this.results = response.body;
				this.products = response.body.slice(0, PRODUCTS_LOAD_COUNT);
				this.lastSearchText = this.searchText;
				this.isLoading = false;
			});
		},
		loadNewProducts: function () {
			if (
				this.products.length < this.results.length &&
				this.products.length !== 0
			) {
				var newProducts = this.results.slice(
					this.products.length,
					this.products.length + PRODUCTS_LOAD_COUNT
				);

				this.products = this.products.concat(newProducts);
			}
		},
	},
	filters: {
		currency: function (n) {
			return "$" + n.toFixed(2);
		},
	},
	created: function () {
		this.onSearch();
	},
	beforeUpdate: function () {
		if (monitor) {
			monitor.destroy();
			monitor = null;
		}
	},
	updated: function () {
		var sensor = document.getElementById("product-list-bottom");

		monitor = scrollMonitor.create(sensor);
		monitor.enterViewport(this.loadNewProducts);
	},
});
