# 🔒 **CONTENT LOCKING/UNLOCKING STRATEGY**
## **Universal Blueprint for Premium Content Access Control**

---

## 🎯 **OVERVIEW**

This document provides a comprehensive strategy for implementing content locking/unlocking mechanisms across all IELTS practices and topics. It's based on the proven Practice 2 implementation and can be universally applied.

**Core Principle**: Content is locked by default for non-subscribers and dynamically unlocked based on subscription status validation.

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **📊 Data Flow:**
```
User Authentication → Subscription Validation → localStorage Storage → Content Lock/Unlock → UI Update
```

### **🔄 Validation Triggers:**
1. **Page Load** (DOM ready)
2. **Page Focus** (window focus event)
3. **Page Visibility** (tab becomes visible)
4. **Multiple Retry Attempts** (1s, 3s, 5s intervals)
5. **Navigation Return** (from other pages)

---

## 📋 **IMPLEMENTATION COMPONENTS**

### **1. HTML STRUCTURE**

#### **🎯 Required Elements:**
```html
<!-- Premium Content Link with Lock Mechanism -->
<a href="TARGET_PAGE.html" class="practice-item" id="CONTENT_ID_Link" onclick="handleCONTENT_IDClick(event)">
    <span class="practice-text">CONTENT_NAME</span>
    <span class="lock-badge" id="CONTENT_ID_Lock">🔒</span>
</a>
```

#### **🔧 Element Specifications:**
- **Main Link**: `id="CONTENT_ID_Link"` (unique identifier for each content)
- **Lock Badge**: `id="CONTENT_ID_Lock"` (shows 🔒 when locked)
- **Click Handler**: `onclick="handleCONTENT_IDClick(event)"` (controls access)
- **CSS Classes**: `practice-item` (base styling), `locked` (added when locked)

### **2. CSS STYLING**

#### **🎨 Base Styling:**
```css
.practice-item {
    display: block;
    padding: 0.6rem 1rem;
    margin: 0.3rem 0;
    background: rgba(139, 69, 19, 0.05);
    border-radius: 6px;
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;
    border-left: 3px solid #d4af37;
    cursor: pointer;
    position: relative;
}

.practice-item:hover {
    background: rgba(139, 69, 19, 0.15);
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
}
```

#### **🔒 Locked State Styling:**
```css
.practice-item.locked {
    background: rgba(220, 53, 69, 0.08);
    border-left-color: #dc3545;
    color: #666;
    cursor: pointer;
    opacity: 0.7;
}

.practice-item.locked:hover {
    background: rgba(220, 53, 69, 0.12);
    transform: translateX(5px);                      /* Same animation as unlocked */
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.15); /* Red-themed shadow */
    border-left-color: #dc3545;
}

.lock-badge {
    display: none;                                   /* Hidden by default */
    font-size: 0.8rem;
    margin-left: 0.5rem;
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}
```

### **3. JAVASCRIPT IMPLEMENTATION**

#### **🔍 Subscription Checking Logic:**
```javascript
function checkUserSubscription() {
    console.log('🔍 Checking user subscription using stored data...');
    console.log('🔍 Current auth state:', typeof auth !== 'undefined' ? 
        (auth.currentUser ? 'Authenticated: ' + auth.currentUser.uid : 'Not authenticated') : 'Auth not ready');
    
    try {
        // Get stored subscription data from localStorage (works regardless of auth state)
        const subscriptionData = localStorage.getItem('userSubscriptionData');
        console.log('📋 Raw localStorage data:', subscriptionData);
        
        if (subscriptionData) {
            const data = JSON.parse(subscriptionData);
            console.log('📋 Parsed subscription data:', {
                subscription: data.subscription,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: data.isActive,
                reason: data.reason,
                lastChecked: data.lastChecked,
                userId: data.userId
            });
            
            if (data.isActive === true) {
                console.log('🎉 SUBSCRIPTION IS ACTIVE - UNLOCKING CONTENT');
                unlockContent();
            } else {
                console.log('❌ Subscription NOT active - LOCKING CONTENT');
                console.log('🔍 Lock reason:', data.reason || 'isActive = false');
                lockContent();
            }
        } else {
            console.log('❌ No subscription data found in localStorage - LOCKING CONTENT');
            
            // Check if user is authenticated but no data
            if (typeof auth !== 'undefined' && auth.currentUser) {
                console.log('⚠️ User authenticated but no subscription data - may need to refresh');
                console.log('💡 Try: forceRefreshSubscription() on main page and navigate back');
            }
            
            lockContent();
        }
        
    } catch (error) {
        console.error('❌ Error checking stored subscription data:', error);
        console.log('🔧 Defaulting to LOCKED due to error');
        lockContent();
    }
}
```

