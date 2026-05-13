# Money-Audit Feature Testing Guide

This document provides step-by-step instructions to verify that the frontend and backend integrations are working correctly across all implemented phases.

---

## 1. Authentication (`/login`, `/register`)
- **Action**: Register a new account, then log out and log back in.
- **Verification**: 
  - Check if the page redirects to `/dashboard` upon success.
  - Open Browser DevTools -> Application -> Local Storage. Verify `token` and `user` keys exist.

## 2. Dashboard & Analytics (`/dashboard`)
- **What you should see**:
  - **Net Balance**: Total money after subtracting expenses from income/savings.
  - **Monthly Spending**: Sum of all expenses created in the current month.
  - **Recent Activity**: A unified list showing your latest 5 actions (e.g., "Lunch at KFC", "Payment from Rahul", "Savings Deposit").
  - **Charts**: Verify the "Spending Overview" and "Category Distribution" charts load data.

## 3. Budgets & Savings
- **Budgets**: 
  - Go to the Budgets page.
  - Set a limit for a category (e.g., "Food" -> ₹5,000).
  - Add an expense in that category. Verify the progress bar updates.
- **Savings**:
  - Add a saving goal or entry. Verify it updates the "Total Savings" on the dashboard.

## 4. Friends & Direct Splits (`/direct`)
- **Friend Requests**:
  - Search for a user (by name/email/phone).
  - Send a request.
  - (On another account) Accept the request.
- **Direct 1-on-1 Split**:
  - Select a friend. 
  - Add an expense (e.g., "Movie Tickets" -> ₹500).
  - **Verification**: "Net Balance" should show "Friend owes you ₹250" (if split 50/50).
- **Payment & Settlement**:
  - **Only Recording**: Use the "Record Payment" button to manually log a cash payment.
  - **Full/Partial Paying**: Enter the amount (either full debt or part of it). Verify the "Net Balance" updates immediately.

## 5. Groups & Group Splits (`/groups`)
- **Creation**: Create a group called "Flatmates".
- **Membership**: Add 2-3 friends to the group.
- **Adding Expenses**:
  - Add an expense for "Electricity Bill" (₹1500).
  - Check the **Balances** tab. It should show a "Who owes Whom" list (e.g., "Friend A owes you ₹500", "Friend B owes you ₹500").
- **Settlement**: Use the "Settle Up" button in the group to record payments between members.

## 6. OCR Receipts (`/expenses` or `/receipts`)
- **Action 1 (With Receipt)**: 
  - Click "Upload Receipt". Select an image (JPG/PNG).
  - Wait for OCR to parse the data. 
  - Verify if Amount, Date, and Merchant are filled automatically.
  - Click "Confirm" to save as a personal expense.
- **Action 2 (Without Receipt)**:
  - Manually fill the "Add Expense" form.
  - Verify it saves correctly without an image.
- **Action 3 (Group Split)**:
  - Upload a receipt within a Group context.
  - Verify it correctly initializes a group split based on the parsed amount.

## 7. Payments (Razorpay Integration)
- **Flow**:
  - Click "Settle" via Razorpay.
  - **Order Creation**: Verify the backend generates an `orderId`.
  - **Verification**: Complete the payment in the Razorpay sandbox modal.
  - **Settlement**: Verify the backend records the payment and updates the debt balance only AFTER signature verification.

---

## Summary of Data Logic
| Action | Impact on Balance | Activity Log |
| :--- | :--- | :--- |
| **Add Personal Expense** | Decrease Balance | New Expense Entry |
| **Add Group Expense** | Decrease Balance (your share) | New Group Expense |
| **Record Received Payment** | Increase Balance | New Payment Entry |
| **Record Sent Payment** | Decrease Balance | New Payment Entry |
| **OCR Upload** | None (until confirmed) | Pending Receipt |
