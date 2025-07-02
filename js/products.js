// Products page functionality with Web3Forms integration
document.addEventListener('DOMContentLoaded', function() {
    initProductFilters();
    initQuoteCart();
    initProductInteractions();
    
    console.log('Products page loaded successfully! 🧪');
});

// Product filtering and search
function initProductFilters() {
    const searchInput = document.getElementById('productSearch') || document.getElementById('product-search');
    const productsContainer = document.getElementById('productsContainer') || document.getElementById('products-container');
    if (!productsContainer) return;

    const productCards = productsContainer.querySelectorAll('.product-card');

    const filters = {
        category: document.getElementById('categoryFilter') || document.getElementById('category-filter'),
        application: document.getElementById('applicationFilter') || document.getElementById('application-filter'),
        feature: document.getElementById('featureFilter') || document.getElementById('feature-filter'),
        certification: document.getElementById('certificationFilter') || document.getElementById('certification-filter'),
        volume: document.getElementById('volumeFilter'),
        material: document.getElementById('materialFilter'),
        type: document.getElementById('typeFilter'),
    };

    const filterProducts = () => {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        let visibleCount = 0;

        productCards.forEach(card => {
            const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
            const matchesSearch = !searchTerm || name.includes(searchTerm) || description.includes(searchTerm);

            const matchesFilters = Object.entries(filters).every(([key, element]) => {
                if (!element || !element.value || element.value === '' || element.value === 'all') return true;
                const attr = card.dataset[key] || '';
                return attr.toLowerCase().includes(element.value.toLowerCase());
            });

            const shouldShow = matchesSearch && matchesFilters;
            card.style.display = shouldShow ? 'block' : 'none';
            card.classList.toggle('fade-in', shouldShow);
            if (shouldShow) visibleCount++;
        });

        updateNoResultsMessage(visibleCount);
    };

    if (searchInput) searchInput.addEventListener('input', debounce(filterProducts, 300));
    Object.values(filters).forEach(filter => {
        if (filter) filter.addEventListener('change', filterProducts);
    });

    window.clearAllFilters = () => {
        if (searchInput) searchInput.value = '';
        Object.values(filters).forEach(filter => {
            if (filter) filter.value = '';
        });
        filterProducts();
    };

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
                  </div>`;
                productsContainer.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else {
            if (noResultsMsg) noResultsMsg.style.display = 'none';
        }
    }

    filterProducts();
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

// Get current page information
function getCurrentPageInfo() {
    const pageTitle = document.title || 'Minable Scientific Product Page';
    const currentUrl = window.location.href;
    const pageName = document.querySelector('.page-title')?.textContent || 'Product Page';
    
    return {
        pageTitle,
        currentUrl,
        pageName
    };
}

// Get product details from the page
function getProductDetails(productName) {
    const productCards = document.querySelectorAll('.product-card');
    let productDetails = {};
    
    productCards.forEach(card => {
        const cardProductName = card.querySelector('.product-name')?.textContent;
        if (cardProductName === productName) {
            productDetails = {
                name: productName,
                description: card.querySelector('.product-description')?.textContent || '',
                specs: Array.from(card.querySelectorAll('.spec-tag')).map(tag => tag.textContent).join(', '),
                category: card.dataset.category || '',
                type: card.dataset.type || '',
                volume: card.dataset.volume || '',
                material: card.dataset.material || ''
            };
        }
    });
    
    return productDetails;
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
    const pageInfo = getCurrentPageInfo();
    const productDetails = getProductDetails(productName);
    
    const modal = createModal('Quick Quote Request', `
        <div class="quick-quote-content">
            <h3>Request Quote for ${productName}</h3>
            <form id="quickQuoteForm" action="https://api.web3forms.com/submit" method="POST">
                <!-- Web3Forms Access Key -->
                <input type="hidden" name="access_key" value="af31cdca-fdb5-4fd7-81bd-762838f8e47f">
                
                <!-- Email Subject -->
                <input type="hidden" name="subject" value="🔬 Quick Quote Request for ${productName} - Minable Scientific">
                
                <!-- Page and Product Context -->
                <input type="hidden" name="pageTitle" value="${pageInfo.pageTitle}">
                <input type="hidden" name="pageUrl" value="${pageInfo.currentUrl}">
                <input type="hidden" name="pageName" value="${pageInfo.pageName}">
                <input type="hidden" name="productName" value="${productDetails.name}">
                <input type="hidden" name="productDescription" value="${productDetails.description}">
                <input type="hidden" name="productSpecs" value="${productDetails.specs}">
                <input type="hidden" name="productCategory" value="${productDetails.category}">
                <input type="hidden" name="productType" value="${productDetails.type}">
                <input type="hidden" name="productVolume" value="${productDetails.volume}">
                <input type="hidden" name="productMaterial" value="${productDetails.material}">
                
                <!-- Form Source Context -->
                <input type="hidden" name="formSource" value="Quick Quote Modal - Product Page">
                <input type="hidden" name="emailContext" value="This is a quick quote request submitted from a product page on the Minable Scientific website.">
                
                <!-- Honeypot Spam Protection -->
                <input type="checkbox" name="botcheck" class="hidden" style="display:none;">
                
                <div class="form-group">
                    <label for="quickName">Your Name *</label>
                    <input type="text" id="quickName" name="customerName" required>
                </div>
                <div class="form-group">
                    <label for="quickEmail">Email Address *</label>
                    <input type="email" id="quickEmail" name="customerEmail" required>
                </div>
                <div class="form-group">
                    <label for="quickQuantity">Quantity Needed</label>
                    <input type="number" id="quickQuantity" name="quantityNeeded" min="1" value="1">
                </div>
                <div class="form-group">
                    <label for="quickMessage">Additional Notes</label>
                    <textarea id="quickMessage" name="additionalNotes" rows="3"></textarea>
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
        handleQuickQuoteSubmission(form, productName);
    });
}