#### **🔒 Lock Content Function:**
```javascript
function lockContent() {
    console.log('🔒 Attempting to lock content...');
    
    const contentLink = document.getElementById('CONTENT_ID_Link');
    const lockBadge = document.getElementById('CONTENT_ID_Lock');
    
    console.log('🔍 Elements found:', {
        contentLink: contentLink ? 'Found' : 'NOT FOUND',
        lockBadge: lockBadge ? 'Found' : 'NOT FOUND'
    });
    
    if (contentLink && lockBadge) {
        // Apply locked styling
        contentLink.classList.add('locked');
        contentLink.removeAttribute('href');
        lockBadge.style.display = 'inline-block';
        
        console.log('🔒 Content LOCKED successfully');
        console.log('🔍 Link classes after lock:', contentLink.className);
        console.log('🔍 Lock badge display:', lockBadge.style.display);
    } else {
        console.error('❌ Could not lock - elements missing!');
    }
}
```

#### **✅ Unlock Content Function:**
```javascript
function unlockContent() {
    console.log('✅ Attempting to unlock content...');
    
    const contentLink = document.getElementById('CONTENT_ID_Link');
    const lockBadge = document.getElementById('CONTENT_ID_Lock');
    
    console.log('🔍 Elements found:', {
        contentLink: contentLink ? 'Found' : 'NOT FOUND',
        lockBadge: lockBadge ? 'Found' : 'NOT FOUND'
    });
    
    if (contentLink && lockBadge) {
        // Remove locked styling and restore functionality
        contentLink.classList.remove('locked');
        contentLink.setAttribute('href', 'TARGET_PAGE.html');
        lockBadge.style.display = 'none';
        
        console.log('✅ Content UNLOCKED successfully');
        console.log('🔍 Link classes after unlock:', contentLink.className);
        console.log('🔍 Lock badge display:', lockBadge.style.display);
    } else {
        console.error('❌ Could not unlock - elements missing!');
    }
}
```

#### **🎯 Click Handler Function:**
```javascript
function handleContentClick(event) {
    const contentLink = document.getElementById('CONTENT_ID_Link');
    
    if (contentLink.classList.contains('locked')) {
        event.preventDefault();
        console.log('🔒 Blocked access to locked content - opening subscription modal');
        openSubscriptionModal();
        return false;
    }
    
    console.log('✅ Allowing access to content');
    return true;
}
```

#### **💳 Subscription Modal Redirect:**
```javascript
function openSubscriptionModal() {
    console.log('💳 Redirecting to main page for subscription...');
    
    // Navigate to main IELTS page with parameter to open subscription modal
    window.location.href = '../../index.html?openSubscription=true';
}
```

### **🏦 CURRENCY HANDLING FOR SUBSCRIPTION REDIRECTS**

#### **⚠️ Critical Issue: Currency Display Fix**
**Problem**: When users click locked content and get redirected to subscription modal, the form initially shows hardcoded "CAD" prices before updating to user's local currency. This creates a poor user experience with currency "flashing."

#### **💡 Solution: Dual Currency Update System**
Implement currency updates in BOTH the redirect handler AND modal opener to ensure immediate correct currency display.

#### **🔧 Implementation in Main Index File:**

##### **1. Enhanced Subscription Parameter Handler:**
```javascript
// Check for subscription modal parameter in URL
function checkSubscriptionParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openSubscription') === 'true') {
        console.log('🔗 Opening subscription modal from URL parameter (locked practice redirect)...');
        
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
            showPremiumModal();
            
            // Update currency for authenticated users (fix CAD currency issue)
            const isAuthenticated = localStorage.getItem('userAuthenticated');
            if (isAuthenticated === 'true') {
                console.log('💱 Updating currency for authenticated user from locked practice redirect...');
                setTimeout(async () => {
                    try {
                        await updatePlanPricesForUserCurrency();
                        console.log('✅ Currency updated successfully for locked practice redirect');
                    } catch (error) {
                        console.error('❌ Error updating currency for locked practice redirect:', error);
                    }
                }, 1000); // Allow time for Firebase to be ready
            } else {
                console.log('👤 User not authenticated - keeping default CAD currency');
            }
            
            // Clean up URL parameter
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }, 500);
    }
}
```

