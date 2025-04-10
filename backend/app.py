from flask import Flask, request, jsonify,Response, send_from_directory
from uuid import uuid4
from collections import defaultdict
import os
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


# Configuration
NTH_ORDER = 3
DISCOUNT_PERCENTAGE = 10
#Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin#123"  


# In-memory store
users_cart = defaultdict(list)
orders = []
discount_codes = {}
used_discount_codes = set()
item_stats = defaultdict(int)
total_sales = 0.0
total_discount_amount = 0.0

# Sample item catalog
ITEM_CATALOG = {
    "item1": 99.99,
    "item2": 199.99,
    "item3": 59.99,
    "item4": 49.99,
    "item5": 29.99,
    "item6": 39.99,
    "item7": 129.99,
}

product_images=['1505740420928-5e560c06d30e','1523275335684-37898b6baf30','1572569511254-d8f925fe2cbb','1553062407-98eeb64c6a62','1527814050087-3793815479db','1593642632823-8f785ba67e45','1544947950-fa07a98d237f']

def check_auth(username, password):
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD

def authenticate():
    return Response(
        "Could not verify your access.\n"
        "Login required.", 401,
        {"WWW-Authenticate": 'Basic realm="Login Required"'}
    )

# === API Routes ===

@app.route('/items', methods=['GET'])
def get_items():
    # Convert to list of item dicts
    item_list = []
    for item_id, price in ITEM_CATALOG.items():
        idx = int(item_id.replace('item', ''))
        item_list.append({
            "id": idx,
            "item_id": item_id,
            "name": f"Item {idx}",
            "price": price,
            "image": f"https://images.unsplash.com/photo-{product_images[idx-1]}"
        })
    return jsonify(item_list)

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    item_id = data.get('item_id')
    quantity = data.get('quantity', 1)

    if item_id not in ITEM_CATALOG:
        return jsonify({"error": "Invalid item ID"}), 400

    users_cart[user_id].append({"item_id": item_id, "quantity": quantity})
    return jsonify({"message": "Item added to cart"}), 200

@app.route('/checkout', methods=['POST'])
def checkout():
    global total_sales, total_discount_amount

    data = request.get_json()
    user_id = data.get('user_id')
    discount_code = data.get('discount_code')
    frontend_cart = data.get('cart')  

    cart = users_cart.get(user_id, [])

    # Fallback to frontend cart if backend cart is empty
    if not cart and frontend_cart:
        cart = []
        for item in frontend_cart:
            backend_id = f"item{item['id']}"
            if backend_id in ITEM_CATALOG:
                cart.append({
                    "item_id": backend_id,
                    "quantity": item["quantity"]
                })
        users_cart[user_id] = cart 

    if not cart:
        return jsonify({"error": "Cart is empty"}), 400

    subtotal = 0.0
    for entry in cart:
        item_id = entry['item_id']
        quantity = entry['quantity']
        item_price = ITEM_CATALOG[item_id]
        subtotal += item_price * quantity
        item_stats[item_id] += quantity

    discount = 0.0
    if discount_code:
        if discount_code not in discount_codes or discount_code in used_discount_codes:
            return jsonify({"error": "Invalid or already used discount code"}), 400
        discount = (DISCOUNT_PERCENTAGE / 100.0) * subtotal
        used_discount_codes.add(discount_code)
        total_discount_amount += discount

    total = subtotal - discount
    total_sales += total

    orders.append({
        "user_id": user_id,
        "items": cart,
        "subtotal": subtotal,
        "discount": discount,
        "total": total
    })

    users_cart[user_id] = []  # Clear the cart

    return jsonify({
        "subtotal": subtotal,
        "discount": discount,
        "total": total
    }), 200

@app.route('/validate-coupon', methods=['POST'])
def validate_coupon():
    data = request.get_json()
    code = data.get("code")
    if code in discount_codes and code not in used_discount_codes:
        return jsonify({"valid": True}), 200
    return jsonify({"valid": False}), 200


@app.route('/admin')
def admin_page():
    auth = request.authorization
    if not auth or not check_auth(auth.username, auth.password):
        return authenticate()
    return send_from_directory(FRONTEND_FOLDER, 'admin.html')  

@app.route('/admin/generate-discount', methods=['POST'])
def generate_discount():
    if len(orders) % NTH_ORDER == 0:
        code = str(uuid4())[:8]
        discount_codes[code] = True
        return jsonify({"code": code}), 200
    return jsonify({"message": "Not eligible yet for discount code"}), 200

@app.route('/admin/stats', methods=['GET'])
def get_stats():
    return jsonify({
        "items_purchased": dict(item_stats),  
        "total_sales": total_sales,
        "discount_codes": list(discount_codes.keys()),
        "total_discount_amount": total_discount_amount
    })


# === Serve Frontend Files ===

FRONTEND_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

@app.route('/cart.html')
def serve_cart():
    return send_from_directory(FRONTEND_FOLDER, 'cart.html')

@app.route('/admin.html')
def serve_admin():
    return send_from_directory(FRONTEND_FOLDER, 'admin.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_FOLDER, path)

# === Run App ===

if __name__ == '__main__':
    app.run(debug=True)