function showQuoteRequestModal() {
    const cart = JSON.parse(localStorage.getItem('quoteCart')) || [];
    const pageInfo = getCurrentPageInfo();
    
    const cartItemsHTML = cart.map(item => `
        <div class="quote-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">Qty: ${item.quantity}</span>
        </div>
    `).join('');

    // Prepare detailed product information for email
    const detailedProductList = cart.map(item => {
        const details = getProductDetails(item.name);
        return `${item.name} (Qty: ${item.quantity}) - ${details.description} - Specs: ${details.specs}`;
    }).join('\n');

    const modal = createModal('Request Quote', `
        <div class="quote-request-content">
            <h3>Request Quote for Selected Items</h3>
            <div class="quote-items-summary">
                <h4>Selected Products:</h4>
                ${cartItemsHTML}
            </div>
            <form id="quoteRequestForm" action="https://api.web3forms.com/submit" method="POST">
                <!-- Web3Forms Access Key -->
                <input type="hidden" name="access_key" value="af31cdca-fdb5-4fd7-81bd-762838f8e47f">
                
                <!-- Email Subject -->
                <input type="hidden" name="subject" value="📦 Multiple Product Quote Request - Minable Scientific">
                
                <!-- Page and Product Context -->
                <input type="hidden" name="pageTitle" value="${pageInfo.pageTitle}">
                <input type="hidden" name="pageUrl" value="${pageInfo.currentUrl}">
                <input type="hidden" name="pageName" value="${pageInfo.pageName}">
                <input type="hidden" name="selectedProducts" value="${detailedProductList}">
                <input type="hidden" name="totalItems" value="${cart.length}">
                
                <!-- Form Source Context -->
                <input type="hidden" name="formSource" value="Quote Request Modal - Product Page Cart">
                <input type="hidden" name="emailContext" value="This is a quote request for multiple products submitted from the quote cart on a product page of the Minable Scientific website.">
                
                <!-- Honeypot Spam Protection -->
                <input type="checkbox" name="botcheck" class="hidden" style="display:none;">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="quoteName">Full Name *</label>
                        <input type="text" id="quoteName" name="customerName" required>
                    </div>
                    <div class="form-group">
                        <label for="quoteCompany">Company Name</label>
                        <input type="text" id="quoteCompany" name="companyName">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="quoteEmail">Email Address *</label>
                        <input type="email" id="quoteEmail" name="customerEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="quotePhone">Phone Number *</label>
                        <input type="tel" id="quotePhone" name="phoneNumber" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="quoteMessage">Additional Requirements</label>
                    <textarea id="quoteMessage" name="additionalRequirements" rows="4" placeholder="Any special requirements or additional information..."></textarea>
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
        handleQuoteRequestSubmission(form);
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

// Form submission handlers with Web3Forms integration
function handleQuickQuoteSubmission(form, productName) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Quote request for ${productName} submitted successfully!`, 'success');
            closeModal();
        } else {
            showNotification('There was an error sending your quote request. Please try again.', 'error');
        }
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function handleQuoteRequestSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Quote request submitted successfully! We will contact you soon.', 'success');
            
            // Clear cart after successful submission
            localStorage.removeItem('quoteCart');
            const cartItems = document.getElementById('cartItems');
            if (cartItems) {
                cartItems.innerHTML = '<p class="empty-cart">No items in quote cart</p>';
            }
            
            closeModal();
        } else {
            showNotification('There was an error sending your quote request. Please try again.', 'error');
        }
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An unexpected error occurred. Please try again.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
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

// Notification function (if not already defined in main.js)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: 1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                min-width: 300px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-content i {
                color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #64748b;
                padding: 0.25rem;
            }
            
            .notification-close:hover {
                color: #334155;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