##### **2. Enhanced Premium Modal Opener:**
```javascript
function showPremiumModal() {
    document.getElementById('premiumModal').classList.add('show');
    
    // ... existing modal setup code ...
    
    // Update currency for authenticated users (ensures correct currency display)
    const isAuthenticated = localStorage.getItem('userAuthenticated');
    if (isAuthenticated === 'true') {
        console.log('💱 Ensuring correct currency display for authenticated user...');
        setTimeout(async () => {
            try {
                await updatePlanPricesForUserCurrency();
                console.log('✅ Currency display updated successfully');
            } catch (error) {
                console.log('⚠️ Currency update failed (will retry):', error.message);
                // Retry once after additional delay
                setTimeout(async () => {
                    try {
                        await updatePlanPricesForUserCurrency();
                        console.log('✅ Currency display updated on retry');
                    } catch (retryError) {
                        console.error('❌ Currency update failed on retry:', retryError);
                    }
                }, 2000);
            }
        }, 800); // Allow time for modal to fully render and Firebase to be ready
    }
    
    console.log('💡 Select a subscription plan to proceed with payment');
}
```

#### **🛡️ Dual Protection System Benefits:**
- **First Update**: Redirect handler calls currency update (1000ms delay)
- **Second Update**: Modal opener calls currency update (800ms delay)
- **Retry Logic**: Automatic retry if first attempt fails (2000ms delay)
- **Result**: Immediate correct currency display with robust error handling

#### **📊 Currency Support Coverage:**
This system ensures proper currency display for all supported regions:
- 🇺🇸 **USA**: USD | 🇮🇳 **India**: INR | 🇬🇧 **UK**: GBP | 🇪🇺 **Europe**: EUR
- 🇦🇺 **Australia**: AUD | 🇨🇦 **Canada**: CAD | 🇯🇵 **Japan**: JPY
- **And 20+ additional countries with live exchange rates**

#### **✅ Implementation Checklist:**
- [ ] Add enhanced `checkSubscriptionParameter()` function to main index
- [ ] Add enhanced `showPremiumModal()` function to main index  
- [ ] Ensure `updatePlanPricesForUserCurrency()` function exists
- [ ] Test currency display from locked practice redirects
- [ ] Verify retry logic works for slow Firebase connections
- [ ] Confirm consistent currency across all modal access methods

### **4. EVENT LISTENERS & TRIGGERS**

#### **📱 Page Load Events:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Page loaded - starting subscription checks...');
    
    // Immediate check
    checkUserSubscription();
    
    // Retry after 1 second (ensure Firebase is ready)
    setTimeout(() => {
        console.log('🚀 Secondary subscription check (attempt 2)...');
        checkUserSubscription();
    }, 1000);
    
    // Final retry after 3 seconds (ensure all systems ready)
    setTimeout(() => {
        console.log('🚀 Tertiary subscription check (attempt 3)...');
        checkUserSubscription();
    }, 3000);
    
    // Final check after 5 seconds (ultimate fallback)
    setTimeout(() => {
        console.log('🚀 Final subscription check (attempt 4)...');
        checkUserSubscription();
    }, 5000);
});
```

#### **🔄 Navigation & Focus Events:**
```javascript
// Check when page becomes visible (user navigates back)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('📖 Page became visible - checking subscription again...');
        setTimeout(checkUserSubscription, 1000);
    }
});

// Check when window gains focus
window.addEventListener('focus', function() {
    console.log('🎯 Window gained focus - checking subscription...');
    setTimeout(checkUserSubscription, 500);
});
```

### **5. TESTING & DEBUG FUNCTIONS**

#### **🧪 Manual Testing Functions:**
```javascript
// Manual lock/unlock testing
window.testLockCONTENT_ID = function() {
    console.log('🧪 Manual test: LOCKING content');
    lockContent();
};

window.testUnlockCONTENT_ID = function() {
    console.log('🧪 Manual test: UNLOCKING content');
    unlockContent();
};

