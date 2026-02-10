let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

document.querySelectorAll('.image-slider img').forEach(images => {
    images.onclick = () => {
        var src = images.getAttribute('src');
        document.querySelector('.main-home-image').src = src;
    };
});

var swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
    grabCursor: true,
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        }
    },
});

// Cart functionality
let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];

// Product data
const products = [
    { id: 1, name: 'our special coffee', price: 8.99, image: 'image/menu-1.png' },
    { id: 2, name: 'our special coffee', price: 8.99, image: 'image/menu-2.png' },
    { id: 3, name: 'our special coffee', price: 8.99, image: 'image/menu-3.png' },
    { id: 4, name: 'our special coffee', price: 8.99, image: 'image/menu-4.png' },
    { id: 5, name: 'our special coffee', price: 8.99, image: 'image/menu-5.png' },
    { id: 6, name: 'our special coffee', price: 8.99, image: 'image/menu-6.png' }
];

// Update cart count display
function updateCartCount() {
    const cartCounts = document.querySelectorAll('.cart-count');
    if (cartCounts.length > 0) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCounts.forEach(cartCount => {
            cartCount.textContent = totalItems;
            
            // Hide count if cart is empty
            if (totalItems === 0) {
                cartCount.style.display = 'none';
            } else {
                cartCount.style.display = 'inline-block';
            }
        });
    }
}

// Log user activity
function logUserActivity(action, details) {
    const activity = JSON.parse(localStorage.getItem('userActivity')) || [];
    const logEntry = {
        userId: 'Guest User', // In a real app, this would be the logged-in user ID
        action: action,
        details: details,
        timestamp: new Date().toISOString()
    };
    activity.push(logEntry);
    
    // Keep only last 100 activities to prevent storage bloat
    if (activity.length > 100) {
        activity.splice(0, activity.length - 100);
    }
    
    localStorage.setItem('userActivity', JSON.stringify(activity));
}

// Enhanced addToCart with activity tracking
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        logUserActivity('Cart Updated', `Added another ${product.name} to cart (quantity: ${existingItem.quantity})`);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        logUserActivity('Item Added to Cart', `Added ${product.name} to cart`);
    }
    
    saveCart();
    updateCartDisplay();
    updateCartCount();
    showNotification('Product added to cart!'); 
}

// Remove from cart with activity tracking
function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        logUserActivity('Item Removed from Cart', `Removed ${item.name} from cart`);
    }
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

// Update quantity with activity tracking
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            logUserActivity('Cart Quantity Updated', `Updated ${item.name} quantity from ${oldQuantity} to ${item.quantity}`);
            saveCart();
            updateCartDisplay();
            updateCartCount();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('coffeeCart', JSON.stringify(cart));
}

// Update cart display on order page
function updateCartDisplay() {
    const cartContent = document.getElementById('cart-content');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (!cartContent) return; // Not on order page
    
    // Load cart from localStorage to ensure we have the latest data
    cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some delicious coffee from our menu!</p>
                <a href="index.html#menu" class="btn" style="margin-top: 1rem; display: inline-block;">Browse Menu</a>
            </div>
        `;
        subtotalEl.textContent = '$0.00';
        taxEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    });
    
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    cartContent.innerHTML = cartHTML;
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    // Create order object
    const order = {
        id: Date.now(),
        customer: 'Guest User', // In a real app, this would be logged-in user
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('coffeeOrders')) || [];
    orders.push(order);
    localStorage.setItem('coffeeOrders', JSON.stringify(orders));
    
    // Log user activity
    logUserActivity('Order Placed', `Order #${order.id} with ${cart.length} items, total: $${total.toFixed(2)}`);
    
    showNotification(`Order placed! Total: $${total.toFixed(2)}`);
    
    // Clear cart after checkout
    cart = [];
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d3ad7f;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add event listeners to add to cart buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to all add to cart buttons
    const addCartButtons = document.querySelectorAll('.add-cart button');
    addCartButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart(index + 1); // Product IDs start from 1
        });
    });
    
    // Update cart display if on order page
    if (window.location.href.includes('order.html') || document.getElementById('cart-content')) {
        updateCartDisplay();
    }
    
    // Initialize cart count on page load
    updateCartCount();
    
    // Force cart display update on order page
    if (window.location.href.includes('order.html')) {
        setTimeout(() => {
            updateCartDisplay();
        }, 100);
    }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);