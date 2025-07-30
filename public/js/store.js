// YouTube-Style Store Application with Print-on-Demand Integration
console.log('🛍️ Store: JavaScript file loaded - START');

class StoreApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.cart = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'newest';
        
        // Free Analytics & Insights
        this.analytics = {
            totalViews: 0,
            totalSales: 0,
            conversionRate: 0,
            topProducts: [],
            recentOrders: []
        };
        
        // Free Inventory Management
        this.inventory = {
            lowStockThreshold: 5,
            outOfStockItems: [],
            restockAlerts: []
        };
        
        // Free Discount System
        this.discountCodes = {
            'WELCOME10': { discount: 10, type: 'percentage', valid: true },
            'SAVE20': { discount: 20, type: 'percentage', valid: true },
            'FREESHIP': { discount: 0, type: 'shipping', valid: true }
        };
        
        // Free Product Variants
        this.productVariants = {
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Black', 'White', 'Red', 'Blue', 'Green'],
            materials: ['Cotton', 'Polyester', 'Blend']
        };
        
        // Print-on-Demand Services (like YouTube) - ONLY TAX-HANDLING SERVICES
        this.podServices = {
            printful: {
                name: 'Printful',
                apiUrl: 'https://api.printful.com',
                apiKey: null, // Will be set by creator
                description: 'Premium POD service with automatic tax handling and high-quality products',
                products: ['t-shirts', 'hoodies', 'mugs', 'posters', 'phone-cases', 'accessories'],
                type: 'pod',
                taxHandling: {
                    automatic: true,
                    calculation: 'real-time',
                    collection: true,
                    remittance: true,
                    reporting: true,
                    compliance: ['US', 'EU', 'Canada', 'Australia'],
                    noLicenseRequired: true
                }
            },
            printify: {
                name: 'Printify',
                apiUrl: 'https://api.printify.com',
                apiKey: null, // Will be set by creator
                description: 'Wide variety of products with built-in tax compliance and competitive pricing',
                products: ['clothing', 'accessories', 'home-decor', 'tech-accessories', 'apparel'],
                type: 'pod',
                taxHandling: {
                    automatic: true,
                    calculation: 'real-time',
                    collection: true,
                    remittance: true,
                    reporting: true,
                    compliance: ['US', 'EU', 'UK', 'Canada'],
                    noLicenseRequired: true
                }
            },
            spring: {
                name: 'Spring (Teespring)',
                apiUrl: 'https://api.spring.com',
                apiKey: null, // Will be set by creator
                description: 'Social commerce platform with complete tax management and influencer tools',
                products: ['apparel', 'accessories', 'home-goods', 'lifestyle', 'clothing'],
                type: 'pod',
                taxHandling: {
                    automatic: true,
                    calculation: 'real-time',
                    collection: true,
                    remittance: true,
                    reporting: true,
                    compliance: ['US', 'EU', 'International'],
                    noLicenseRequired: true
                }
            },
            redbubble: {
                name: 'Redbubble',
                apiUrl: 'https://api.redbubble.com',
                apiKey: null, // Will be set by creator
                description: 'Artist marketplace with global tax compliance and creative community',
                products: ['art-prints', 'stickers', 'clothing', 'accessories', 'home-decor'],
                type: 'pod',
                taxHandling: {
                    automatic: true,
                    calculation: 'real-time',
                    collection: true,
                    remittance: true,
                    reporting: true,
                    compliance: ['US', 'EU', 'Australia', 'Global'],
                    noLicenseRequired: true
                }
            }
        };

        // Revenue Model - Amplifi takes 15% (vs competitors' 30%)
        this.revenueModel = {
            platformFee: 0.15,    // Amplifi gets 15%
            creatorRevenue: 0.85,  // Creator gets 85%
            description: 'Amplifi takes 15% platform fee (vs competitors\' 30%)'
        };
        
        // Category filter state
        this.categoryDropdown = null;
        
        this.init();
    }

    // Initialize the store
    init() {
        console.log('🛍️ Store: Initializing...');
        
        // Initialize Firebase
        this.initFirebase();
        this.setupAuthStateListener();
        this.setupEventListeners();
        
        // Setup category dropdown functionality with delay to ensure DOM is ready
        setTimeout(() => {
            this.setupCategoryDropdown();
        }, 1000);
        
        console.log('✅ Store initialized successfully!');
    }
    
    setupCategoryDropdown() {
        console.log('🛍️ Setting up category dropdown functionality...');
        
        // Wait for proper dropdown to be initialized with multiple retries
        let retryCount = 0;
        const maxRetries = 20; // Increased retries
        
        const waitForDropdown = () => {
            const dropdownContainer = document.querySelector('.proper-dropdown');
            console.log('🔍 Looking for proper dropdown container...', dropdownContainer ? 'Found' : 'Not found');
            
            if (dropdownContainer) {
                console.log('🔍 Checking if proper dropdown instance exists...', dropdownContainer.properDropdownInstance ? 'Yes' : 'No');
            }
            
            if (dropdownContainer && dropdownContainer.properDropdownInstance) {
                // Add category selection handlers
                const categoryItems = document.querySelectorAll('.dropdown-item[data-category]');
                console.log('🔍 Found category items:', categoryItems.length);
                
                categoryItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        const category = item.dataset.category;
                        console.log('🛍️ Category selected:', category);
                        this.selectCategory(category);
                    });
                });
                
                console.log('✅ Category dropdown functionality setup complete');
            } else if (retryCount < maxRetries) {
                retryCount++;
                console.log(`⚠️ Proper dropdown not ready, retrying... (${retryCount}/${maxRetries})`);
                setTimeout(waitForDropdown, 500); // Increased delay
            } else {
                console.log('❌ Failed to initialize category dropdown after maximum retries');
                console.log('🔍 Final check - proper dropdown elements in DOM:', document.querySelectorAll('.proper-dropdown').length);
                console.log('🔍 Final check - dropdown trigger elements in DOM:', document.querySelectorAll('.dropdown-trigger').length);
                console.log('🔍 Final check - dropdown menu elements in DOM:', document.querySelectorAll('.dropdown-menu').length);
            }
        };
        
        waitForDropdown();
    }
    
    // Old dropdown positioning removed - using proper dropdown system now
    


    // Old dropdown initialization removed - using proper dropdown system now
    
    // Old dropdown show function removed - using proper dropdown system now
    
    // Old dropdown hide function removed - using proper dropdown system now
    
    // Old positioning function removed - using showCategoryDropdown instead
    
    selectCategory(category) {
        this.currentCategory = category;
        
        // Update UI
        const selectedCategorySpan = document.getElementById('selectedCategory');
        const filterValueSpan = document.getElementById('filterValue');
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        
        if (selectedCategorySpan) {
            selectedCategorySpan.textContent = this.getCategoryDisplayName(category);
        }
        
        if (filterValueSpan) {
            filterValueSpan.textContent = this.getCategoryDisplayName(category);
        }
        
        // Show/hide clear filter button
        if (clearFilterBtn) {
            clearFilterBtn.style.display = category === 'all' ? 'none' : 'flex';
        }
        
        // Update selected state in dropdown
        document.querySelectorAll('.dropdown-item[data-category]').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.category === category) {
                option.classList.add('selected');
            }
        });
        
        // Filter products
        this.filterProducts();
    }
    
    getCategoryDisplayName(category) {
        const categoryNames = {
            'all': 'All Products',
            'clothing': 'Clothing',
            'accessories': 'Accessories',
            'home': 'Home & Living',
            'digital': 'Digital',
            'art': 'Art & Prints',
            'tech': 'Tech Accessories',
            'electronics': 'Electronics',
            'stickers': 'Stickers'
        };
        return categoryNames[category] || 'All Products';
    }
    
    clearCategoryFilter() {
        this.selectCategory('all');
    }
    
    filterProducts() {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productCategory = product.dataset.category;
            
            if (this.currentCategory === 'all' || productCategory === this.currentCategory) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
        
        // Update product count
        this.updateProductCount();
    }
    
    updateProductCount() {
        const visibleProducts = document.querySelectorAll('.product-card[style*="block"], .product-card:not([style*="none"])');
        const totalProducts = document.querySelectorAll('.product-card').length;
        
        // You can add a product count display here if needed
        console.log(`Showing ${visibleProducts.length} of ${totalProducts} products`);
    }

    // Initialize Firebase
    initFirebase() {
        console.log('🛍️ Store: Initializing Firebase...');
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.storage = firebase.storage();
        console.log('🛍️ Store: Firebase initialized successfully');
    }

    // Setup auth state listener (like feed.js)
    setupAuthStateListener() {
        console.log('🔍 Store: Setting up auth state listener...');
        this.auth.onAuthStateChanged(async (user) => {
            console.log('🔍 Store: Auth state changed, user:', user);
            console.log('🔍 Store: User UID:', user?.uid);
            console.log('🔍 Store: User email:', user?.email);
            
            if (user) {
                this.currentUser = user;
                console.log('✅ Store: User authenticated, loading creator info...');
                await this.loadCreatorInfo();
                await this.loadProducts();
                this.updateUIForAuthenticatedUser();
            } else {
                console.log('⚠️ Store: No authenticated user, showing unauthenticated UI');
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        // Setup search functionality with retry mechanism
        this.setupSearchFunctionality();
        
        // Setup sort functionality with retry mechanism
        this.setupSortFunctionality();
        
        console.log('✅ Event listeners setup complete');
    }
    
    setupSearchFunctionality() {
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            console.log('✅ Search input found, setting up listener');
            
            // Check if input is disabled
            console.log('🔍 Search input disabled:', searchInput.disabled);
            console.log('🔍 Search input readonly:', searchInput.readOnly);
            console.log('🔍 Search input style pointer-events:', searchInput.style.pointerEvents);
            
            // Force enable the input
            searchInput.disabled = false;
            searchInput.readOnly = false;
            searchInput.style.pointerEvents = 'auto';
            searchInput.style.userSelect = 'auto';
            searchInput.style.opacity = '1';
            searchInput.style.visibility = 'visible';
            
            // Remove any problematic CSS classes
            searchInput.classList.remove('disabled', 'readonly');
            
            // Add event listener
            searchInput.addEventListener('input', (e) => {
                console.log('🔍 Search query:', e.target.value);
                this.searchProducts(e.target.value);
            });
            
            // Add focus event for debugging
            searchInput.addEventListener('focus', (e) => {
                console.log('🔍 Search input focused');
            });
            
            // Add click event for debugging
            searchInput.addEventListener('click', (e) => {
                console.log('🔍 Search input clicked');
            });
            
            // Test if input is actually working
            setTimeout(() => {
                console.log('🧪 Testing search input functionality...');
                searchInput.focus();
                searchInput.value = 'test';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('🧪 Search input test completed');
            }, 2000);
            
            console.log('✅ Search input event listeners attached');
        } else {
            console.log('⚠️ Search input not found, retrying in 1 second...');
            setTimeout(() => this.setupSearchFunctionality(), 1000);
        }
    }
    
    setupSortFunctionality() {
        const sortSelect = document.getElementById('sortProducts');
        if (sortSelect) {
            console.log('✅ Sort select found, setting up listener');
            sortSelect.addEventListener('change', (e) => {
                console.log('📊 Sort changed to:', e.target.value);
                this.sortProducts(e.target.value);
            });
        } else {
            console.log('⚠️ Sort select not found, retrying in 1 second...');
            setTimeout(() => this.setupSortFunctionality(), 1000);
        }
    }

    // Update UI for authenticated users
    updateUIForAuthenticatedUser() {
        console.log('👤 User authenticated, updating UI...');
        
        // Load user's POD configurations
        this.loadPODConfigurations();
        
        // Load creator info and products
        this.loadCreatorInfo();
        this.loadProducts();
        
        // Show authenticated user elements
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'block';
        });
        
        // Hide unauthenticated elements
        document.querySelectorAll('.auth-not-required').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Update UI for unauthenticated users (like feed.js)
    updateUIForUnauthenticatedUser() {
        console.log('🛍️ Store: Updating UI for unauthenticated user');
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="login-prompt" style="text-align: center; padding: 4rem 2rem;">
                    <h2 style="margin-bottom: 1rem; color: #1f2937;">Welcome to the Creator Store</h2>
                    <p style="margin-bottom: 2rem; color: #6b7280; font-size: 1.1rem;">
                        Please log in to access the creator store and manage your merchandise.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.href='index.html'" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                            Go to Login
                        </button>
                        <button onclick="window.location.href='feed.html'" class="btn btn-secondary" style="padding: 0.75rem 2rem;">
                            Browse Feed
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Hide user-specific elements (like feed.js)
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.style.display = 'none';
    }

    // Load creator information
    async loadCreatorInfo() {
        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('creatorName').textContent = userData.displayName || 'Creator';
                document.getElementById('creatorBio').textContent = userData.bio || 'Support your favorite creator by purchasing their merchandise!';
                document.getElementById('userAvatar').src = userData.photoURL || 'assets/images/default-avatar.svg';
                document.getElementById('creatorAvatar').src = userData.photoURL || 'assets/images/default-avatar.svg';
            }
        } catch (error) {
            console.error('Error loading creator info:', error);
        }
    }

    // Load products with YouTube-style features
    async loadProducts() {
        try {
            // Simplified query to avoid index requirement
            const productsSnapshot = await this.db.collection('products')
                .where('creatorId', '==', this.currentUser.uid)
                .get();

            this.products = [];
            productsSnapshot.forEach(doc => {
                this.products.push({ id: doc.id, ...doc.data() });
            });

            // If no products exist, create sample products
            if (this.products.length === 0) {
                console.log('🛍️ No products found. Creating sample products...');
                await this.createSampleProducts();
                // Reload products after creating samples
                const newProductsSnapshot = await this.db.collection('products')
                    .where('creatorId', '==', this.currentUser.uid)
                    .get();
                
                this.products = [];
                newProductsSnapshot.forEach(doc => {
                    this.products.push({ id: doc.id, ...doc.data() });
                });
            }

            // Sort by creation date in JavaScript instead of Firestore
            this.products.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
                return dateB - dateA;
            });

            this.renderProducts();
            this.updateProductCount();
            
            // Load analytics after products are loaded
            await this.loadAnalytics();
            
        } catch (error) {
            console.error('Error loading products:', error);
            
            // If there's an error, create sample products anyway
            console.log('🛍️ Error loading products. Creating sample products...');
            await this.createSampleProducts();
            
            // Try to load products again
            try {
                const productsSnapshot = await this.db.collection('products')
                    .where('creatorId', '==', this.currentUser.uid)
                    .get();

                this.products = [];
                productsSnapshot.forEach(doc => {
                    this.products.push({ id: doc.id, ...doc.data() });
                });

                this.renderProducts();
                this.updateProductCount();
                await this.loadAnalytics();
            } catch (retryError) {
                console.error('Error retrying product load:', retryError);
            }
        }
    }

    // Create sample products for demo
    async createSampleProducts() {
        console.log('🛍️ Creating sample products...');
        
        const sampleProducts = [
            {
                id: 'sample-1',
                name: 'Amplifi Creator T-Shirt',
                description: 'Premium cotton t-shirt with Amplifi branding. Perfect for creators and fans!',
                price: 24.99,
                category: 'clothing',
                image: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 50,
                serviceType: 'pod',
                podService: 'printful',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    sizes: ['S', 'M', 'L', 'XL'],
                    colors: ['Black', 'White', 'Navy']
                },
                views: 125,
                sales: 8,
                rating: 4.5
            },
            {
                id: 'sample-2',
                name: 'Creator Hoodie',
                description: 'Comfortable hoodie perfect for streaming and creating content.',
                price: 39.99,
                category: 'clothing',
                image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 25,
                serviceType: 'pod',
                podService: 'printify',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    sizes: ['S', 'M', 'L', 'XL'],
                    colors: ['Gray', 'Black', 'Blue']
                },
                views: 89,
                sales: 5,
                rating: 4.8
            },
            {
                id: 'sample-3',
                name: 'Amplifi Coffee Mug',
                description: 'High-quality ceramic mug with Amplifi logo. Perfect for your morning coffee!',
                price: 14.99,
                category: 'home',
                image: 'https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 100,
                serviceType: 'pod',
                podService: 'spring',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    colors: ['White', 'Black']
                },
                views: 67,
                sales: 12,
                rating: 4.2
            },
            {
                id: 'sample-4',
                name: 'Creator Phone Case',
                description: 'Durable phone case with Amplifi design. Compatible with iPhone and Samsung.',
                price: 19.99,
                category: 'tech',
                image: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 75,
                serviceType: 'pod',
                podService: 'printful',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    phoneModels: ['iPhone 13', 'iPhone 14', 'Samsung Galaxy']
                },
                views: 156,
                sales: 15,
                rating: 4.6
            },
            {
                id: 'sample-5',
                name: 'Amplifi Stickers Pack',
                description: 'Set of 10 high-quality vinyl stickers with Amplifi designs.',
                price: 9.99,
                category: 'stickers',
                image: 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 200,
                serviceType: 'pod',
                podService: 'redbubble',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    packSizes: ['10 stickers', '25 stickers', '50 stickers']
                },
                views: 234,
                sales: 28,
                rating: 4.9
            },
            {
                id: 'sample-6',
                name: 'Creator Laptop Sticker',
                description: 'Premium vinyl laptop sticker with Amplifi design. Perfect for personalizing your device.',
                price: 4.99,
                category: 'stickers',
                image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 150,
                serviceType: 'pod',
                podService: 'redbubble',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    sizes: ['Small', 'Medium', 'Large']
                },
                views: 189,
                sales: 22,
                rating: 4.7
            },
            {
                id: 'sample-7',
                name: 'Amplifi Poster',
                description: 'High-quality poster with Amplifi artwork. Perfect for home or office decoration.',
                price: 12.99,
                category: 'art',
                image: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 80,
                serviceType: 'pod',
                podService: 'printful',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    sizes: ['11x17', '18x24', '24x36']
                },
                views: 145,
                sales: 18,
                rating: 4.4
            },
            {
                id: 'sample-8',
                name: 'Creator Water Bottle',
                description: 'Insulated water bottle with Amplifi design. Keep your drinks cold for hours.',
                price: 22.99,
                category: 'accessories',
                image: 'https://images.pexels.com/photos/1188632/pexels-photo-1188632.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                stock: 60,
                serviceType: 'pod',
                podService: 'printify',
                creatorId: this.currentUser.uid,
                createdAt: new Date(),
                variants: {
                    colors: ['Stainless Steel', 'Black', 'Blue']
                },
                views: 98,
                sales: 11,
                rating: 4.6
            }
        ];

        try {
            console.log('🛍️ Starting to create sample products...');
            for (const product of sampleProducts) {
                await this.db.collection('products').doc(product.id).set(product);
                console.log(`✅ Created sample product: ${product.name}`);
            }
            
            console.log('✅ All sample products created successfully');
            this.showSampleProductsNotification();
            
            // Reload products after creating samples
            await this.loadProducts();
        } catch (error) {
            console.error('❌ Error creating sample products:', error);
            this.showErrorNotification('Failed to create sample products: ' + error.message);
        }
    }

    // Auto-build store with sample products for new creators
    async autoBuildStore() {
        console.log('🏗️ Auto-building store with sample products...');
        
        const sampleProducts = [
            {
                name: 'Amplifi Brand T-Shirt',
                category: 'clothing',
                description: 'Premium cotton t-shirt with Amplifi branding. Perfect for fans and supporters.',
                price: 24.99,
                stock: 50,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'pod',
                fulfillmentType: 'pod'
            },
            {
                name: 'Creator Phone Case',
                category: 'tech',
                description: 'Custom phone case with your brand design. Compatible with iPhone and Samsung.',
                price: 19.99,
                stock: 30,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'pod',
                fulfillmentType: 'pod'
            },
            {
                name: 'Amplifi Coffee Mug',
                category: 'home',
                description: 'Ceramic coffee mug with your brand logo. Microwave and dishwasher safe.',
                price: 14.99,
                stock: 25,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'pod',
                fulfillmentType: 'pod'
            },
            {
                name: 'Branded Stickers Pack',
                category: 'stickers',
                description: 'Set of 10 high-quality vinyl stickers with your brand design.',
                price: 9.99,
                stock: 100,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'pod',
                fulfillmentType: 'pod'
            },
            {
                name: 'Creator Hoodie',
                category: 'clothing',
                description: 'Comfortable hoodie with embroidered brand logo. Available in multiple colors.',
                price: 39.99,
                stock: 20,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'pod',
                fulfillmentType: 'pod'
            },
            {
                name: 'Wireless Earbuds',
                category: 'electronics',
                description: 'High-quality wireless earbuds with noise cancellation. Perfect for content creators.',
                price: 79.99,
                stock: 15,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'dropshipping',
                fulfillmentType: 'dropshipping'
            },
            {
                name: 'Art Print Collection',
                category: 'art',
                description: 'Limited edition art prints featuring your brand artwork. Various sizes available.',
                price: 29.99,
                stock: 40,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'pod',
                fulfillmentType: 'pod'
            },
            {
                name: 'Branded Backpack',
                category: 'accessories',
                description: 'Durable backpack with your brand logo. Perfect for daily use and travel.',
                price: 49.99,
                stock: 15,
                imageUrl: 'assets/images/default-avatar.svg',
                serviceType: 'dropshipping',
                fulfillmentType: 'dropshipping'
            }
        ];

        try {
            for (const productData of sampleProducts) {
                const productWithMetadata = {
                    ...productData,
                    creatorId: this.currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    sales: 0,
                    rating: 0,
                    reviews: [],
                    autoGenerated: true
                };

                await this.db.collection('products').add(productWithMetadata);
                console.log(`✅ Auto-created product: ${productData.name}`);
            }

            console.log('🎉 Auto-build store completed!');
            await this.loadProducts();
            
            // Show success notification
            this.showAutoBuildNotification();
            
        } catch (error) {
            console.error('❌ Error auto-building store:', error);
        }
    }

    // Show auto-build notification
    showAutoBuildNotification() {
        const notification = document.createElement('div');
        notification.className = 'auto-build-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🎉 Store Auto-Built Successfully!</h4>
                <p>Your store has been populated with 8 sample products across all categories.</p>
                <p><strong>Categories Added:</strong> Clothing, Tech, Home, Stickers, Electronics, Art, Accessories</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Render products with YouTube-style layout
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const emptyState = document.getElementById('emptyState');

        if (loadingSpinner) loadingSpinner.style.display = 'none';

        if (this.products.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        const filteredProducts = this.filterProducts();
        const sortedProducts = this.sortProductsList(filteredProducts);

        productsGrid.innerHTML = sortedProducts.map(product => {
            // Handle both image and imageUrl properties
            const productImage = product.image || product.imageUrl || 'assets/images/default-avatar.svg';
            const podService = product.podService || product.serviceType;
            const isPOD = product.serviceType === 'pod' || podService;
            
            return `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-image-container">
                        <img src="${productImage}" alt="${product.name}" class="product-image" 
                             onerror="this.src='assets/images/default-avatar.svg'">
                        <div class="product-overlay">
                            <button class="btn-quick-view" onclick="storeApp.showProductDetail('${product.id}')">
                                Quick View
                            </button>
                        </div>
                        ${isPOD ? `<div class="pod-badge">POD</div>` : ''}
                        <div class="product-edit-overlay">
                            <button class="btn-edit-product" onclick="storeApp.showEditProductModal('${product.id}')" title="Edit Product">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-meta">
                            <span class="product-category">${this.getCategoryEmoji(product.category)} ${product.category}</span>
                            <span class="product-stock">${product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}</span>
                        </div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        ${product.rating ? `
                            <div class="product-rating">
                                ${'⭐'.repeat(Math.round(product.rating))} (${product.rating})
                            </div>
                        ` : ''}
                        <div class="product-stats">
                            ${product.views ? `<span>👁️ ${product.views} views</span>` : ''}
                            ${product.sales ? `<span>📦 ${product.sales} sold</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-primary" onclick="storeApp.addToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                                ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button class="btn btn-secondary" onclick="storeApp.showProductDetail('${product.id}')">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filter products by category (updated for dropdown system)
    filterByCategory(category) {
        this.selectCategory(category);
    }

    // Search products
    searchProducts(query) {
        console.log('🔍 Search products called with query:', query);
        this.searchQuery = query.toLowerCase();
        console.log('🔍 Updated search query:', this.searchQuery);
        console.log('🔍 Total products before filtering:', this.products.length);
        
        // Re-render products with search filter
        this.renderProducts();
        
        // Show search results count
        const filteredProducts = this.filterProducts();
        console.log('🔍 Products after search filter:', filteredProducts.length);
        
        // Update UI to show search results
        this.updateSearchResults(query, filteredProducts.length);
    }
    
    updateSearchResults(query, resultCount) {
        const searchInput = document.getElementById('searchProducts');
        if (searchInput && query) {
            // Add a small indicator of search results
            const existingIndicator = document.getElementById('searchResultsIndicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            if (query.trim()) {
                const indicator = document.createElement('div');
                indicator.id = 'searchResultsIndicator';
                indicator.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #f3f4f6;
                    padding: 8px 12px;
                    font-size: 12px;
                    color: #6b7280;
                    border-top: 1px solid #e5e7eb;
                    z-index: 10;
                `;
                indicator.textContent = `Found ${resultCount} product${resultCount !== 1 ? 's' : ''} for "${query}"`;
                
                const searchContainer = searchInput.closest('.search-container');
                if (searchContainer) {
                    searchContainer.style.position = 'relative';
                    searchContainer.appendChild(indicator);
                }
            }
        }
    }

    // Sort products
    sortProducts(sortBy) {
        this.sortBy = sortBy;
        this.renderProducts();
    }

    // Filter products based on current filters
    filterProducts() {
        let filtered = this.products;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    }

    // Sort products list
    sortProductsList(products) {
        switch (this.sortBy) {
            case 'popular':
                return products.sort((a, b) => (b.sales || 0) - (a.sales || 0));
            case 'price-low':
                return products.sort((a, b) => a.price - b.price);
            case 'price-high':
                return products.sort((a, b) => b.price - a.price);
            case 'newest':
            default:
                return products.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        }
    }

    // Get category emoji
    getCategoryEmoji(category) {
        const emojis = {
            'clothing': '👕',
            'accessories': '👜',
            'home': '🏠',
            'digital': '💻',
            'art': '🎨',
            'tech': '📱',
            'electronics': '⚡',
            'stickers': '🎭'
        };
        return emojis[category] || '📦';
    }

    // Update product count
    updateProductCount() {
        document.getElementById('productCount').textContent = this.products.length;
    }

    // Show create product modal with POD options
    showCreateProductModal() {
        // Update modal to include POD service selection
        const modal = document.getElementById('createProductModal');
        const form = document.getElementById('createProductForm');
        
        // Add POD service selection if not already present
        if (!document.getElementById('podService')) {
            const podServiceGroup = document.createElement('div');
            podServiceGroup.className = 'form-group';
            podServiceGroup.innerHTML = `
                <label for="podService">Print-on-Demand Service (Optional)</label>
                <select id="podService">
                    <option value="">No POD Service (Manual Fulfillment)</option>
                    <option value="printful">Printful - Premium Quality</option>
                    <option value="printify">Printify - Wide Variety</option>
                    <option value="spring">Spring - Social Commerce</option>
                    <option value="redbubble">Redbubble - Artist Focused</option>
                </select>
            `;
            form.insertBefore(podServiceGroup, form.querySelector('.form-group'));
        }
        
        // Add image preview functionality
        const imageInput = document.getElementById('productImage');
        if (imageInput) {
            imageInput.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // Create or update preview
                        let preview = document.getElementById('imagePreview');
                        if (!preview) {
                            preview = document.createElement('div');
                            preview.id = 'imagePreview';
                            preview.className = 'image-preview';
                            preview.innerHTML = `
                                <img src="" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                                <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()" style="margin-top: 8px;">Remove</button>
                            `;
                            imageInput.parentNode.appendChild(preview);
                        }
                        preview.querySelector('img').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
        
        modal.classList.add('open');
    }

    // Hide create product modal
    hideCreateProductModal() {
        document.getElementById('createProductModal').classList.remove('open');
        document.getElementById('createProductForm').reset();
    }

    // Create realistic product mockups
    createProductMockup(productName, category) {
        const mockupImages = {
            't-shirt': 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'hoodie': 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'mug': 'https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'phone-case': 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'sticker': 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'poster': 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'water-bottle': 'https://images.pexels.com/photos/1188632/pexels-photo-1188632.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            'laptop-sticker': 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        };

        // Map product names to mockup types
        const productType = productName.toLowerCase();
        if (productType.includes('t-shirt') || productType.includes('shirt')) {
            return mockupImages['t-shirt'];
        } else if (productType.includes('hoodie') || productType.includes('sweatshirt')) {
            return mockupImages['hoodie'];
        } else if (productType.includes('mug') || productType.includes('cup')) {
            return mockupImages['mug'];
        } else if (productType.includes('phone') || productType.includes('case')) {
            return mockupImages['phone-case'];
        } else if (productType.includes('sticker')) {
            return mockupImages['sticker'];
        } else if (productType.includes('poster') || productType.includes('print')) {
            return mockupImages['poster'];
        } else if (productType.includes('bottle') || productType.includes('water')) {
            return mockupImages['water-bottle'];
        } else if (productType.includes('laptop')) {
            return mockupImages['laptop-sticker'];
        }

        // Default based on category
        const categoryDefaults = {
            'clothing': mockupImages['t-shirt'],
            'accessories': mockupImages['water-bottle'],
            'home': mockupImages['mug'],
            'tech': mockupImages['phone-case'],
            'stickers': mockupImages['sticker'],
            'art': mockupImages['poster'],
            'digital': mockupImages['poster'],
            'electronics': mockupImages['phone-case']
        };

        return categoryDefaults[category] || mockupImages['t-shirt'];
    }

    // Enhanced product creation with realistic images
    async createProduct(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const productData = {
            name: formData.get('productName'),
            description: formData.get('productDescription'),
            price: parseFloat(formData.get('productPrice')),
            category: formData.get('productCategory'),
            stock: parseInt(formData.get('productStock')) || 0,
            serviceType: 'pod', // Always POD like YouTube
            podService: formData.get('podService'),
            creatorId: this.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            views: 0,
            sales: 0,
            rating: 0,
            reviews: []
        };

        // Handle image upload
        const imageFile = formData.get('productImage');
        if (imageFile && imageFile.size > 0) {
            try {
                // Upload image to Firebase Storage
                const imageUrl = await this.uploadImageToStorage(imageFile);
                productData.image = imageUrl;
                console.log('✅ Image uploaded successfully:', imageUrl);
            } catch (error) {
                console.error('❌ Error uploading image:', error);
                // Fallback to generated image if upload fails
                productData.image = this.createProductMockup(productData.name, productData.category);
                this.showNotification('Image upload failed, using generated image instead.', 'warning');
            }
        } else {
            // Generate realistic product image if no file uploaded
            productData.image = this.createProductMockup(productData.name, productData.category);
        }

        try {
            // Create POD product (like YouTube)
            await this.createPODProduct(productData, productData.podService);

            // Add to Firestore
            const docRef = await this.db.collection('products').add(productData);
            console.log('✅ Product created successfully:', docRef.id);

            // Hide modal and reload products
            this.hideCreateProductModal();
            await this.loadProducts();

            // Show success notification
            this.showProductCreatedNotification(productData.name);

        } catch (error) {
            console.error('❌ Error creating product:', error);
            alert('Error creating product. Please try again.');
        }
    }

    // Upload image to Firebase Storage
    async uploadImageToStorage(imageFile) {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        
        // Create unique filename
        const timestamp = Date.now();
        const fileName = `product-images/${this.currentUser.uid}/${timestamp}_${imageFile.name}`;
        const imageRef = storageRef.child(fileName);
        
        // Upload file
        const snapshot = await imageRef.put(imageFile);
        
        // Get download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return downloadURL;
    }

    // Create POD product (like YouTube's integration)
    async createPODProduct(productData, podService) {
        console.log(`Creating POD product with ${podService}...`);
        
        // Simulate POD API integration
        const podConfig = this.podServices[podService];
        if (!podConfig) {
            throw new Error(`Unknown POD service: ${podService}`);
        }

        // In a real implementation, this would call the POD service API
        // For now, we'll simulate the process
        const podProductData = {
            ...productData,
            podService: podService,
            podProductId: `pod_${Date.now()}`,
            fulfillmentType: 'pod',
            estimatedShipping: '3-5 business days',
            podDescription: `Created via ${podConfig.name} - ${podConfig.description}`
        };

        console.log(`POD Product created: ${podProductData.podProductId}`);
        return podProductData;
    }



    // Display POD service information
    displayPODInfo(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.serviceType !== 'pod') return;

        const podService = this.podServices[product.podService];
        if (!podService) return;

        const podInfo = document.createElement('div');
        podInfo.className = 'pod-info-modal';
        podInfo.innerHTML = `
            <div class="pod-info-content">
                <div class="pod-info-header">
                    <h3>🖨️ Print-on-Demand Service</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="pod-service-details">
                    <div class="service-name">
                        <h4>${podService.name}</h4>
                        <span class="service-badge">POD</span>
                    </div>
                    <p class="service-description">${podService.description}</p>
                    
                    <div class="tax-handling-info">
                        <h5>🛡️ Automatic Tax Handling</h5>
                        <ul>
                            <li>✅ Real-time tax calculation</li>
                            <li>✅ Automatic tax collection</li>
                            <li>✅ Tax remittance to governments</li>
                            <li>✅ Complete tax reporting</li>
                            <li>✅ Global compliance</li>
                            <li>✅ No sales tax license required</li>
                        </ul>
                    </div>
                    
                    <div class="service-features">
                        <h5>📦 Available Products</h5>
                        <div class="feature-tags">
                            ${podService.products.map(product => `<span class="feature-tag">${product}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="compliance-info">
                        <h5>🌍 Compliance Regions</h5>
                        <div class="compliance-tags">
                            ${podService.taxHandling.compliance.map(region => `<span class="compliance-tag">${region}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(podInfo);
    }

    // Enhanced product detail modal with POD info
    async showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const productImage = product.image || product.imageUrl || 'assets/images/default-avatar.svg';
        const isPOD = product.serviceType === 'pod';
        const podService = isPOD ? this.podServices[product.podService] : null;

        const modal = document.createElement('div');
        modal.className = 'product-detail-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="storeApp.hideProductDetail()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${product.name}</h2>
                    <button class="close-btn" onclick="storeApp.hideProductDetail()">×</button>
                </div>
                <div class="modal-body">
                    <div class="product-detail-grid">
                        <div class="product-image-section">
                            <img src="${productImage}" alt="${product.name}" class="detail-product-image">
                            ${isPOD ? `<div class="pod-badge-large">Print-on-Demand</div>` : ''}
                        </div>
                        <div class="product-info-section">
                            <div class="product-detail-info">
                                <h3>${product.name}</h3>
                                <p class="product-description">${product.description}</p>
                                <div class="product-price-large">$${product.price.toFixed(2)}</div>
                                
                                ${product.rating ? `
                                    <div class="product-rating-large">
                                        ${'⭐'.repeat(Math.round(product.rating))} ${product.rating}/5
                                        <span class="rating-count">(${product.reviews?.length || 0} reviews)</span>
                                    </div>
                                ` : ''}
                                
                                <div class="product-stats-large">
                                    ${product.views ? `<div class="stat-item">👁️ ${product.views} views</div>` : ''}
                                    ${product.sales ? `<div class="stat-item">📦 ${product.sales} sold</div>` : ''}
                                    <div class="stat-item">📦 ${product.stock} in stock</div>
                                </div>
                                
                                ${isPOD && podService ? `
                                    <div class="pod-service-info">
                                        <h4>🖨️ Print-on-Demand Service</h4>
                                        <p><strong>${podService.name}</strong> - ${podService.description}</p>
                                        <div class="pod-benefits">
                                            <span class="benefit">✅ Automatic Tax Handling</span>
                                            <span class="benefit">✅ No License Required</span>
                                            <span class="benefit">✅ Global Shipping</span>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="product-actions-large">
                                    <button class="btn btn-primary btn-large" onclick="storeApp.addToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                                        ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button class="btn btn-secondary btn-large" onclick="storeApp.buyNow('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Track product view
        this.trackProductView(productId);
    }

    // Hide product detail modal
    hideProductDetail() {
        document.getElementById('productDetailModal').classList.remove('open');
        this.currentProduct = null;
    }

    // Add to cart
    addToCart(productId = null) {
        const product = productId ? this.products.find(p => p.id === productId) : this.currentProduct;
        if (!product) return;

        if (product.stock <= 0) {
            alert('This product is out of stock.');
            return;
        }

        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.updateCart();
        this.showCart();
    }

    // Update cart display
    updateCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = '$0.00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.imageUrl || 'assets/images/default-avatar.svg'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
                    ${item.podService ? `<div class="cart-item-pod">🖨️ ${this.podServices[item.podService].name}</div>` : ''}
                </div>
                <button class="cart-item-remove" onclick="storeApp.removeFromCart('${item.id}')">×</button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Remove from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCart();
    }

    // Show cart
    showCart() {
        document.getElementById('cartSidebar').classList.add('open');
    }

    // Hide cart
    hideCart() {
        document.getElementById('cartSidebar').classList.remove('open');
    }

    // Buy now (direct purchase)
    buyNow() {
        if (!this.currentProduct) return;
        
        // For now, just add to cart and show checkout
        this.addToCart();
        this.checkout();
    }

    // Enhanced checkout with Stripe payment processing
    async checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        try {
            // Calculate total with tax and shipping
            const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * 0.08; // 8% tax
            const shipping = 5.99; // Fixed shipping cost
            const total = subtotal + tax + shipping;

            // Show payment modal
            this.showPaymentModal(total, this.cart);

        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Error during checkout. Please try again.');
        }
    }

    // Show payment modal with Stripe integration
    showPaymentModal(total, cartItems) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="storeApp.hidePaymentModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Complete Your Purchase</h2>
                    <button class="close-btn" onclick="storeApp.hidePaymentModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="cart-items">
                            ${cartItems.map(item => `
                                <div class="cart-item">
                                    <img src="${item.image || item.imageUrl}" alt="${item.name}" class="cart-item-image">
                                    <div class="cart-item-details">
                                        <h4>${item.name}</h4>
                                        <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                                    </div>
                                    <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="total-line">
                                <span>Subtotal:</span>
                                <span>$${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                            </div>
                            <div class="total-line">
                                <span>Tax (8%):</span>
                                <span>$${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                            </div>
                            <div class="total-line">
                                <span>Shipping:</span>
                                <span>$5.99</span>
                            </div>
                            <div class="total-line total">
                                <span>Total:</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-section">
                        <h3>Payment Information</h3>
                        <form id="payment-form">
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" required value="${this.currentUser?.email || ''}">
                            </div>
                            <div class="form-group">
                                <label for="name">Full Name</label>
                                <input type="text" id="name" required>
                            </div>
                            <div class="form-group">
                                <label for="address">Shipping Address</label>
                                <textarea id="address" required placeholder="Enter your shipping address"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="card-element">Credit or Debit Card</label>
                                <div id="card-element" class="card-element"></div>
                                <div id="card-errors" class="card-errors"></div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-large" id="submit-payment">
                                Pay $${total.toFixed(2)}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize Stripe Elements
        this.initializeStripeElements(total, cartItems);
    }

    // Initialize Stripe Elements for payment
    async initializeStripeElements(total, cartItems) {
        try {
            // Load Stripe if not already loaded
            if (typeof Stripe === 'undefined') {
                await this.loadStripeScript();
            }

            // Initialize Stripe
            const stripe = Stripe('pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD');
            const elements = stripe.elements();

            // Create card element
            const card = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                    invalid: {
                        color: '#9e2146',
                    },
                },
            });

            card.mount('#card-element');

            // Handle form submission
            const form = document.getElementById('payment-form');
            const submitButton = document.getElementById('submit-payment');

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';

                try {
                    // Create payment intent
                    const response = await fetch('https://us-central1-amplifi-a54d9.cloudfunctions.net/create_payment_intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: Math.round(total * 100), // Convert to cents
                            currency: 'usd',
                            items: cartItems.map(item => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Payment intent creation failed');
                    }

                    const { clientSecret } = await response.json();

                    // Confirm payment
                    const result = await stripe.confirmCardPayment(clientSecret, {
                        payment_method: {
                            card: card,
                            billing_details: {
                                name: document.getElementById('name').value,
                                email: document.getElementById('email').value,
                            },
                        }
                    });

                    if (result.error) {
                        throw new Error(result.error.message);
                    }

                    // Payment successful - process order
                    await this.processSuccessfulOrder(cartItems, total, result.paymentIntent);
                    
                } catch (error) {
                    console.error('Payment error:', error);
                    document.getElementById('card-errors').textContent = error.message;
                    submitButton.disabled = false;
                    submitButton.textContent = `Pay $${total.toFixed(2)}`;
                }
            });

        } catch (error) {
            console.error('Error initializing Stripe:', error);
            alert('Payment system unavailable. Please try again later.');
        }
    }

    // Load Stripe script dynamically
    loadStripeScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="stripe"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Process successful order
    async processSuccessfulOrder(cartItems, total, paymentIntent) {
        try {
            // Calculate revenue split
            const platformFee = total * this.revenueModel.platformFee;
            const creatorRevenue = total * this.revenueModel.creatorRevenue;
            
            // Create order in Firestore
            const orderData = {
                orderId: paymentIntent.id,
                customerId: this.currentUser.uid,
                items: cartItems,
                total: total,
                platformFee: platformFee,
                creatorRevenue: creatorRevenue,
                status: 'paid',
                createdAt: new Date(),
                paymentIntent: paymentIntent
            };
            
            await this.db.collection('orders').add(orderData);
            
            // Process POD orders
            const podItems = cartItems.filter(item => item.serviceType === 'pod');
            if (podItems.length > 0) {
                await this.processPODOrders(podItems, paymentIntent.id);
            }
            
            // Update product stock and analytics
            for (const item of cartItems) {
                await this.updateProductStock(item.id, item.quantity);
                await this.updateProductAnalytics(item.id, 'sale', item.quantity);
            }
            
            // Clear cart and show success
            this.cart = [];
            this.updateCartDisplay();
            this.hidePaymentModal();
            this.showOrderSuccessModal(paymentIntent.id, total, creatorRevenue, platformFee);
            
        } catch (error) {
            console.error('Error processing order:', error);
            this.showNotification('Error processing order. Please contact support.', 'error');
        }
    }
    
    showOrderSuccessModal(orderId, total, creatorRevenue, platformFee) {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">✅</div>
                <h2>Order Successful!</h2>
                <p>Your order has been processed successfully.</p>
                <div class="order-details">
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                    <p><strong>Your Revenue:</strong> $${creatorRevenue.toFixed(2)} (85%)</p>
                    <p><strong>Platform Fee:</strong> $${platformFee.toFixed(2)} (15%)</p>
                    <p><em>Amplifi's 15% fee is much lower than other platforms!</em></p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">Continue Shopping</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Hide payment modal
    hidePaymentModal() {
        const modal = document.querySelector('.payment-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Process POD orders (REAL API INTEGRATION)
    async processPODOrders(podItems, orderId) {
        console.log(`Processing ${podItems.length} POD orders for order ${orderId}...`);
        
        for (const item of podItems) {
            const podService = this.podServices[item.podService];
            console.log(`Creating ${item.quantity}x ${item.name} via ${podService.name}...`);
            
            try {
                // Check if API key is configured
                if (!podService.apiKey) {
                    console.warn(`⚠️ No API key configured for ${podService.name}`);
                    // Store order for manual processing
                    await this.storeManualPODOrder(item, orderId, podService);
                    continue;
                }
                
                // Create real POD order via API
                const podOrderResult = await this.createRealPODOrder(item, orderId, podService);
                
                // Store POD order data
                const podOrderData = {
                    orderId: orderId,
                    productId: item.id,
                    podService: item.podService,
                    podOrderId: podOrderResult.orderId,
                    quantity: item.quantity,
                    status: 'processing',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    apiResponse: podOrderResult
                };
                
                await this.db.collection('podOrders').add(podOrderData);
                console.log(`✅ POD order created via ${podService.name}: ${podOrderResult.orderId}`);
                
            } catch (error) {
                console.error(`❌ Error creating POD order via ${podService.name}:`, error);
                // Store failed order for retry
                await this.storeFailedPODOrder(item, orderId, podService, error);
            }
        }
        
        console.log('POD orders processed successfully');
    }

    // Create real POD order via API
    async createRealPODOrder(item, orderId, podService) {
        const orderData = {
            recipient: {
                name: item.customerName,
                address1: item.shippingAddress.address1,
                city: item.shippingAddress.city,
                state_code: item.shippingAddress.state,
                country_code: item.shippingAddress.country,
                zip: item.shippingAddress.zip
            },
            items: [{
                variant_id: item.podVariantId,
                quantity: item.quantity,
                retail_price: item.price.toString()
            }],
            retail_costs: {
                currency: 'USD',
                subtotal: item.price.toString(),
                tax: item.taxAmount.toString(),
                shipping: item.shippingCost.toString(),
                total: item.total.toString()
            }
        };

        // Make API call to POD service
        const response = await fetch(`${podService.apiUrl}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${podService.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`POD API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return {
            orderId: result.id,
            status: result.status,
            tracking: result.tracking_number,
            estimatedDelivery: result.estimated_delivery
        };
    }

    // Store manual POD order (when no API key)
    async storeManualPODOrder(item, orderId, podService) {
        const manualOrderData = {
            orderId: orderId,
            productId: item.id,
            podService: item.podService,
            quantity: item.quantity,
            status: 'manual_processing',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            note: `Manual processing required - no API key configured for ${podService.name}`
        };
        
        await this.db.collection('manualPODOrders').add(manualOrderData);
        console.log(`📝 Manual POD order stored for ${podService.name}`);
    }

    // Store failed POD order for retry
    async storeFailedPODOrder(item, orderId, podService, error) {
        const failedOrderData = {
            orderId: orderId,
            productId: item.id,
            podService: item.podService,
            quantity: item.quantity,
            status: 'failed',
            error: error.message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            retryCount: 0
        };
        
        await this.db.collection('failedPODOrders').add(failedOrderData);
        console.log(`❌ Failed POD order stored for retry: ${error.message}`);
    }



    // Get POD service information
    getPODServiceInfo(serviceName) {
        return this.podServices[serviceName] || null;
    }



    // SALES TAX HANDLING FOR POD SERVICES
    getTaxInfo(podService, productPrice, shippingAddress) {
        const podInfo = this.podServices[podService];
        if (!podInfo || !podInfo.taxHandling) {
            return {
                taxRate: 0,
                taxAmount: 0,
                totalWithTax: productPrice,
                taxHandled: false
            };
        }

        // Simulate tax calculation based on address
        let taxRate = 0;
        if (shippingAddress?.country === 'US') {
            taxRate = 0.08; // 8% average US sales tax
        } else if (shippingAddress?.country === 'CA') {
            taxRate = 0.13; // 13% Canadian GST/HST
        } else if (shippingAddress?.country === 'AU') {
            taxRate = 0.10; // 10% Australian GST
        } else if (shippingAddress?.country === 'GB') {
            taxRate = 0.20; // 20% UK VAT
        } else {
            taxRate = 0.05; // 5% international average
        }

        const taxAmount = productPrice * taxRate;
        const totalWithTax = productPrice + taxAmount;

        return {
            taxRate: taxRate,
            taxAmount: taxAmount,
            totalWithTax: totalWithTax,
            taxHandled: podInfo.taxHandling.automatic,
            podService: podInfo.name,
            compliance: podInfo.taxHandling.compliance
        };
    }

    // Display tax information to customer
    displayTaxInfo(productId, podService) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !podService) return;

        const podInfo = this.podServices[podService];
        if (!podInfo?.taxHandling?.automatic) return;

        const taxInfo = this.getTaxInfo(podService, product.price, { country: 'US' });

        const taxDisplay = document.getElementById('taxInfo');
        if (taxDisplay) {
            taxDisplay.innerHTML = `
                <div class="tax-info">
                    <h4>💰 Tax Information</h4>
                    <p><strong>${podInfo.name}</strong> handles all sales tax automatically:</p>
                    <ul>
                        <li>✅ <strong>Tax Calculation:</strong> Real-time based on shipping address</li>
                        <li>✅ <strong>Tax Collection:</strong> Automatically added to order total</li>
                        <li>✅ <strong>Tax Remittance:</strong> ${podInfo.name} pays taxes to governments</li>
                        <li>✅ <strong>Tax Reporting:</strong> Complete documentation provided</li>
                        <li>✅ <strong>Compliance:</strong> ${podInfo.taxHandling.compliance.join(', ')}</li>
                    </ul>
                    <p class="tax-note">💡 <em>You don't need to worry about sales tax - ${podInfo.name} handles everything!</em></p>
                </div>
            `;
        }
    }

    // FREE FEATURES - Analytics & Insights
    async trackProductView(productId) {
        try {
            await this.db.collection('analytics').add({
                type: 'product_view',
                productId: productId,
                userId: this.currentUser?.uid || 'anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.analytics.totalViews++;
        } catch (error) {
            console.error('Error tracking product view:', error);
        }
    }

    async loadAnalytics() {
        try {
            const analyticsSnapshot = await this.db.collection('analytics')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('timestamp', 'desc')
                .limit(100)
                .get();

            this.analytics.recentOrders = [];
            analyticsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.type === 'order') {
                    this.analytics.recentOrders.push(data);
                }
            });

            this.updateAnalyticsDisplay();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    updateAnalyticsDisplay() {
        const analyticsContainer = document.getElementById('analyticsContainer');
        if (!analyticsContainer) return;

        const totalRevenue = this.analytics.totalSales * 25; // Average product price
        const conversionRate = this.analytics.totalViews > 0 
            ? ((this.analytics.totalSales / this.analytics.totalViews) * 100).toFixed(1)
            : 0;

        analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="analytics-icon">👁️</div>
                    <div class="analytics-content">
                        <h3>${this.analytics.totalViews.toLocaleString()}</h3>
                        <p>Total Views</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-icon">💰</div>
                    <div class="analytics-content">
                        <h3>$${totalRevenue.toLocaleString()}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-icon">📦</div>
                    <div class="analytics-content">
                        <h3>${this.analytics.totalSales}</h3>
                        <p>Products Sold</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-icon">📊</div>
                    <div class="analytics-content">
                        <h3>${conversionRate}%</h3>
                        <p>Conversion Rate</p>
                    </div>
                </div>
            </div>
            
            ${this.analytics.topProducts.length > 0 ? `
                <div class="top-products-section">
                    <h3>🏆 Top Performing Products</h3>
                    <div class="top-products-list">
                        ${this.analytics.topProducts.slice(0, 3).map(product => `
                            <div class="top-product-item">
                                <img src="${product.image}" alt="${product.name}" class="top-product-image">
                                <div class="top-product-info">
                                    <h4>${product.name}</h4>
                                    <p>${product.sales} sales • $${(product.price * product.sales).toFixed(2)} revenue</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${this.analytics.recentOrders.length > 0 ? `
                <div class="recent-orders-section">
                    <h3>🕒 Recent Orders</h3>
                    <div class="recent-orders-list">
                        ${this.analytics.recentOrders.slice(0, 5).map(order => `
                            <div class="recent-order-item">
                                <div class="order-info">
                                    <span class="order-id">#${order.id}</span>
                                    <span class="order-amount">$${order.amount}</span>
                                </div>
                                <span class="order-date">${order.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    // FREE FEATURES - Inventory Management
    checkLowStock() {
        const lowStockProducts = this.products.filter(product => 
            product.stock <= this.inventory.lowStockThreshold && product.stock > 0
        );

        if (lowStockProducts.length > 0) {
            this.showLowStockAlert(lowStockProducts);
        }
    }

    showLowStockAlert(products) {
        const alertContainer = document.getElementById('inventoryAlerts');
        if (!alertContainer) return;

        alertContainer.innerHTML = `
            <div class="alert alert-warning">
                <h4>⚠️ Low Stock Alert</h4>
                <p>The following products are running low on stock:</p>
                <ul>
                    ${products.map(product => `
                        <li>${product.name} - ${product.stock} remaining</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // FREE FEATURES - Discount Codes
    validateDiscountCode(code) {
        const discount = this.discountCodes[code.toUpperCase()];
        if (discount && discount.valid) {
            return discount;
        }
        return null;
    }

    applyDiscountCode(code) {
        const discount = this.validateDiscountCode(code);
        if (discount) {
            const cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            let discountAmount = 0;

            if (discount.type === 'percentage') {
                discountAmount = cartTotal * (discount.discount / 100);
            } else if (discount.type === 'shipping') {
                discountAmount = 5.99; // Free shipping value
            }

            this.updateCartWithDiscount(discountAmount, code);
            return true;
        }
        return false;
    }

    updateCartWithDiscount(discountAmount, code) {
        const discountElement = document.getElementById('discountApplied');
        if (discountElement) {
            discountElement.innerHTML = `
                <div class="discount-applied">
                    <span>🎉 Discount Code Applied: ${code}</span>
                    <span>-$${discountAmount.toFixed(2)}</span>
                </div>
            `;
        }
    }

    // FREE FEATURES - Product Variants
    showProductVariants(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const variantModal = document.getElementById('variantModal');
        if (!variantModal) return;

        variantModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${product.name} - Select Options</h3>
                    <button class="modal-close" onclick="storeApp.hideVariantModal()">×</button>
                </div>
                <div class="variant-options">
                    <div class="variant-group">
                        <label>Size:</label>
                        <select id="variantSize">
                            ${this.productVariants.sizes.map(size => 
                                `<option value="${size}">${size}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="variant-group">
                        <label>Color:</label>
                        <select id="variantColor">
                            ${this.productVariants.colors.map(color => 
                                `<option value="${color}">${color}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="variant-group">
                        <label>Material:</label>
                        <select id="variantMaterial">
                            ${this.productVariants.materials.map(material => 
                                `<option value="${material}">${material}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="storeApp.addToCartWithVariants('${productId}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        variantModal.classList.add('open');
    }

    addToCartWithVariants(productId) {
        const size = document.getElementById('variantSize').value;
        const color = document.getElementById('variantColor').value;
        const material = document.getElementById('variantMaterial').value;

        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const variantProduct = {
            ...product,
            variants: { size, color, material },
            variantKey: `${productId}_${size}_${color}_${material}`
        };

        this.addToCart(null, variantProduct);
        this.hideVariantModal();
    }

    hideVariantModal() {
        const variantModal = document.getElementById('variantModal');
        if (variantModal) {
            variantModal.classList.remove('open');
        }
    }

    // FREE FEATURES - Social Sharing
    shareProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const shareData = {
            title: `Check out this ${product.name} from my store!`,
            text: product.description,
            url: `${window.location.origin}/store.html?product=${productId}`
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback for browsers without native sharing
            this.copyToClipboard(shareData.url);
            alert('Product link copied to clipboard!');
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        });
    }

    // FREE FEATURES - Wishlist
    addToWishlist(productId) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            this.showWishlistNotification();
        }
    }

    showWishlistNotification() {
        const notification = document.createElement('div');
        notification.className = 'wishlist-notification';
        notification.innerHTML = '❤️ Added to wishlist!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // FREE FEATURES - Product Reviews
    async addProductReview(productId, rating, comment) {
        try {
            await this.db.collection('reviews').add({
                productId: productId,
                userId: this.currentUser.uid,
                rating: rating,
                comment: comment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.loadProductReviews(productId);
        } catch (error) {
            console.error('Error adding review:', error);
        }
    }

    async loadProductReviews(productId) {
        try {
            const reviewsSnapshot = await this.db.collection('reviews')
                .where('productId', '==', productId)
                .orderBy('timestamp', 'desc')
                .get();

            const reviews = [];
            reviewsSnapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            this.displayProductReviews(productId, reviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    displayProductReviews(productId, reviews) {
        const reviewsContainer = document.getElementById(`reviews-${productId}`);
        if (!reviewsContainer) return;

        const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;

        reviewsContainer.innerHTML = `
            <div class="reviews-header">
                <h4>Customer Reviews</h4>
                <div class="average-rating">
                    ${'⭐'.repeat(Math.round(averageRating))}
                    <span>(${reviews.length} reviews)</span>
                </div>
            </div>
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="review-item">
                        <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                        <div class="review-comment">${review.comment}</div>
                        <div class="review-date">${review.timestamp?.toDate?.().toLocaleDateString() || 'Recently'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Logout
    logout() {
        this.auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    }



    // Force create sample products (for testing)
    async forceCreateSampleProducts() {
        console.log('🛍️ Force creating sample products...');
        
        try {
            // Show loading state
            const button = document.getElementById('autoBuildBtn');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Creating Products...
                `;
                button.disabled = true;
                
                // Create sample products
                await this.createSampleProducts();
                
                // Reload products after creating
                await this.loadProducts();
                
                // Show success notification
                this.showSampleProductsNotification();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 3000);
                
            } else {
                // Fallback if button not found
                await this.createSampleProducts();
                await this.loadProducts();
                this.showSampleProductsNotification();
            }
            
        } catch (error) {
            console.error('❌ Error force creating sample products:', error);
            
            // Reset button on error
            const button = document.getElementById('autoBuildBtn');
            if (button) {
                button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Auto-Build Store
                `;
                button.disabled = false;
            }
            
            // Show error notification
            this.showErrorNotification('Failed to create sample products. Please try again.');
        }
    }

    // Show error notification
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>❌ Error</h4>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    // Show notification when sample products are created
    showSampleProductsNotification() {
        const notification = document.createElement('div');
        notification.className = 'sample-products-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>🎉 Sample Products Created!</h4>
                <p>8 sample products have been added to your store with realistic images and POD integration.</p>
                <div class="product-preview">
                    <p><strong>Products Added:</strong></p>
                    <ul>
                        <li>👕 Amplifi Creator T-Shirt ($24.99)</li>
                        <li>👕 Creator Hoodie ($39.99)</li>
                        <li>☕ Amplifi Coffee Mug ($14.99)</li>
                        <li>📱 Creator Phone Case ($19.99)</li>
                        <li>🎭 Amplifi Stickers Pack ($9.99)</li>
                        <li>💻 Creator Laptop Sticker ($4.99)</li>
                        <li>🎨 Amplifi Poster ($12.99)</li>
                        <li>💧 Creator Water Bottle ($22.99)</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
    }

    // Show edit product modal
    showEditProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'edit-product-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="storeApp.hideEditProductModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Product</h2>
                    <button class="close-btn" onclick="storeApp.hideEditProductModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="edit-product-form" onsubmit="storeApp.updateProduct(event, '${productId}')">
                        <div class="form-grid">
                            <div class="form-section">
                                <h3>Basic Information</h3>
                                
                                <div class="form-group">
                                    <label for="editProductName">Product Name *</label>
                                    <input type="text" id="editProductName" name="name" value="${product.name}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editProductCategory">Category *</label>
                                    <select id="editProductCategory" name="category" required>
                                        <option value="clothing" ${product.category === 'clothing' ? 'selected' : ''}>👕 Clothing</option>
                                        <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>👜 Accessories</option>
                                        <option value="home" ${product.category === 'home' ? 'selected' : ''}>🏠 Home & Living</option>
                                        <option value="digital" ${product.category === 'digital' ? 'selected' : ''}>💻 Digital</option>
                                        <option value="art" ${product.category === 'art' ? 'selected' : ''}>🎨 Art & Prints</option>
                                        <option value="tech" ${product.category === 'tech' ? 'selected' : ''}>📱 Tech Accessories</option>
                                        <option value="electronics" ${product.category === 'electronics' ? 'selected' : ''}>⚡ Electronics</option>
                                        <option value="stickers" ${product.category === 'stickers' ? 'selected' : ''}>🎭 Stickers</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editProductDescription">Description *</label>
                                    <textarea id="editProductDescription" name="description" required rows="4">${product.description}</textarea>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="editProductPrice">Price *</label>
                                        <input type="number" id="editProductPrice" name="price" value="${product.price}" step="0.01" min="0" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="editProductStock">Stock Quantity</label>
                                        <input type="number" id="editProductStock" name="stock" value="${product.stock || 0}" min="0">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Product Image</h3>
                                
                                <div class="current-image">
                                    <img src="${product.image || product.imageUrl}" alt="${product.name}" class="preview-image">
                                    <p>Current Image</p>
                                </div>
                                
                                <div class="form-group">
                                    <label for="editProductImage">New Image URL</label>
                                    <input type="url" id="editProductImage" name="image" placeholder="https://example.com/image.jpg">
                                    <small>Leave empty to keep current image</small>
                                </div>
                                
                                <div class="image-options">
                                    <h4>Quick Image Options</h4>
                                    <div class="image-buttons">
                                        <button type="button" class="btn btn-secondary" onclick="storeApp.generateProductImage('${productId}', '${product.category}')">
                                            Generate New Image
                                        </button>
                                        <button type="button" class="btn btn-secondary" onclick="storeApp.uploadProductImage('${productId}')">
                                            Upload Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>Service Configuration</h3>
                            
                            <div class="form-group">
                                <label for="editServiceType">Service Type *</label>
                                <select id="editServiceType" name="serviceType" required>
                                    <option value="pod" ${product.serviceType === 'pod' ? 'selected' : ''}>Print-on-Demand (POD) - Automatic Tax Handling</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editPodService">POD Service *</label>
                                <select id="editPodService" name="podService" required>
                                    <option value="printful" ${product.podService === 'printful' ? 'selected' : ''}>Printful - Premium Quality + Tax Handling</option>
                                    <option value="printify" ${product.podService === 'printify' ? 'selected' : ''}>Printify - Wide Variety + Tax Compliance</option>
                                    <option value="spring" ${product.podService === 'spring' ? 'selected' : ''}>Spring - Social Commerce + Tax Management</option>
                                    <option value="redbubble" ${product.podService === 'redbubble' ? 'selected' : ''}>Redbubble - Artist Focused + Global Tax</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="storeApp.hideEditProductModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Product</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Hide edit product modal
    hideEditProductModal() {
        const modal = document.querySelector('.edit-product-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Update product in database
    async updateProduct(event, productId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const updateData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            stock: parseInt(formData.get('stock')) || 0,
            serviceType: 'pod', // Always POD like YouTube
            podService: formData.get('podService'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Update image if provided
        const newImageUrl = formData.get('image');
        if (newImageUrl && newImageUrl.trim()) {
            updateData.image = newImageUrl.trim();
        }

        try {
            await this.db.collection('products').doc(productId).update(updateData);
            
            // Update local product data
            const productIndex = this.products.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                this.products[productIndex] = { ...this.products[productIndex], ...updateData };
            }
            
            // Reload products to reflect changes
            await this.loadProducts();
            
            // Hide modal
            this.hideEditProductModal();
            
            // Show success notification
            this.showProductUpdatedNotification(updateData.name);
            
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product. Please try again.');
        }
    }

    // Generate new product image
    generateProductImage(productId, category) {
        const newImageUrl = this.createProductMockup('Product', category);
        
        // Update the image input field
        const imageInput = document.getElementById('editProductImage');
        if (imageInput) {
            imageInput.value = newImageUrl;
        }
        
        // Update the preview image
        const previewImage = document.querySelector('.preview-image');
        if (previewImage) {
            previewImage.src = newImageUrl;
        }
        
        this.showNotification('New image generated!', 'success');
    }

    // Upload product image (fully functional implementation)
    async uploadProductImage(productId) {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                // Show loading state
                this.showNotification('Uploading image...', 'info');
                
                // Upload to Firebase Storage
                const imageUrl = await this.uploadImageToStorage(file);
                
                // Update the image input field
                const imageInput = document.getElementById('editProductImage');
                if (imageInput) {
                    imageInput.value = imageUrl;
                }
                
                // Update the preview image
                const previewImage = document.querySelector('.preview-image');
                if (previewImage) {
                    previewImage.src = imageUrl;
                }
                
                this.showNotification('Image uploaded successfully!', 'success');
                
            } catch (error) {
                console.error('❌ Error uploading image:', error);
                this.showNotification('Image upload failed. Please try again.', 'error');
            }
        };
        
        // Trigger file selection
        fileInput.click();
    }



    // Show product updated notification
    showProductUpdatedNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'product-updated-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>✅ Product Updated!</h4>
                <p>"${productName}" has been successfully updated.</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    // Show general notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `general-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Configure POD service API key
    async configurePODService(serviceName, apiKey) {
        try {
            // Validate API key by making a test call
            const isValid = await this.validatePODAPIKey(serviceName, apiKey);
            
            if (!isValid) {
                throw new Error('Invalid API key for this POD service');
            }
            
            // Store API key securely (in production, use Firebase Functions)
            const configData = {
                userId: this.currentUser.uid,
                serviceName: serviceName,
                apiKey: apiKey, // In production, encrypt this
                configuredAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            };
            
            await this.db.collection('podConfigurations').doc(`${this.currentUser.uid}_${serviceName}`).set(configData);
            
            // Update local service configuration
            this.podServices[serviceName].apiKey = apiKey;
            
            console.log(`✅ ${serviceName} API key configured successfully`);
            this.showNotification(`${serviceName} API key configured successfully!`, 'success');
            
        } catch (error) {
            console.error(`❌ Error configuring ${serviceName} API key:`, error);
            this.showNotification(`Failed to configure ${serviceName}: ${error.message}`, 'error');
        }
    }

    // Validate POD API key
    async validatePODAPIKey(serviceName, apiKey) {
        const podService = this.podServices[serviceName];
        if (!podService) return false;
        
        try {
            // Make a test API call to validate the key
            const response = await fetch(`${podService.apiUrl}/store`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error(`Error validating ${serviceName} API key:`, error);
            return false;
        }
    }

    // Load POD configurations for current user
    async loadPODConfigurations() {
        try {
            const configSnapshot = await this.db.collection('podConfigurations')
                .where('userId', '==', this.currentUser.uid)
                .where('status', '==', 'active')
                .get();
            
            configSnapshot.forEach(doc => {
                const config = doc.data();
                if (this.podServices[config.serviceName]) {
                    this.podServices[config.serviceName].apiKey = config.apiKey;
                }
            });
            
            console.log('✅ POD configurations loaded');
        } catch (error) {
            console.error('❌ Error loading POD configurations:', error);
        }
    }

    // Debug function removed - no longer needed
}

// Initialize the store app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log('🛍️ Store: DOM loaded, initializing StoreApp');
    window.storeApp = new StoreApp();
    window.storeApp.init();
}); 