// Manual subscription check
window.manualSubscriptionCheck = function() {
    console.log('🧪 Manual subscription check triggered (using stored data)');
    checkUserSubscription();
};

// View current subscription data
window.viewStoredSubscriptionData = function() {
    const data = localStorage.getItem('userSubscriptionData');
    if (data) {
        console.log('📋 Current stored subscription data:', JSON.parse(data));
    } else {
        console.log('❌ No subscription data found in localStorage');
    }
};

// Simulate subscription data for testing
window.simulateSubscriptionData = function(isActive) {
    const testData = {
        subscription: isActive ? 'Y' : 'N',
        isActive: isActive,
        reason: isActive ? 'Active subscription' : 'Test inactive state',
        lastChecked: new Date().toISOString(),
        userId: 'test_user'
    };
    
    localStorage.setItem('userSubscriptionData', JSON.stringify(testData));
    console.log('🧪 Test subscription data set:', testData);
    checkUserSubscription();
};

// Test subscription redirect
window.testSubscriptionRedirect = function() {
    console.log('🧪 Testing subscription redirect...');
    openSubscriptionModal();
};
```

---

## 📝 **IMPLEMENTATION TEMPLATE**

### **🎯 Step-by-Step Implementation:**

#### **Step 1: HTML Structure**
```html
<!-- Replace PLACEHOLDERS with actual values -->
<a href="TARGET_PAGE.html" class="practice-item" id="CONTENT_ID_Link" onclick="handleCONTENT_IDClick(event)">
    <span class="practice-text">CONTENT_NAME</span>
    <span class="lock-badge" id="CONTENT_ID_Lock">🔒</span>
</a>

<!-- EXAMPLES:
Practice 3: id="practice3Link", onclick="handlePractice3Click(event)"
Part 2 Practice 1: id="part2Practice1Link", onclick="handlePart2Practice1Click(event)"
Reading Section 1: id="readingSection1Link", onclick="handleReadingSection1Click(event)"
-->
```

#### **Step 2: CSS Integration**
```css
/* Add these styles to your page (copy from base implementation) */
.practice-item { /* ... base styles ... */ }
.practice-item:hover { /* ... hover animation ... */ }
.practice-item.locked { /* ... locked styling ... */ }
.practice-item.locked:hover { /* ... locked hover animation ... */ }
.lock-badge { /* ... lock badge styling ... */ }
```

#### **Step 3: JavaScript Functions**
```javascript
// Replace CONTENT_ID with your actual content identifier
function checkUserSubscription() { /* ... subscription checking logic ... */ }
function lockCONTENT_ID() { /* ... lock function ... */ }
function unlockCONTENT_ID() { /* ... unlock function ... */ }
function handleCONTENT_IDClick(event) { /* ... click handler ... */ }
function openSubscriptionModal() { /* ... modal redirect ... */ }
```

#### **Step 4: Event Listeners**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Multiple subscription checks with delays
    checkUserSubscription();
    setTimeout(checkUserSubscription, 1000);
    setTimeout(checkUserSubscription, 3000);
    setTimeout(checkUserSubscription, 5000);
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(checkUserSubscription, 1000);
    }
});

window.addEventListener('focus', function() {
    setTimeout(checkUserSubscription, 500);
});
```

#### **Step 5: Debug Functions**
```javascript
// Testing functions for console debugging
window.testLockCONTENT_ID = function() { /* ... */ };
window.testUnlockCONTENT_ID = function() { /* ... */ };
window.manualSubscriptionCheck = function() { /* ... */ };
window.viewStoredSubscriptionData = function() { /* ... */ };
window.simulateSubscriptionData = function(isActive) { /* ... */ };
```

---

## 🔧 **CONFIGURATION VARIABLES**

### **📋 Customizable Elements:**
```javascript
// Configuration object for easy customization
const CONTENT_LOCK_CONFIG = {
    // Content identification
    CONTENT_ID: 'practice2',                                    // Unique identifier
    CONTENT_NAME: 'Practice 2',                                 // Display name
    TARGET_PAGE: 'IELTS_G_Listening_Part1_Practice2.html',    // Destination URL
    
    // UI elements
    LINK_ID: 'practice2Link',                                   // Main link element ID
    LOCK_ID: 'practice2Lock',                                   // Lock badge element ID
    
    // Redirect settings
    SUBSCRIPTION_PAGE: '../../index.html?openSubscription=true', // Subscription modal URL
    
    // Timing settings
    CHECK_DELAYS: [0, 1000, 3000, 5000],                      // Subscription check delays (ms)
    FOCUS_DELAY: 500,                                          // Focus event delay (ms)
    VISIBILITY_DELAY: 1000,                                    // Visibility change delay (ms)
    
    // Debug settings
    DEBUG_MODE: true,                                          // Enable console logging
    TEST_FUNCTIONS: true                                       // Enable testing functions
};
```

