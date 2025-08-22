# Subscription Lock Implementation Guide

## Overview
This guide documents the comprehensive subscription locking mechanism implemented for the IELTS platform. The system uses UTC-4 timezone validation with real internet time to control access to premium content based on user subscription status.

## Architecture

### Core Components
1. **UTC-4 Timestamp Validation** - Uses real internet time converted to UTC-4
2. **Firebase User Data Integration** - Reads subscription data from user documents  
3. **Cache Management** - Automatic clearing and refresh on auth events
4. **Link-Level Locking** - Locks navigation links (not content pages)
5. **Subscription Modal Integration** - Redirects to existing subscription popup

### Data Flow
```
Sign In/Sign Up → Clear Cache → Get Real UTC-4 Time → Fetch Firebase Data → 
Validate Timestamps → Store Result → Apply Lock/Unlock → Navigation Check
```

## Firebase Data Structure

### User Document Fields Required:
```javascript
{
  "Subscription": "Y" | "N",                    // Subscription status
  "Date_Subscription_Start": FirebaseTimestamp, // Start time (UTC-4)  
  "Date_Subscription_End": FirebaseTimestamp,   // End time (UTC-4)
  // Other user fields...
}
```

### Stored Validation Result:
```javascript
localStorage['userSubscriptionData'] = {
  "subscription": "Y" | "N",
  "startDate": FirebaseTimestamp,
  "endDate": FirebaseTimestamp, 
  "isActive": boolean,
  "reason": string,
  "lastChecked": ISO8601String,
  "userId": string,
  "timezone": "UTC-4",
  "validationMethod": "UTC-4-timestamp-validation"
}
```

## Core Functions

### 1. UTC-4 Time Management

#### `getRealCurrentDateUTC4()`
```javascript
// Gets real current time from internet APIs and converts to UTC-4
// Fallback: converts system time to UTC-4 if APIs fail
// Returns: Date object in UTC-4 timezone
```

#### `convertCurrentTimeToUTC4(currentTime)`
```javascript  
// Converts any Date object to UTC-4 (subtracts 4 hours)
// Used for system time fallback
// Returns: Date object in UTC-4
```

### 2. Validation Logic

#### `validateUserSubscriptionWithUTC4(userData)`
```javascript
// Main validation function using UTC-4 timestamps
// Logic: 
//   1. Check Subscription = "Y"
//   2. Get current time in UTC-4
//   3. Parse Firebase timestamps (already UTC-4)
//   4. Compare: currentUTC4 >= startUTC4 && currentUTC4 <= endUTC4
//   5. Return: {isActive: boolean, reason: string, timezone: "UTC-4"}
```

### 3. Authentication Integration

#### `checkAndStoreUserSubscription(userId)`
```javascript
// Called automatically on sign-in/sign-up
// Process:
//   1. Clear cached subscription data
//   2. Get real UTC-4 time
//   3. Fetch user data from Firebase
//   4. Validate using UTC-4 timestamps
//   5. Store result in localStorage
```

### 4. Cache Management

#### Automatic Cache Clearing:
- **Sign-out**: `localStorage.clear()` + `sessionStorage.clear()`
- **Sign-in**: `localStorage.removeItem('userSubscriptionData')` before validation
- **Sign-up**: `localStorage.removeItem('userSubscriptionData')` before validation

### 5. Link-Level Locking

#### Implementation on Introduction Pages:
```html
<!-- Practice link with lock capability -->
<a href="practice-page.html" 
   id="practice2Link" 
   onclick="handlePractice2Click(event)"
   class="practice-item">
   <span class="practice-text">Practice 2</span>
   <span class="lock-badge" id="practice2Lock">🔒</span>
</a>
```

#### CSS for Lock States:
```css
.practice-item.locked {
    color: #999;
    cursor: not-allowed;
}

.lock-badge {
    color: #ff6b6b;
    font-size: 0.8em;
    margin-left: 8px;
}

.lock-badge.hidden {
    display: none;
}
```

