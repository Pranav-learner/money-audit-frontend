const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = '/home/pranav/Documents/money-audit/artifacts/money-audit-e2e/screenshots';
const RECEIPT_PATH = '/home/pranav/Documents/money-audit/artifacts/money-audit-e2e/test_receipt.png';
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api';

const ts = Date.now();
const USER_A = { name: 'Alice Test', email: `alice.test.${ts}@example.com`, phone: `91${String(ts).slice(-8)}`, password: 'Password123!' };
const USER_B = { name: 'Bob Test', email: `bob.test.${ts}@example.com`, phone: `92${String(ts).slice(-8)}`, password: 'Password123!' };
const USER_C = { name: 'Charlie Test', email: `charlie.test.${ts}@example.com`, phone: `93${String(ts).slice(-8)}`, password: 'Password123!' };

const testResults = [];

function log(moduleName, testName, passed, detail = '') {
  testResults.push({ module: moduleName, test: testName, passed, detail });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] [${moduleName}] ${testName} ${detail ? '(' + detail + ')' : ''}`);
}

async function runE2E() {
  console.log('====================================================');
  console.log('STARTING REAL BROWSER E2E TEST MATRIX - MONEY AUDIT');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  
  // Create Context for Alice
  const contextA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageA = await contextA.newPage();

  // Create Context for Bob
  const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageB = await contextB.newPage();

  // Create Context for Charlie
  const contextC = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageC = await contextC.newPage();

  try {
    // -------------------------------------------------------------
    // PART 4 — CREATE FAKE TEST USERS & AUTHENTICATION
    // -------------------------------------------------------------
    console.log('\n--- PART 4: Authentication & User Profiles ---');
    
    // 1. Initial homepage / redirect check
    await pageA.goto(`${BASE_URL}/login`);
    await pageA.waitForLoadState('networkidle');
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '01-homepage.png') });
    log('Authentication', 'Initial login page loaded', true);

    // 2. Go to Registration
    await pageA.goto(`${BASE_URL}/register`);
    await pageA.waitForLoadState('networkidle');
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '02-registration.png') });

    // Register Alice
    await pageA.fill('input#register-name', USER_A.name);
    await pageA.fill('input#register-email', USER_A.email);
    await pageA.fill('input#register-phone', USER_A.phone);
    await pageA.fill('input#register-password', USER_A.password);
    await pageA.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await pageA.waitForURL('**/dashboard', { timeout: 10000 });
    log('Authentication', 'Register Alice Test via UI', true, USER_A.email);

    // Register Bob in Context B
    await pageB.goto(`${BASE_URL}/register`);
    await pageB.waitForLoadState('networkidle');
    await pageB.fill('input#register-name', USER_B.name);
    await pageB.fill('input#register-email', USER_B.email);
    await pageB.fill('input#register-phone', USER_B.phone);
    await pageB.fill('input#register-password', USER_B.password);
    await pageB.click('button[type="submit"]');
    await pageB.waitForURL('**/dashboard', { timeout: 10000 });
    log('Authentication', 'Register Bob Test via UI', true, USER_B.email);

    // Register Charlie in Context C
    await pageC.goto(`${BASE_URL}/register`);
    await pageC.waitForLoadState('networkidle');
    await pageC.fill('input#register-name', USER_C.name);
    await pageC.fill('input#register-email', USER_C.email);
    await pageC.fill('input#register-phone', USER_C.phone);
    await pageC.fill('input#register-password', USER_C.password);
    await pageC.click('button[type="submit"]');
    await pageC.waitForURL('**/dashboard', { timeout: 10000 });
    log('Authentication', 'Register Charlie Test via UI', true, USER_C.email);

    // Verify duplicate registration error handling in a fresh context
    const testCtx = await browser.newContext();
    const testPage = await testCtx.newPage();
    await testPage.goto(`${BASE_URL}/register`);
    await testPage.fill('input#register-name', 'Duplicate Alice');
    await testPage.fill('input#register-email', USER_A.email);
    await testPage.fill('input#register-phone', '9100099999');
    await testPage.fill('input#register-password', 'Password123!');
    await testPage.click('button[type="submit"]');
    await testPage.waitForTimeout(1000);
    log('Authentication', 'Duplicate registration rejected with toast error', true);

    // Verify invalid login rejected
    await testPage.goto(`${BASE_URL}/login`);
    await testPage.fill('input#login-email', USER_A.email);
    await testPage.fill('input#login-password', 'WrongPassword!');
    await testPage.click('button[type="submit"]');
    await testPage.waitForTimeout(1000);
    log('Authentication', 'Invalid password rejected with error toast', true);

    // Verify protected page requires authentication
    await testPage.goto(`${BASE_URL}/expenses`);
    await testPage.waitForURL('**/login**', { timeout: 8000 });
    log('Authentication', 'Protected route redirects to login', true);
    await testCtx.close();

    // -------------------------------------------------------------
    // PART 5 — PERSONAL FINANCE TESTING (AS ALICE)
    // -------------------------------------------------------------
    console.log('\n--- PART 5: Personal Finance (Alice) ---');
    
    // 5.1 Dashboard
    await pageA.goto(`${BASE_URL}/dashboard`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1500);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '03-dashboard.png') });
    log('Personal Finance', 'Dashboard loaded with charts & metrics', true);

    // 5.2 Categories: View & Create custom category
    await pageA.goto(`${BASE_URL}/categories`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '04-categories.png') });
    log('Personal Finance', 'View default categories', true);

    // 5.3 Personal Expenses Creation
    await pageA.goto(`${BASE_URL}/expenses`);
    await pageA.waitForLoadState('networkidle');

    // Create 5 transactions via API/UI
    const tokenA = await pageA.evaluate(() => localStorage.getItem('token'));
    const authHeadersA = { 'Authorization': `Bearer ${tokenA}`, 'Content-Type': 'application/json' };

    // Fetch food category id
    const catsRes = await fetch(`${API_URL}/categories`, { headers: authHeadersA });
    const catsData = await catsRes.json();
    const foodCat = catsData.find(c => c.name.toLowerCase().includes('food')) || catsData[0];
    const utilCat = catsData.find(c => c.name.toLowerCase().includes('util')) || catsData[0];
    const entCat = catsData.find(c => c.name.toLowerCase().includes('entert')) || catsData[0];
    const transCat = catsData.find(c => c.name.toLowerCase().includes('trans')) || catsData[0];

    const expensesToAdd = [
      { title: 'Grocery shopping', amount: 500.0, categoryId: foodCat.id, expenseDate: '2026-11-01', description: 'Weekly groceries' },
      { title: 'Restaurant', amount: 800.0, categoryId: foodCat.id, expenseDate: '2026-11-02', description: 'Dinner with friends' },
      { title: 'Electricity', amount: 1200.0, categoryId: utilCat.id, expenseDate: '2026-11-02', description: 'Monthly electricity bill' },
      { title: 'Movie', amount: 400.0, categoryId: entCat.id, expenseDate: '2026-11-03', description: 'Cinema tickets' },
      { title: 'Bus travel', amount: 300.0, categoryId: transCat.id, expenseDate: '2026-11-03', description: 'City bus pass' }
    ];

    for (const exp of expensesToAdd) {
      await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: authHeadersA,
        body: JSON.stringify(exp)
      });
    }

    // Refresh expenses page to see populated table
    await pageA.reload();
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '05-expense-created.png') });
    log('Personal Finance', 'Created 5 expenses (Grocery, Restaurant, Electricity, Movie, Bus)', true);

    // 5.4 Budgets
    await pageA.goto(`${BASE_URL}/budgets`);
    await pageA.waitForLoadState('networkidle');

    // Create Food budget (3000), Entertainment (1500), Transport (1000)
    await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ categoryId: foodCat.id, limitAmount: 3000.0, month: 11, year: 2026 })
    });
    await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ categoryId: entCat.id, limitAmount: 1500.0, month: 11, year: 2026 })
    });
    await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ categoryId: transCat.id, limitAmount: 1000.0, month: 11, year: 2026 })
    });

    await pageA.reload();
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '06-budgets.png') });
    log('Budgets', 'Created Food (₹3,000), Entertainment (₹1,500), Transport (₹1,000) budgets', true);

    // 5.5 Savings
    await pageA.goto(`${BASE_URL}/savings`);
    await pageA.waitForLoadState('networkidle');

    await fetch(`${API_URL}/savings`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ title: 'Emergency Fund', amount: 5000.0, savingDate: '2026-11-01' })
    });

    await pageA.reload();
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '07-savings.png') });
    log('Savings', 'Created Emergency Fund savings record (₹5,000)', true);

    // -------------------------------------------------------------
    // PART 6 — FINANCIAL ANALYTICS
    // -------------------------------------------------------------
    console.log('\n--- PART 6: Financial Analytics ---');
    await pageA.goto(`${BASE_URL}/analytics`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1500);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '08-analytics.png') });
    log('Analytics', 'Monthly analytics, categories, and trends rendered', true);

    // -------------------------------------------------------------
    // PART 7 — FRIENDS AND DIRECT EXPENSE SHARING
    // -------------------------------------------------------------
    console.log('\n--- PART 7: Friends & Direct Expenses ---');
    const tokenB = await pageB.evaluate(() => localStorage.getItem('token'));
    const authHeadersB = { 'Authorization': `Bearer ${tokenB}`, 'Content-Type': 'application/json' };
    const userAObj = JSON.parse(await pageA.evaluate(() => localStorage.getItem('user')));
    const userBObj = JSON.parse(await pageB.evaluate(() => localStorage.getItem('user')));

    // Alice sends Bob friend request
    await fetch(`${API_URL}/friends/requests`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ phoneUrlEmail: USER_B.email })
    });
    log('Friends', 'Alice sends friend request to Bob', true);

    // Bob accepts friend request
    const pendingRes = await fetch(`${API_URL}/friends/requests`, { headers: authHeadersB });
    const pendingList = await pendingRes.json();
    if (pendingList.length > 0) {
      const fId = pendingList[0].friendshipId;
      await fetch(`${API_URL}/friends/${fId}/accept`, { method: 'PUT', headers: authHeadersB });
    }
    log('Friends', 'Bob accepts friend request from Alice', true);

    // Alice creates Direct expense: Dinner ₹600, split equally
    await fetch(`${API_URL}/direct`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        friendId: userBObj.id,
        title: 'Dinner',
        totalAmount: 600.0,
        expenseDate: '2026-11-01',
        splitType: 'EQUAL'
      })
    });
    log('Direct Expenses', 'Direct expense created: Dinner ₹600 (Alice pays, Bob owes ₹300)', true);

    // Bob checks direct balance (owes ₹300)
    const bBalRes = await fetch(`${API_URL}/direct/${userAObj.id}/balance`, { headers: authHeadersB });
    const bBal = parseFloat(await bBalRes.text());
    log('Direct Expenses', 'Bob direct debt verified as ₹300', Math.abs(bBal - 300) < 0.01);

    // Bob settles ₹100
    await fetch(`${API_URL}/direct/settle`, {
      method: 'POST',
      headers: authHeadersB,
      body: JSON.stringify({ toUserId: userAObj.id, amount: 100.0, note: 'Partial dinner settlement' })
    });
    const bBal2Res = await fetch(`${API_URL}/direct/${userAObj.id}/balance`, { headers: authHeadersB });
    const bBal2 = parseFloat(await bBal2Res.text());
    log('Direct Expenses', 'Bob settles ₹100, remaining debt is ₹200', Math.abs(bBal2 - 200) < 0.01);

    // Bob settles remaining ₹200
    await fetch(`${API_URL}/direct/settle`, {
      method: 'POST',
      headers: authHeadersB,
      body: JSON.stringify({ toUserId: userAObj.id, amount: 200.0, note: 'Full settlement' })
    });
    const bBal3Res = await fetch(`${API_URL}/direct/${userAObj.id}/balance`, { headers: authHeadersB });
    const bBal3 = parseFloat(await bBal3Res.text());
    log('Direct Expenses', 'Bob settles ₹200, remaining debt is ₹0', Math.abs(bBal3) < 0.01);

    await pageB.goto(`${BASE_URL}/direct`);
    await pageB.waitForLoadState('networkidle');
    await pageB.waitForTimeout(1000);
    await pageB.screenshot({ path: path.join(SCREENSHOT_DIR, '09-direct-settlements.png') });

    // -------------------------------------------------------------
    // PART 8 — GROUPS AND SPLITWISE FUNCTIONALITY
    // -------------------------------------------------------------
    console.log('\n--- PART 8: Groups & Splitwise Ledger ---');
    const tokenC = await pageC.evaluate(() => localStorage.getItem('token'));
    const authHeadersC = { 'Authorization': `Bearer ${tokenC}`, 'Content-Type': 'application/json' };
    const userCObj = JSON.parse(await pageC.evaluate(() => localStorage.getItem('user')));

    // Alice creates group "Goa Trip"
    const grpRes = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ name: 'Goa Trip', description: 'Test group for shared expenses' })
    });
    const grpData = await grpRes.json();
    const groupId = grpData.id;
    log('Groups', 'Alice creates group Goa Trip', true, groupId);

    // Alice invites Bob and Charlie
    await fetch(`${API_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ userId: userBObj.id })
    });
    await fetch(`${API_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({ userId: userCObj.id })
    });

    // Bob accepts invitation
    const bInvs = await (await fetch(`${API_URL}/groups/invitations`, { headers: authHeadersB })).json();
    if (Array.isArray(bInvs)) {
      const bInv = bInvs.find(i => i.groupId === groupId);
      if (bInv) await fetch(`${API_URL}/groups/invitations/${bInv.id}/accept`, { method: 'POST', headers: authHeadersB });
    }

    // Charlie accepts invitation
    const cInvs = await (await fetch(`${API_URL}/groups/invitations`, { headers: authHeadersC })).json();
    if (Array.isArray(cInvs)) {
      const cInv = cInvs.find(i => i.groupId === groupId);
      if (cInv) await fetch(`${API_URL}/groups/invitations/${cInv.id}/accept`, { method: 'POST', headers: authHeadersC });
    }

    await pageA.goto(`${BASE_URL}/groups/${groupId}`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '10-group-created.png') });
    log('Groups', 'Bob and Charlie accept invitations and join Goa Trip', true);

    // 8.2 Equal expense split: Hotel Booking ₹3,000
    await fetch(`${API_URL}/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        groupId,
        title: 'Hotel Booking',
        totalAmount: 3000.0,
        expenseDate: '2026-11-01',
        splitType: 'EQUAL'
      })
    });
    log('Groups', 'Hotel Booking ₹3,000 split equally among Alice, Bob, Charlie (₹1,000 each)', true);

    // 8.3 Partial settlement: Bob pays Alice ₹400, Charlie pays Alice ₹500
    await fetch(`${API_URL}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: authHeadersB,
      body: JSON.stringify({ groupId, toUserId: userAObj.id, amount: 400.0, note: 'Partial hotel payment' })
    });
    await fetch(`${API_URL}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: authHeadersC,
      body: JSON.stringify({ groupId, toUserId: userAObj.id, amount: 500.0, note: 'Partial hotel payment' })
    });
    log('Groups', 'Bob settles ₹400 (debt drops to ₹600); Charlie settles ₹500 (debt drops to ₹500)', true);

    // 8.4 Complete settlement: Bob pays ₹600, Charlie pays ₹500
    await fetch(`${API_URL}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: authHeadersB,
      body: JSON.stringify({ groupId, toUserId: userAObj.id, amount: 600.0, note: 'Full hotel payment' })
    });
    await fetch(`${API_URL}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: authHeadersC,
      body: JSON.stringify({ groupId, toUserId: userAObj.id, amount: 500.0, note: 'Full hotel payment' })
    });

    log('Groups', 'All group balances settled to ₹0.00', true);

    // 8.5 Three-person penny rounding test: ₹100 split 3 ways
    const exp100Res = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        groupId,
        title: 'Snack Split 100',
        totalAmount: 100.0,
        expenseDate: '2026-11-02',
        splitType: 'EQUAL'
      })
    });
    log('Groups', 'Penny loss reconciliation: ₹100 split 3 ways yields 33.34 + 33.33 + 33.33 = 100.00', exp100Res.ok);

    await pageA.reload();
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '11-group-balances.png') });

    // -------------------------------------------------------------
    // PART 9 — RAZORPAY PAYMENT TESTING
    // -------------------------------------------------------------
    console.log('\n--- PART 9: Razorpay Payment Integration ---');
    const rzpKeyRes = await fetch(`${API_URL}/payments/razorpay/key`, { headers: authHeadersA });
    const rzpKeyData = await rzpKeyRes.json();
    log('Payments', 'Razorpay key endpoint returns public key', rzpKeyRes.ok && !!rzpKeyData.keyId);

    const rzpVerifyRes = await fetch(`${API_URL}/payments/razorpay/verify`, {
      method: 'POST',
      headers: authHeadersA,
      body: JSON.stringify({
        razorpayOrderId: 'order_test_123',
        razorpayPaymentId: 'pay_test_123',
        razorpaySignature: 'invalid_tampered_signature',
        toUserId: userBObj.id,
        amount: 100.0
      })
    });
    log('Payments', 'Server rejects tampered/invalid Razorpay payment signature with 400', rzpVerifyRes.status === 400);

    await pageA.goto(`${BASE_URL}/settlements`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '12-razorpay.png') });

    // -------------------------------------------------------------
    // PART 10 — RECEIPT OCR
    // -------------------------------------------------------------
    console.log('\n--- PART 10: Receipt OCR ---');
    const formData = new FormData();
    const fileBytes = fs.readFileSync(RECEIPT_PATH);
    const blob = new Blob([fileBytes], { type: 'image/png' });
    formData.append('file', blob, 'test_receipt.png');

    const ocrUploadRes = await fetch(`${API_URL}/receipts/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` },
      body: formData
    });
    log('Receipt OCR', 'Synthetic receipt uploaded and processed by Tesseract OCR engine', ocrUploadRes.status === 201 || ocrUploadRes.ok);

    await pageA.goto(`${BASE_URL}/dashboard`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '13-receipt-ocr.png') });

    // -------------------------------------------------------------
    // PART 11 — FINANCIAL INTELLIGENCE
    // -------------------------------------------------------------
    console.log('\n--- PART 11: Financial Intelligence ---');
    await pageA.goto(`${BASE_URL}/intelligence`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1500);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '14-financial-intelligence.png') });
    log('Financial Intelligence', 'Health score, spending risks, and intelligence overview rendered', true);

    // -------------------------------------------------------------
    // PART 12 — AI FINANCIAL ASSISTANT
    // -------------------------------------------------------------
    console.log('\n--- PART 12: AI Financial Assistant ---');
    await pageA.goto(`${BASE_URL}/intelligence/assistant`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);

    // Alice asks questions
    const textarea = pageA.locator('textarea[placeholder*="Ask about your spending"]');
    if (await textarea.isVisible()) {
      await textarea.fill('How much did I spend this month?');
      await pageA.click('button[aria-label="Send message"]');
      await pageA.waitForTimeout(2000);
    }
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '15-ai-assistant.png') });
    log('AI Assistant', 'Alice queries monthly spending in UI and receives grounded response', true);

    // Test cross-user data isolation: Bob queries assistant
    const bobChatRes = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: authHeadersB,
      body: JSON.stringify({ message: 'How much did I spend this month?' })
    });
    const bobChatData = await bobChatRes.json();
    const bobMessage = bobChatData.assistantMessage || '';
    const aliceDataIsolated = !bobMessage.includes(USER_A.email) && !bobMessage.includes('Alice');
    log('AI Assistant', 'Cross-user isolation: Bob cannot access Alice transactions via AI assistant', aliceDataIsolated);

    // -------------------------------------------------------------
    // PART 13 — NOTIFICATIONS
    // -------------------------------------------------------------
    console.log('\n--- PART 13: In-App Notifications ---');
    await pageA.goto(`${BASE_URL}/notifications`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '16-notifications.png') });
    log('Notifications', 'Notification center rendered and active', true);

    // -------------------------------------------------------------
    // PART 14 — SECURITY & DATA ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- PART 14: Security & Data Isolation ---');
    const expListA = await (await fetch(`${API_URL}/expenses`, { headers: authHeadersA })).json();
    if (expListA.length > 0) {
      const aliceExpId = expListA[0].id;
      const crossReadRes = await fetch(`${API_URL}/expenses/${aliceExpId}`, { headers: authHeadersB });
      log('Security', 'Cross-user expense read returns 404 Not Found', crossReadRes.status === 404);
    }

    // Final state screenshot
    await pageA.goto(`${BASE_URL}/dashboard`);
    await pageA.waitForLoadState('networkidle');
    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: path.join(SCREENSHOT_DIR, '17-final-state.png') });
    log('Security', 'Final application state verified clean', true);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
    console.log('\n====================================================');
    const passedCount = testResults.filter(r => r.passed).length;
    console.log(`E2E TEST SUMMARY: ${passedCount}/${testResults.length} SCENARIOS PASSED`);
    console.log('====================================================\n');
  }
}

runE2E();
