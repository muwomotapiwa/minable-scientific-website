// Products page functionality
document.addEventListener('DOMContentLoaded', function() {
    initProductFilters();
    initQuoteCart();
    initProductInteractions();
    
    console.log('Products page loaded successfully! 🧪');
});

// Product filtering and search
function initProductFilters() {
    const searchInput = document.getElementById('productSearch');
    const volumeFilter = document.getElementById('volumeFilter');
    const materialFilter = document.getElementById('materialFilter');
    const typeFilter = document.getElementById('typeFilter');
    const productsContainer = document.getElementById('productsContainer');

    if (!productsContainer) return;

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterProducts();
        }, 300));
    }

    // Filter functionality
    [volumeFilter, materialFilter, typeFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterProducts);
        }
    });

    function filterProducts() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const volumeValue = volumeFilter ? volumeFilter.value : '';
        const materialValue = materialFilter ? materialFilter.value : '';
        const typeValue = typeFilter ? typeFilter.value : '';

        const productCards = productsContainer.querySelectorAll('.product-card');
        let visibleCount = 0;

        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            const productDescription = card.querySelector('.product-description').textContent.toLowerCase();
            const cardVolume = card.dataset.volume || '';
            const cardMaterial = card.dataset.material || '';
            const cardType = card.dataset.type || '';

            const matchesSearch = !searchTerm || 
                productName.includes(searchTerm) || 
                productDescription.includes(searchTerm);
            
            const matchesVolume = !volumeValue || cardVolume === volumeValue;
            const matchesMaterial = !materialValue || cardMaterial === materialValue;
            const matchesType = !typeValue || cardType === typeValue;

            const shouldShow = matchesSearch && matchesVolume && matchesMaterial && matchesType;

            if (shouldShow) {
                card.style.display = 'block';
                card.classList.add('fade-in');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });

        // Show/hide no results message
        updateNoResultsMessage(visibleCount);
    }

    function updateNoResultsMessage(count) {
        let noResultsMsg = document.querySelector('.no-results');
        
        if (count === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results';
                noResultsMsg.innerHTML = `
                    <div class="no-results-content">
                        <i class="fas fa-search"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your search criteria or filters</p>
                        <button class="btn btn-primary" onclick="clearAllFilters()">
                            <i class="fas fa-refresh"></i>
                            Clear Filters
                        </button>
                    </div>
                `;
                productsContainer.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else {
            if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        }
    }

    // Clear all filters function
    window.clearAllFilters = function() {
        if (searchInput) searchInput.value = '';
        if (volumeFilter) volumeFilter.value = '';
        if (materialFilter) materialFilter.value = '';
        if (typeFilter) typeFilter.value = '';
        filterProducts();
    };
}

// Quote cart functionality
function initQuoteCart() {
    const quoteCart = document.getElementById('quoteCart');
    const cartToggle = document.getElementById('cartToggle');
    const cartContent = document.getElementById('cartContent');
    const cartItems = document.getElementById('cartItems');
    const clearCartBtn = document.getElementById('clearCart');
    const requestQuoteBtn = document.getElementById('requestQuote');

    let cart = JSON.parse(localStorage.getItem('quoteCart')) || [];
    let isCartOpen = false;

    // Toggle cart visibility
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            isCartOpen = !isCartOpen;
            if (isCartOpen) {
                cartContent.style.display = 'block';
                cartToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
                quoteCart.classList.add('expanded');
            } else {
                cartContent.style.display = 'none';
                cartToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
                quoteCart.classList.remove('expanded');
            }
        });
    }

    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-quote')) {
            const button = e.target.closest('.add-to-quote');
            const productName = button.dataset.product;
            addToCart(productName);
        }

        if (e.target.closest('.quick-quote')) {
            const button = e.target.closest('.quick-quote');
            const productName = button.dataset.product;
            addToCart(productName);
            showQuickQuoteModal(productName);
        }
    });

    // Clear cart
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            cart = [];
            updateCartDisplay();
            saveCart();
            showNotification('Cart cleared successfully', 'info');
        });
    }

    // Request quote
    if (requestQuoteBtn) {
        requestQuoteBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Please add items to your cart first', 'error');
                return;
            }
            showQuoteRequestModal();
        });
    }

    function addToCart(productName) {
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`Updated quantity for ${productName}`, 'success');
        } else {
            cart.push({
                name: productName,
                quantity: 1,
                id: Date.now()
            });
            showNotification(`${productName} added to quote cart`, 'success');
        }
        
        updateCartDisplay();
        saveCart();
        
        // Auto-open cart if it's closed
        if (!isCartOpen) {
            cartToggle.click();
        }
    }

    function updateCartDisplay() {
        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">No items in quote cart</p>';
            return;
        }

        const cartHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        cartItems.innerHTML = cartHTML;

        // Add event listeners for quantity controls
        cartItems.addEventListener('click', function(e) {
            const itemId = parseInt(e.target.closest('[data-id]')?.dataset.id);
            
            if (e.target.closest('.increase')) {
                updateQuantity(itemId, 1);
            } else if (e.target.closest('.decrease')) {
                updateQuantity(itemId, -1);
            } else if (e.target.closest('.remove-item')) {
                removeFromCart(itemId);
            }
        });
    }

    function updateQuantity(itemId, change) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
            } else {
                updateCartDisplay();
                saveCart();
            }
        }
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCartDisplay();
        saveCart();
        showNotification('Item removed from cart', 'info');
    }

    function saveCart() {
        localStorage.setItem('quoteCart', JSON.stringify(cart));
    }

    // Initialize cart display
    updateCartDisplay();
}

