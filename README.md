#  ModernShop Ecommerce App & Automation Suite

This is a full-featured ecommerce web application built with Flask and tested using both unit tests (pytest) and end-to-end browser automation (Playwright).

⚠️ Note: This project does not use any external database.
Instead:

All backend data is stored in-memory (Python dictionaries/lists) — for simplicity and demo purposes.

Cart data on the frontend is persisted using browser localStorage.

This allows the app to run with zero external dependencies, but also means:

Data resets when the server restarts.

No user registration/login flow exists.

It’s perfect for prototyping, demonstrations, and testing client-server flows.



---

##  Tech Stack

-  Python + Flask for backend APIs
- `pytest` for unit testing
- `Playwright` for E2E automation testing
- HTML + Tailwind CSS + Vanilla JS frontend

---

## 📁 Folder Structure

Got it! Since `app.py` is inside the `backend/` folder, here’s the **updated folder structure** reflecting that:

---

### 📁 Project Structure

```bash
ECOMMERCE-ASSIGNMENT/
├── automation/                     # End-to-end tests with Playwright
│   ├── test_admin_page.py
│   ├── test_cart_page.py
│   └── test_index_page.py
│
├── backend/                        #  Flask backend & unit tests
│   ├── app.py                      # Flask app
│   └── test/                       # Unit tests using pytest
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_admin.py
│       ├── test_admin_auth.py
│       ├── test_cart.py
│       ├── test_checkout_flow.py
│       ├── test_discounts.py
│       └── test_items.py
│
├── frontend/                       #  UI files (HTML/CSS/JS)
│   ├── css/
│   │   ├── admin.css
│   │   ├── cart.css
│   │   └── style.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── cart.js
│   │   └── script.js
│   ├── admin.html
│   ├── cart.html
│   └── index.html
│
├── assets/                         #  css for Pytest HTML 
├── .gitignore                      #  Git ignore
├── requirements.txt                # Python dependencies
├── README.md                       #  Project documentation
└── report.html                     #  Pytest HTML test report
```

---

## ⚙️ Running the Flask App

> Make sure you have Python 3.7+

### 1. Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Run the server:

```bash
python app.py
```

### 🔗 Visit:
```
Frontend:       http://localhost:5000/
Cart Page:      http://localhost:5000/cart.html
Admin Panel:    http://localhost:5000/admin.html
```

---

## 🧪 Running Unit Tests with `pytest`

### 1. Run all tests:

```bash
pytest test/
```

### 2. Run a specific test file:

```bash
pytest test/test_cart.py
```

---

## 🎭 Running E2E Tests with Playwright

### 1. Install Playwright

```bash
pip install playwright pytest pytest-html
playwright install
```

### 2. Run all automation tests

```bash
pytest automation/ --html=report.html --self-contained-html
```


### ✅ What It Tests:

- Product listing and cart badge on index page
- Discount application and checkout on cart page
- Admin login, discount code generation, modal verification

---

## 📋 Admin Credentials

```txt
Username: admin
Password: admin#123
```

---

## 🧾 requirements.txt

```txt
Flask
pytest
playwright
pytest-html
requests
```

---

## 🧼 .gitignore

```gitignore
__pycache__/
*.pyc
*.log
.env
venv/
*.zip
report.html
playwright-report/
.cache/
```

---

## 💡 Assumptions

- App runs at `http://localhost:5000`
- Discount codes are created every **3rd order**
- Coupon codes are single-use
- Checkout shows browser alerts (captured in Playwright tests)

---

## 👨‍💻 Author

Built by Ankit Chauhan  