#### JavaScript Lock Functions:
```javascript
function checkUserSubscription() {
    const subscriptionData = JSON.parse(localStorage.getItem('userSubscriptionData') || '{}');
    
    if (subscriptionData.isActive) {
        unlockPractice2();
    } else {
        lockPractice2();
    }
}

function lockPractice2() {
    const link = document.getElementById('practice2Link');
    const badge = document.getElementById('practice2Lock');
    
    link.classList.add('locked');
    link.removeAttribute('href');
    badge.classList.remove('hidden');
}

function unlockPractice2() {
    const link = document.getElementById('practice2Link');
    const badge = document.getElementById('practice2Lock');
    
    link.classList.remove('locked');
    link.setAttribute('href', 'IELTS_G_Listening_Part1_Practice2.html');
    badge.classList.add('hidden');
}

function handlePractice2Click(event) {
    const link = event.currentTarget;
    if (link.classList.contains('locked')) {
        event.preventDefault();
        openSubscriptionModal(); // Redirect to main index with subscription popup
    }
}

function openSubscriptionModal() {
    window.location.href = '../../index.html?openSubscription=true';
}
```

## Implementation Steps for New Practices

### Step 1: Add Lock Elements to Introduction Page
```html
<!-- Update practice link -->
<a href="practice-page.html" 
   id="practiceXLink" 
   onclick="handlePracticeXClick(event)"
   class="practice-item">
   <span class="practice-text">Practice X</span>
   <span class="lock-badge" id="practiceXLock">🔒</span>
</a>
```

### Step 2: Add CSS Styles
```css
.practice-item.locked {
    color: #999;
    cursor: not-allowed;
}
.lock-badge {
    color: #ff6b6b;
    font-size: 0.8em;
    margin-left: 8px;
}
.lock-badge.hidden {
    display: none;
}
```

### Step 3: Add Firebase Integration
```html
<!-- Add before closing </body> -->
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>
<script src="../../Reference-Lookup/IELTS-Firebase-Integration.js"></script>
```

### Step 4: Add JavaScript Functions
```javascript
function checkUserSubscription() {
    const subscriptionData = JSON.parse(localStorage.getItem('userSubscriptionData') || '{}');
    console.log('🔍 Checking subscription for Practice X:', subscriptionData);
    
    if (subscriptionData.isActive) {
        unlockPracticeX();
    } else {
        lockPracticeX();
    }
}

function lockPracticeX() {
    const link = document.getElementById('practiceXLink');
    const badge = document.getElementById('practiceXLock');
    
    if (link && badge) {
        link.classList.add('locked');
        link.removeAttribute('href');
        badge.classList.remove('hidden');
        console.log('🔒 Practice X locked');
    }
}

function unlockPracticeX() {
    const link = document.getElementById('practiceXLink');
    const badge = document.getElementById('practiceXLock');
    
    if (link && badge) {
        link.classList.remove('locked');
        link.setAttribute('href', 'practice-page-filename.html');
        badge.classList.add('hidden');
        console.log('🔓 Practice X unlocked');
    }
}

function handlePracticeXClick(event) {
    const link = event.currentTarget;
    if (link.classList.contains('locked')) {
        event.preventDefault();
        console.log('🔒 Locked practice clicked, opening subscription modal');
        openSubscriptionModal();
    }
}

function openSubscriptionModal() {
    window.location.href = '../../index.html?openSubscription=true';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkUserSubscription, 500);
    setTimeout(checkUserSubscription, 2000);
    setTimeout(checkUserSubscription, 5000);
});

// Re-check when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(checkUserSubscription, 100);
    }
});

window.addEventListener('focus', function() {
    setTimeout(checkUserSubscription, 100);
});
```

## Validation Logic Details

