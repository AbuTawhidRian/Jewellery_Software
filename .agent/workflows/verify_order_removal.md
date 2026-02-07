---
description: Test Customer Login and Verify Order Removal
---
1. Navigate to the login page: `http://localhost:3000/login`
2. Log in with test credentials:
   - Email: `demo@example.com`
   - Password: `password123`
3. Verify Dashboard:
   - Check URL is `http://localhost:3000/dashboard`
   - Confirm no "Pending Orders" or order-related metrics are visible.
4. Verify Customers Page:
   - Navigate to `http://localhost:3000/customers`
   - Confirm the customers table does not have an "Orders" column.
   - Click on a customer to view details.
   - Confirm no "Recent Orders" section or "Total Orders" card is present.
5. Verify Gold Ledger:
   - Navigate to `http://localhost:3000/gold-ledger`
   - Confirm transactions are listed.
   - Click "Filter by type" and ensure options are "Receive", "Pay", and "Adjustment".
6. Verify Cash Ledger:
   - Navigate to `http://localhost:3000/cash-ledger`
   - Confirm transactions are listed.
   - Click "Filter by type" and ensure options are "Receive", "Pay", "Adjustment", "Transfer", "Deposit", "Withdraw".