---

## 🌍 **UNIVERSAL APPLICATION EXAMPLES**

### **📚 Different Content Types:**

#### **🎧 Listening Practices:**
```javascript
// Part 1 Practice 3
CONTENT_ID: 'part1Practice3'
TARGET_PAGE: 'IELTS_G_Listening_Part1_Practice3.html'

// Part 2 Practice 1  
CONTENT_ID: 'part2Practice1'
TARGET_PAGE: 'IELTS_G_Listening_Part2_Practice1.html'
```

#### **📖 Reading Sections:**
```javascript
// Academic Reading Passage 2
CONTENT_ID: 'academicReading2'
TARGET_PAGE: 'IELTS_Academic_Reading_Passage2_Practice1.html'

// General Reading Section 2
CONTENT_ID: 'generalReading2'
TARGET_PAGE: 'IELTS_G_Reading_Section2_Practice1.html'
```

#### **✍️ Writing Tasks:**
```javascript
// Academic Writing Task 2
CONTENT_ID: 'academicWriting2'
TARGET_PAGE: 'IELTS_Academic_Writing_Task2_Practice1.html'

// General Writing Task 1
CONTENT_ID: 'generalWriting1'
TARGET_PAGE: 'IELTS_General_Writing_Task1_Practice1.html'
```

#### **🗣️ Speaking Parts:**
```javascript
// Academic Speaking Part 2
CONTENT_ID: 'academicSpeaking2'
TARGET_PAGE: 'IELTS_Academic_Speaking_Part2_Practice1.html'
```

### **🏗️ Multiple Content Implementation:**
```html
<!-- Multiple locked content on same page -->
<div class="practice-section">
    <!-- Practice 2 - LOCKED -->
    <a href="#" class="practice-item" id="practice2Link" onclick="handlePractice2Click(event)">
        <span class="practice-text">Practice 2</span>
        <span class="lock-badge" id="practice2Lock">🔒</span>
    </a>
    
    <!-- Practice 3 - LOCKED -->
    <a href="#" class="practice-item" id="practice3Link" onclick="handlePractice3Click(event)">
        <span class="practice-text">Practice 3</span>
        <span class="lock-badge" id="practice3Lock">🔒</span>
    </a>
    
    <!-- Practice 4 - LOCKED -->
    <a href="#" class="practice-item" id="practice4Link" onclick="handlePractice4Click(event)">
        <span class="practice-text">Practice 4</span>
        <span class="lock-badge" id="practice4Lock">🔒</span>
    </a>
</div>

<script>
// Single subscription check unlocks ALL content
function checkUserSubscription() {
    // ... subscription checking logic ...
    
    if (data.isActive === true) {
        unlockPractice2();
        unlockPractice3();
        unlockPractice4();
        // ... unlock all premium content
    } else {
        lockPractice2();
        lockPractice3();
        lockPractice4();
        // ... lock all premium content
    }
}
</script>
```

---

## ✅ **QUALITY ASSURANCE CHECKLIST**

### **🧪 Testing Requirements:**

#### **✅ Functional Testing:**
- [ ] Content locks correctly when no subscription
- [ ] Content unlocks correctly with active subscription
- [ ] Lock badge appears/disappears appropriately  
- [ ] Click handler prevents/allows access correctly
- [ ] Subscription modal opens on locked content click
- [ ] Styling applies correctly (locked/unlocked states)
- [ ] Hover animations work for both states

#### **✅ Event Testing:**
- [ ] Page load triggers subscription check
- [ ] Page focus triggers subscription check
- [ ] Page visibility change triggers subscription check
- [ ] Multiple retry attempts work correctly
- [ ] Navigation from other pages refreshes status

#### **✅ Edge Case Testing:**
- [ ] Missing localStorage data handled gracefully
- [ ] Corrupted subscription data handled gracefully
- [ ] Missing DOM elements don't break functionality
- [ ] Authentication state changes handled correctly
- [ ] Network failures don't break locking mechanism

