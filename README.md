# E-Commerce Platform

A full-stack e-commerce application built with Next.js, React, and SQLite.

## Features

- User authentication (Register, Login, Logout)
- Role-based access control (Admin, Seller, Buyer)
- Product management for sellers
- Shopping cart functionality for buyers
- Order placement and history
- Admin dashboard with user and product management

### Admin Features
- View all users, products, and orders
- Add new users
- View statistics (total users, products, orders)

### Seller Features
- Manage their own products (Add, Edit, Delete)
- View their order history

### Buyer Features
- Browse products
- Add products to cart
- Place orders
- View order history

## Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/Hanahafi/redux-stack-ecommerce.git
   cd redux-stack-ecommerce
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following:
   ```
   JWT_SECRET=your_very_long_and_secure_secret_key_here
   ```

4. Set up the database:
   The application uses SQLite, which doesn't require additional setup. The database file will be created automatically when you run the application.

## Running the Application

1. For development:
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

## Initial Setup

On first run, you'll need to create an admin user. Follow these steps to register a new user and manually update their role to admin using VS Code:

1. Register a new user through the application interface.

2. Install the SQLite Editor extension for VS Code:
   - Open VS Code
   - Click on the Extensions icon in the left sidebar (or press Ctrl+Shift+X)
   - Search for "SQLite" in the Extensions marketplace
   - Find "SQLite" by alexcvzz and click "Install"

3. Open your project in VS Code.

4. Locate the `database.sqlite` file in your project directory.

5. Right-click on the `database.sqlite` file and select "Open Database".

6. In the SQL EXPLORER view (usually at the bottom of the left sidebar), you should see your database listed.

7. Expand the database, then expand the "tables" folder, and right-click on the "users" table.

8. Select "Show Table" to view the contents of the users table.

9. To update the user's role to admin, right-click on the "users" table again and select "New Query".

10. In the new query window that opens, enter the following SQL command:
    ```sql
    UPDATE users SET role = 'admin' WHERE email = 'your_admin_email@example.com';
    ```
    Replace 'your_admin_email@example.com' with the email address you used during registration.

11. Click the "Run" button (play icon) at the top of the query window to execute the SQL command.

12. Refresh the users table view to confirm that the role has been updated to 'admin'.

After completing these steps, the user associated with the email you specified will have admin privileges in your application.