### UTC-4 Timestamp Validation Process:
1. **Get Real Time**: Fetch current time from `worldtimeapi.org/api/timezone/America/New_York`
2. **Parse Firebase**: Convert Firebase Timestamp to JavaScript Date (already UTC-4)
3. **Compare**: Direct timestamp comparison with millisecond precision
4. **Validate**: Current UTC-4 >= Start UTC-4 AND Current UTC-4 <= End UTC-4
5. **Result**: Active if in range AND Subscription = "Y"

### Validation States:
- **Active**: `Subscription = "Y"` AND current UTC-4 time is between start/end
- **Not Started**: `Subscription = "Y"` BUT current UTC-4 time < start time  
- **Expired**: `Subscription = "Y"` BUT current UTC-4 time > end time
- **Not Subscribed**: `Subscription = "N"`

## Error Handling

### Time API Failures:
```javascript
// Fallback hierarchy:
1. worldtimeapi.org (America/New_York) - Direct UTC-4
2. System time converted to UTC-4 (systemTime - 4 hours)
3. Warning logged if using system time
```

### Firebase Failures:
```javascript
// Default locked state stored:
{
  isActive: false,
  reason: "Error fetching data" | "User document not found",
  timezone: "UTC-4"
}
```

## Testing Functions

### Manual Testing:
```javascript
// Available in console on any page with implementation:
checkUserSubscription()     // Check current subscription status
lockPracticeX()            // Manually lock practice  
unlockPracticeX()          // Manually unlock practice
```

### Debug Functions (IELTS/index.html):
```javascript
fixWithUTC4()              // Force UTC-4 validation and store result
checkStoredData()          // View current localStorage data
forceImmediateValidation() // Clear cache and re-validate
```

## Integration with Main Index

### URL Parameter Handling:
```javascript
// In IELTS/index.html DOMContentLoaded:
function checkSubscriptionParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openSubscription') === 'true') {
        setTimeout(() => {
            showPremiumModal();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 500);
    }
}
```

## Files Modified/Created

### Core Files:
- `IELTS/index.html` - Main authentication and validation logic
- `IELTS/General/listening/IELTS_General_Listening_Introduction.html` - Practice 2 lock implementation

### Key Functions Added:
- `getRealCurrentDateUTC4()` - Internet time in UTC-4
- `validateUserSubscriptionWithUTC4()` - UTC-4 timestamp validation  
- `checkAndStoreUserSubscription()` - Auto-validation on auth
- `checkUserSubscription()` - Check stored subscription status
- `handlePractice2Click()` - Lock click handler
- `openSubscriptionModal()` - Redirect to subscription popup

## Security Considerations

### Data Validation:
- Always validate Firebase Timestamp objects exist
- Handle missing user documents gracefully
- Provide locked state as default fallback
- Clear sensitive data on sign-out

### Time Security:
- Use real internet time (not system clock)
- Multiple API fallbacks for reliability
- UTC-4 timezone consistency
- Millisecond precision for accuracy

## Future Implementation Checklist

For each new practice to be locked:

- [ ] Add lock elements to introduction page HTML
- [ ] Add CSS styles for locked state
- [ ] Add Firebase script includes
- [ ] Implement checkUserSubscription() function
- [ ] Add lock/unlock functions
- [ ] Add click handler for locked links
- [ ] Add DOMContentLoaded initialization
- [ ] Add visibility change listeners
- [ ] Test lock/unlock functionality
- [ ] Test subscription modal integration

## Common Issues and Solutions

### Issue: Functions not defined in console
**Solution**: Refresh page after code changes, functions load on DOMContentLoaded

### Issue: Old cached validation results
**Solution**: Cache automatically cleared on sign-in/sign-up/sign-out

### Issue: System date incorrect
**Solution**: Use `getRealCurrentDateUTC4()` to get internet time

### Issue: Firebase permissions
**Solution**: Ensure user document exists in 'users' collection

### Issue: Time API failures  
**Solution**: Multiple API fallbacks implemented with system time UTC-4 conversion

## Example Implementation

See `IELTS/General/listening/IELTS_General_Listening_Introduction.html` for complete working example of Practice 2 lock implementation. 