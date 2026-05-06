
        // ==========================================
        // BACKEND SIMULATION (Node/Mongo Logic)
        // ==========================================
        
        // Simulating MongoDB Collections
        const DB = {
            products: [
                { id: 1, name: "Quantum Pro Earbuds", price: 199, category: "Audio", image: "", description: "Premium noise cancelling earbuds", stock: 45, rating: 4.5, badge: "new" },
                { id: 2, name: "Smart Watch Ultra", price: 499, category: "Wearables", image: "", description: "Advanced health monitoring smartwatch", stock: 23, rating: 4.8, badge: "" },
                { id: 3, name: "Phantom X Phone", price: 999, category: "Phones", image: "", description: "Next-gen flagship smartphone", stock: 12, rating: 4.7, badge: "sale" },
                { id: 4, name: "VR Gaming Headset", price: 349, category: "Gaming", image: "", description: "Immersive virtual reality experience", stock: 34, rating: 4.3, badge: "" },
                { id: 5, name: "Wireless Speaker Max", price: 129, category: "Audio", image: "", description: "360° room filling sound", stock: 67, rating: 4.2, badge: "" },
                { id: 6, name: "Fitness Band Lite", price: 79, category: "Wearables", image: "", description: "Lightweight fitness tracker", stock: 89, rating: 4.0, badge: "new" },
                { id: 7, name: "Gaming Console Pro", price: 549, category: "Gaming", image: "", description: "4K gaming at 120fps", stock: 8, rating: 4.9, badge: "sale" },
                { id: 8, name: "Studio Headphones", price: 299, category: "Audio", image: "", description: "Professional studio quality sound", stock: 31, rating: 4.6, badge: "" }
            ],
            users: [
                { id: 1, email: "demo@nexstore.com", name: "Demo User", password: "password" }
            ],
            orders: [
                { id: 1001, userId: 1, items: [{name: "Quantum Pro Earbuds", qty: 1, price: 199}], total: 199, status: "Delivered", date: "2023-10-15" },
                { id: 1002, userId: 1, items: [{name: "Smart Watch Ultra", qty: 1, price: 499}], total: 499, status: "Shipped", date: "2023-10-28" }
            ]
        };

        // API Service (Simulating Node.js Routes)
        class APIService {
            // GET /api/products
            getProducts(filters = {}) {
                let result = [...DB.products];
                if (filters.category) result = result.filter(p => p.category === filters.category);
                if (filters.search) result = result.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
                if (filters.price) {
                    const [min, max] = filters.price.split('-').map(Number);
                    result = result.filter(p => p.price >= min && p.price <= max);
                }
                return result;
            }

            // POST /api/products (Admin)
            addProduct(product) {
                const newProduct = { ...product, id: Date.now(), rating: 0, badge: "" };
                DB.products.push(newProduct);
                return newProduct;
            }

            // PUT /api/products/:id (Admin)
            updateProduct(id, updates) {
                const index = DB.products.findIndex(p => p.id == id);
                if (index !== -1) {
                    DB.products[index] = { ...DB.products[index], ...updates };
                    return DB.products[index];
                }
                return null;
            }

            // DELETE /api/products/:id (Admin)
            deleteProduct(id) {
                DB.products = DB.products.filter(p => p.id !== id);
                return { success: true };
            }

            // POST /api/orders
            createOrder(userId, items, total) {
                const newOrder = {
                    id: Date.now(),
                    userId,
                    items,
                    total,
                    status: "Processing",
                    date: new Date().toISOString().split('T')[0]
                };
                DB.orders.push(newOrder);
                return newOrder;
            }

            // GET /api/orders/:userId
            getOrders(userId) {
                return DB.orders.filter(o => o.userId === userId);
            }

            // POST /api/auth/login
            login(email, password) {
                return DB.users.find(u => u.email === email && u.password === password) || null;
            }
        }

        const api = new APIService();

        // ==========================================
        // FRONTEND APPLICATION (Angular-like Logic)
        // ==========================================

        class App {
            constructor() {
                this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
                this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                this.user = JSON.parse(localStorage.getItem('user') || 'null');
                this.currentView = 'grid';
                this.init();
            }

            init() {
                this.renderProducts();
                this.updateCounts();
                this.updateAuthUI();
                this.renderCart();
                this.renderWishlist();
                this.renderOrders();
                this.renderAdminTable();
            }

            // --- Product Rendering ---
            renderProducts(products = null) {
                const grid = document.getElementById('productsGrid');
                if (!products) products = api.getProducts();
                
                grid.innerHTML = products.map(p => `
                    <div class="card overflow-hidden group">
                        <div class="product-img">
                            ${p.badge ? `<span class="badge badge-${p.badge}">${p.badge}</span>` : ''}
                            ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover absolute inset-0">` : 
                            `<span class="text-4xl opacity-20">${this.getIcon(p.category)}</span>`}
                        </div>
                        <div class="p-4">
                            <p class="text-xs text-[var(--fg-muted)] uppercase tracking-wider mb-1">${p.category}</p>
                            <h4 class="font-semibold mb-1 truncate">${p.name}</h4>
                            <div class="flex items-center gap-1 mb-2">
                                ${this.renderStars(p.rating)}
                                <span class="text-xs text-[var(--fg-muted)] ml-1">(${p.rating})</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-bold" style="color: var(--accent)">Rs${p.price}</span>
                                <div class="flex gap-1">
                                    <button onclick="app.toggleWishlistItem(${p.id})" class="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors ${this.wishlist.includes(p.id) ? 'text-[var(--danger)]' : 'text-[var(--fg-muted)]'}">
                                        <svg width="18" height="18" fill="${this.wishlist.includes(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                    </button>
                                    <button onclick="app.addToCart(${p.id})" class="p-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-80 transition-colors">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                document.getElementById('productCountStat').innerText = DB.products.length;
            }

            getIcon(cat) {
                const icons = { Audio: '🎧', Wearables: '⌚', Phones: '📱', Gaming: '🎮' };
                return icons[cat] || '📦';
            }

            renderStars(r) {
                let s = '';
                for(let i=1; i<=5; i++) s += `<span class="star ${i <= r ? 'active' : ''}">★</span>`;
                return s;
            }

            filterProducts() {
                const cat = document.getElementById('categoryFilter').value;
                const price = document.getElementById('priceFilter').value;
                const search = document.getElementById('searchInput').value;
                this.renderProducts(api.getProducts({ category: cat, price, search }));
            }

            handleSearch(val) {
                this.filterProducts();
            }

            setView(type) {
                // Logic to switch between grid/list view can be expanded
            }

            // --- Cart Logic ---
            addToCart(id) {
                const existing = this.cart.find(i => i.id === id);
                if (existing) existing.qty++;
                else this.cart.push({ id, qty: 1 });
                this.saveCart();
                this.renderCart();
                this.updateCounts();
                this.showNotification("Added to cart");
            }

            removeFromCart(id) {
                this.cart = this.cart.filter(i => i.id !== id);
                this.saveCart();
                this.renderCart();
                this.updateCounts();
            }

            updateQty(id, change) {
                const item = this.cart.find(i => i.id === id);
                if (item) {
                    item.qty += change;
                    if (item.qty <= 0) this.removeFromCart(id);
                    else { this.saveCart(); this.renderCart(); this.updateCounts(); }
                }
            }

            saveCart() {
                localStorage.setItem('cart', JSON.stringify(this.cart));
            }

            renderCart() {
                const container = document.getElementById('cartItems');
                if (this.cart.length === 0) {
                    container.innerHTML = `<div class="text-center py-10 text-[var(--fg-muted)]">Your cart is empty</div>`;
                } else {
                    let total = 0;
                    container.innerHTML = this.cart.map(item => {
                        const product = DB.products.find(p => p.id === item.id);
                        if(!product) return '';
                        total += product.price * item.qty;
                        return `
                            <div class="flex gap-4 mb-4 pb-4 border-b border-[var(--border)]">
                                <div class="w-16 h-16 rounded-lg bg-[var(--bg)] flex items-center justify-center text-xl">
                                    ${this.getIcon(product.category)}
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-medium text-sm">${product.name}</h4>
                                    <p class="text-sm text-[var(--fg-muted)]">$${product.price}</p>
                                    <div class="flex items-center gap-2 mt-1">
                                        <button onclick="app.updateQty(${item.id}, -1)" class="w-6 h-6 rounded bg-[var(--bg-elevated)] text-xs">-</button>
                                        <span class="text-sm w-4 text-center">${item.qty}</span>
                                        <button onclick="app.updateQty(${item.id}, 1)" class="w-6 h-6 rounded bg-[var(--bg-elevated)] text-xs">+</button>
                                    </div>
                                </div>
                                <button onclick="app.removeFromCart(${item.id})" class="text-[var(--fg-muted)] hover:text-[var(--danger)]">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        `;
                    }).join('');
                    document.getElementById('cartTotal').innerText = `$${total.toFixed(2)}`;
                }
            }

            toggleCart() {
                document.getElementById('cartSidebar').classList.toggle('open');
                document.getElementById('cartOverlay').classList.toggle('open');
            }

            // --- Wishlist Logic ---
            toggleWishlistItem(id) {
                if (this.wishlist.includes(id)) {
                    this.wishlist = this.wishlist.filter(i => i !== id);
                    this.showNotification("Removed from wishlist");
                } else {
                    this.wishlist.push(id);
                    this.showNotification("Added to wishlist");
                }
                localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
                this.renderProducts(); // Re-render to update icons
                this.renderWishlist();
                this.updateCounts();
            }

            renderWishlist() {
                const container = document.getElementById('wishlistItems');
                if (this.wishlist.length === 0) {
                    container.innerHTML = `<div class="text-center py-10 text-[var(--fg-muted)]">Your wishlist is empty</div>`;
                } else {
                    container.innerHTML = this.wishlist.map(id => {
                        const product = DB.products.find(p => p.id === id);
                        if(!product) return '';
                        return `
                            <div class="flex gap-4 mb-4 pb-4 border-b border-[var(--border)]">
                                <div class="w-16 h-16 rounded-lg bg-[var(--bg)] flex items-center justify-center text-xl">
                                    ${this.getIcon(product.category)}
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-medium text-sm">${product.name}</h4>
                                    <p class="text-sm font-bold" style="color: var(--accent)">$${product.price}</p>
                                </div>
                                <button onclick="app.addToCart(${product.id}); app.toggleWishlistItem(${product.id});" class="btn-primary text-xs py-1 px-2 h-fit">Add</button>
                            </div>
                        `;
                    }).join('');
                }
            }

            toggleWishlist() {
                document.getElementById('wishlistSidebar').classList.toggle('open');
                document.getElementById('wishlistOverlay').classList.toggle('open');
            }

            updateCounts() {
                const cartCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
                document.getElementById('cartCount').innerText = cartCount;
                document.getElementById('wishlistCount').innerText = this.wishlist.length;
            }

            // --- Checkout & Payment ---
            checkout() {
                if (this.cart.length === 0) return;
                if (!this.user) {
                    this.toggleCart();
                    document.getElementById('authModal').classList.add('active');
                    return;
                }
                
                this.toggleCart();
                document.getElementById('paymentModal').classList.add('active');
                document.getElementById('paymentProcessing').classList.remove('hidden');
                document.getElementById('paymentSuccess').classList.add('hidden');

                // Simulate Stripe/Razorpay API call
                setTimeout(() => {
                    const items = this.cart.map(c => {
                        const p = DB.products.find(pr => pr.id === c.id);
                        return { name: p.name, qty: c.qty, price: p.price };
                    });
                    const total = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
                    
                    api.createOrder(this.user.id, items, total);
                    this.cart = [];
                    this.saveCart();
                    this.renderCart();
                    this.updateCounts();
                    this.renderOrders();

                    document.getElementById('paymentProcessing').classList.add('hidden');
                    document.getElementById('paymentSuccess').classList.remove('hidden');
                }, 2500);
            }

            closePaymentModal() {
                document.getElementById('paymentModal').classList.remove('active');
            }

            // --- Orders ---
            renderOrders() {
                const container = document.getElementById('ordersList');
                const orders = api.getOrders(1); // Hardcoded user 1 for demo
                if (orders.length === 0) {
                    container.innerHTML = `<div class="card p-10 text-center text-[var(--fg-muted)]">No orders yet</div>`;
                } else {
                    container.innerHTML = orders.sort((a,b) => b.id - a.id).map(o => `
                        <div class="card p-6">
                            <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border)]">
                                <div>
                                    <span class="text-xs text-[var(--fg-muted)]">Order #${o.id}</span>
                                    <h4 class="font-bold">${o.date}</h4>
                                </div>
                                <span class="status-badge ${o.status === 'Delivered' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--warning)]/20 text-[var(--warning)]'}">
                                    ${o.status}
                                </span>
                            </div>
                            <div class="space-y-2">
                                ${o.items.map(i => `
                                    <div class="flex justify-between text-sm">
                                        <span>${i.name} x ${i.qty}</span>
                                        <span class="font-medium">$${(i.price * i.qty).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-4 pt-4 border-t border-[var(--border)]">
                                <span class="font-bold">Total</span>
                                <span class="font-bold text-lg" style="color: var(--accent)">Rs ${o.total.toFixed(2)}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // --- Admin ---
            renderAdminTable() {
                const tbody = document.getElementById('adminProductTable');
                tbody.innerHTML = DB.products.map(p => `
                    <tr class="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)]">
                        <td class="p-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded bg-[var(--bg)] flex items-center justify-center">
                                    ${this.getIcon(p.category)}
                                </div>
                                <span class="font-medium">${p.name}</span>
                            </div>
                        </td>
                        <td class="p-4 text-[var(--fg-muted)]">${p.category}</td>
                        <td class="p-4">Rs ${p.price}</td>
                        <td class="p-4">${p.stock}</td>
                        <td class="p-4">
                            <button onclick="app.editProduct(${p.id})" class="text-[var(--accent)] hover:underline text-sm mr-2">Edit</button>
                            <button onclick="app.deleteProduct(${p.id})" class="text-[var(--danger)] hover:underline text-sm">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }

            openProductModal(id = null) {
                document.getElementById('productModal').classList.add('active');
                document.getElementById('modalTitle').innerText = id ? 'Edit Product' : 'Add Product';
                
                if (id) {
                    const p = DB.products.find(p => p.id === id);
                    document.getElementById('productId').value = p.id;
                    document.getElementById('productName').value = p.name;
                    document.getElementById('productPrice').value = p.price;
                    document.getElementById('productCategory').value = p.category;
                    document.getElementById('productDesc').value = p.description;
                } else {
                    document.getElementById('productId').value = '';
                    document.querySelector('#productModal form').reset();
                }
            }

            closeProductModal() {
                document.getElementById('productModal').classList.remove('active');
            }

            saveProduct(e) {
                e.preventDefault();
                const id = document.getElementById('productId').value;
                const data = {
                    name: document.getElementById('productName').value,
                    price: parseFloat(document.getElementById('productPrice').value),
                    category: document.getElementById('productCategory').value,
                    description: document.getElementById('productDesc').value,
                    stock: 10 // default
                };

                if (id) {
                    api.updateProduct(id, data);
                } else {
                    api.addProduct(data);
                }
                
                this.closeProductModal();
                this.renderProducts();
                this.renderAdminTable();
            }

            editProduct(id) {
                this.openProductModal(id);
            }

            deleteProduct(id) {
                if(confirm('Are you sure?')) {
                    api.deleteProduct(id);
                    this.renderProducts();
                    this.renderAdminTable();
                }
            }

            // --- Auth ---
            handleAuthClick() {
                if (this.user) {
                    this.user = null;
                    localStorage.removeItem('user');
                    this.updateAuthUI();
                    this.showNotification("Logged out");
                } else {
                    document.getElementById('authModal').classList.add('active');
                }
            }

            handleLogin(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const pass = document.getElementById('loginPassword').value;
                const user = api.login(email, pass);
                
                if (user) {
                    this.user = { id: user.id, name: user.name, email: user.email };
                    localStorage.setItem('user', JSON.stringify(this.user));
                    document.getElementById('authModal').classList.remove('active');
                    this.updateAuthUI();
                    this.showNotification(`Welcome back, ${user.name}!`);
                    this.renderOrders();
                } else {
                    alert("Invalid credentials");
                }
            }

            updateAuthUI() {
                const btn = document.getElementById('authBtn');
                if (this.user) {
                    btn.innerText = "Logout";
                } else {
                    btn.innerText = "Login";
                }
            }

            showNotification(msg) {
                // Simple notification logic
                const el = document.createElement('div');
                el.className = 'fixed bottom-4 right-4 bg-[var(--accent)] text-white px-4 py-2 rounded-lg shadow-lg z-[200] animate-pulse';
                el.innerText = msg;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }
        }

        // Router Simple
        const router = {
            navigate: (page) => {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById('page-' + page).classList.add('active');
            }
        };

        const app = new App();
  