// Product interactions
function initProductInteractions() {
    // Product details modal
    document.addEventListener('click', function(e) {
        if (e.target.closest('.product-details')) {
            const button = e.target.closest('.product-details');
            const productName = button.dataset.product;
            showProductDetailsModal(productName);
        }
    });

    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Modal functions
function showProductDetailsModal(productName) {
    const modal = createModal('Product Details', `
        <div class="product-details-content">
            <h3>${productName}</h3>
            <div class="details-grid">
                <div class="detail-section">
                    <h4>Specifications</h4>
                    <ul>
                        <li>Material: High-quality borosilicate glass</li>
                        <li>Graduation: Precision graduated markings</li>
                        <li>Temperature resistance: -70°C to 500°C</li>
                        <li>Chemical resistance: Excellent</li>
                    </ul>
                </div>
                <div class="detail-section">
                    <h4>Applications</h4>
                    <ul>
                        <li>Laboratory measurements</li>
                        <li>Chemical analysis</li>
                        <li>Educational experiments</li>
                        <li>Quality control testing</li>
                    </ul>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="addToCartFromModal('${productName}')">
                    <i class="fas fa-plus"></i>
                    Add to Quote
                </button>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function showQuickQuoteModal(productName) {
    const modal = createModal('Quick Quote Request', `
        <div class="quick-quote-content">
            <h3>Request Quote for ${productName}</h3>
            <form id="quickQuoteForm">
                <div class="form-group">
                    <label for="quickName">Your Name *</label>
                    <input type="text" id="quickName" required>
                </div>
                <div class="form-group">
                    <label for="quickEmail">Email Address *</label>
                    <input type="email" id="quickEmail" required>
                </div>
                <div class="form-group">
                    <label for="quickQuantity">Quantity Needed</label>
                    <input type="number" id="quickQuantity" min="1" value="1">
                </div>
                <div class="form-group">
                    <label for="quickMessage">Additional Notes</label>
                    <textarea id="quickMessage" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        Send Quote Request
                    </button>
                </div>
            </form>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Handle form submission
    const form = modal.querySelector('#quickQuoteForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleQuickQuoteSubmission(productName);
    });
}

function showQuoteRequestModal() {
    const cart = JSON.parse(localStorage.getItem('quoteCart')) || [];
    const cartItemsHTML = cart.map(item => `
        <div class="quote-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">Qty: ${item.quantity}</span>
        </div>
    `).join('');

    const modal = createModal('Request Quote', `
        <div class="quote-request-content">
            <h3>Request Quote for Selected Items</h3>
            <div class="quote-items-summary">
                <h4>Selected Products:</h4>
                ${cartItemsHTML}
            </div>
            <form id="quoteRequestForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="quoteName">Full Name *</label>
                        <input type="text" id="quoteName" required>
                    </div>
                    <div class="form-group">
                        <label for="quoteCompany">Company Name</label>
                        <input type="text" id="quoteCompany">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="quoteEmail">Email Address *</label>
                        <input type="email" id="quoteEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="quotePhone">Phone Number *</label>
                        <input type="tel" id="quotePhone" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="quoteMessage">Additional Requirements</label>
                    <textarea id="quoteMessage" rows="4" placeholder="Any special requirements or additional information..."></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        Submit Quote Request
                    </button>
                </div>
            </form>
        </div>
    `);
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Handle form submission
    const form = modal.querySelector('#quoteRequestForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleQuoteRequestSubmission();
    });
}

// Modal utility functions
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Close modal when clicking overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Form submission handlers
function handleQuickQuoteSubmission(productName) {
    const form = document.getElementById('quickQuoteForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification(`Quote request for ${productName} submitted successfully!`, 'success');
        closeModal();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function handleQuoteRequestSubmission() {
    const form = document.getElementById('quoteRequestForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification('Quote request submitted successfully! We will contact you soon.', 'success');
        
        // Clear cart after successful submission
        localStorage.removeItem('quoteCart');
        const cartItems = document.getElementById('cartItems');
        if (cartItems) {
            cartItems.innerHTML = '<p class="empty-cart">No items in quote cart</p>';
        }
        
        closeModal();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function addToCartFromModal(productName) {
    // Trigger add to cart functionality
    const event = new CustomEvent('click');
    const button = document.createElement('button');
    button.className = 'add-to-quote';
    button.dataset.product = productName;
    button.dispatchEvent(event);
    
    // Manually trigger the add to cart function
    const cart = JSON.parse(localStorage.getItem('quoteCart')) || [];
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            quantity: 1,
            id: Date.now()
        });
    }
    
    localStorage.setItem('quoteCart', JSON.stringify(cart));
    showNotification(`${productName} added to quote cart`, 'success');
    closeModal();
    
    // Update cart display if on products page
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        // Trigger cart update
        window.location.reload();
    }
}

// Utility function (if not already defined in main.js)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