#### **🏦 Currency Display Testing:**
- [ ] Locked content redirect shows correct currency immediately (no CAD flash)
- [ ] Currency updates work for all supported countries (USD, INR, GBP, EUR, etc.)
- [ ] Retry logic works when Firebase is slow to respond
- [ ] Currency display consistent between normal and locked practice access
- [ ] Unauthenticated users see default CAD currency correctly
- [ ] Authentication state changes trigger currency updates
- [ ] Multiple modal opens/closes maintain correct currency

#### **✅ Debug Testing:**
- [ ] Console logging provides clear information
- [ ] Manual testing functions work correctly
- [ ] Subscription data simulation works
- [ ] Debug functions available in console

### **🔍 Validation Criteria:**
```javascript
// Validation checklist for each implementation
const VALIDATION_CHECKLIST = {
    htmlStructure: {
        linkElement: 'Has unique ID and onclick handler',
        lockBadge: 'Has unique ID and hidden by default',
        practiceText: 'Clear content description'
    },
    
    cssImplementation: {
        baseStyles: 'practice-item class properly styled',
        lockedStyles: 'locked class applies red theme',
        hoverAnimation: 'Both states have translateX(5px) animation',
        lockBadge: 'Badge properly styled and positioned'
    },
    
    javascriptFunctions: {
        subscriptionCheck: 'Reads localStorage subscription data',
        lockFunction: 'Adds locked class and removes href',
        unlockFunction: 'Removes locked class and restores href',
        clickHandler: 'Prevents access when locked',
        modalRedirect: 'Opens subscription modal correctly'
    },
    
    eventHandlers: {
        domReady: 'Multiple checks with proper delays',
        focusEvent: 'Triggers on window focus',
        visibilityEvent: 'Triggers on page visibility change'
    },
    
    debugging: {
        consoleLogging: 'Clear, detailed status messages',
        testingFunctions: 'Manual override functions available',
        errorHandling: 'Graceful failure handling'
    }
};
```

---

## 🚀 **DEPLOYMENT GUIDELINES**

### **📋 Pre-Deployment Checklist:**
1. ✅ **Content Identification**: Unique IDs for all elements
2. ✅ **CSS Integration**: All required styles included
3. ✅ **JavaScript Functions**: All functions properly named
4. ✅ **Event Listeners**: All triggers properly configured
5. ✅ **Testing Functions**: Debug capabilities enabled
6. ✅ **Error Handling**: Graceful failure scenarios
7. ✅ **Console Logging**: Clear status messages
8. ✅ **Performance**: Multiple checks don't impact page speed

### **🔧 Post-Deployment Validation:**
1. **Load Testing**: Check all subscription scenarios
2. **Navigation Testing**: Test from various entry points  
3. **Refresh Testing**: Verify page refresh behavior
4. **Focus Testing**: Test tab switching scenarios
5. **Modal Testing**: Verify subscription redirect works
6. **Currency Testing**: Confirm correct currency display from locked practice redirects
7. **Animation Testing**: Confirm hover effects work
8. **Debug Testing**: Ensure console functions available

---

## ✅ **SUMMARY**

This strategy provides a **complete, battle-tested blueprint** for implementing content locking/unlocking across your entire IELTS platform. 

**Key Benefits:**
- ✅ **Proven Implementation**: Based on working Practice 2 system
- ✅ **Universal Application**: Works for any content type
- ✅ **Robust Validation**: Multiple check triggers ensure reliability
- ✅ **Professional UX**: Smooth animations and clear visual feedback
- ✅ **Currency Handling**: Automatic currency display for 20+ countries
- ✅ **Seamless Subscription Flow**: No currency flashing or display issues
- ✅ **Debug Capabilities**: Comprehensive testing and debugging tools
- ✅ **Error Resilience**: Graceful handling of edge cases with retry logic
- ✅ **Performance Optimized**: Efficient localStorage-based checking

**Ready for use across:**
- 🎧 All Listening practices and parts
- 📖 All Reading sections and passages  
- ✍️ All Writing tasks and practices
- 🗣️ All Speaking parts and topics
- 📚 Any future premium content

**Simply replace the template placeholders with your specific content details, and you have a fully functional premium content access control system!** 🔒✨ 