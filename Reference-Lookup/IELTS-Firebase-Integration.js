// IELTS-Practice Firebase Integration - Complete Implementation
// 🔥 LIVE Firebase Integration with ALL Features

// Firebase Configuration (YOUR ACTUAL PROJECT)
const firebaseConfig = {
  apiKey: "AIzaSyAyZxV0VeZhBnV1azR6D6rJR7aMCeQ_zqU",
  authDomain: "ielts-practice-acd24.firebaseapp.com",
  projectId: "ielts-practice-acd24",
  storageBucket: "ielts-practice-acd24.firebasestorage.app",
  messagingSenderId: "1002576090829",
  appId: "1:1002576090829:web:8829da811fa5669b5c7b84"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log('🔥 Firebase initialized for IELTS-Practice project!');

// Usage tracking for free tier monitoring
let readCount = 0;
let writeCount = 0;

function trackRead() { readCount++; }
function trackWrite() { writeCount++; }

// ============================================================================
// 🎯 USER AUTHENTICATION & COMPREHENSIVE DATA CAPTURE
// ============================================================================

// Generate unique 8-digit user ID
function generateUniqueUserId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Generate 8-character referral code
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate user coupon (email prefix + hour+minute)
function generateUserCoupon(email, signupDateTime) {
    const emailPrefix = email.split('@')[0].substring(0, 4).toLowerCase();
    const date = new Date(signupDateTime);
    const hourMin = date.getHours().toString().padStart(2, '0') + 
                   date.getMinutes().toString().padStart(2, '0');
    return emailPrefix + hourMin;
}

// Method 1: Get current location information (silent, no user permission required)
async function getCurrentLocation() {
    console.log('🌍 Getting location silently (no permission prompts)...');
    
    // Try multiple SILENT location sources simultaneously for best results
    const locationPromises = [];
    
    // 1. Try IP-based location (always works silently)
    locationPromises.push(getLocationFromIP());
    
    // 3. Try browser timezone location
    locationPromises.push(getLocationFromTimezone());
    
    // 4. Try network-based location
    locationPromises.push(getLocationFromNetwork());
    
    try {
        // Wait for all methods, use the best available result
        const results = await Promise.allSettled(locationPromises);
        
        // Prioritize results: IP > Timezone > Network (no GPS to avoid permissions)
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value && result.value.type !== 'failed') {
                console.log(`📍 Silent location acquired via ${result.value.source || result.value.type}`);
                return result.value;
            }
        }
        
        // If all methods fail, return basic info
        return {
            type: 'minimal',
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: new Date().toISOString(),
            source: 'browser_basic',
            note: 'Limited location data available'
        };
        
    } catch (error) {
        console.warn('All location methods failed:', error);
        return {
            type: 'error',
            error: 'All location detection methods failed',
            timestamp: new Date().toISOString(),
            source: 'fallback'
        };
    }
}

// Method 2: Get location from IP (multiple services for reliability)
async function getLocationFromIP() {
    const ipServices = [
        {
            url: 'https://ipapi.co/json/',
            parser: (data) => ({
                type: 'ip_based',
                city: data.city,
                region: data.region,
                country: data.country_name,
                country_code: data.country_code,
                ip: data.ip,
                timezone: data.timezone,
                postal: data.postal,
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: 'city_level',
                source: 'ipapi.co',
                timestamp: new Date().toISOString()
            })
        },
        {
            url: 'https://ip-api.com/json/',
            parser: (data) => ({
                type: 'ip_based',
                city: data.city,
                region: data.regionName,
                country: data.country,
                country_code: data.countryCode,
                ip: data.query,
                timezone: data.timezone,
                postal: data.zip,
                latitude: data.lat,
                longitude: data.lon,
                accuracy: 'city_level',
                source: 'ip-api.com',
                timestamp: new Date().toISOString()
            })
        }
    ];
    
    // Try multiple IP services for maximum reliability
    for (const service of ipServices) {
        try {
            console.log(`🌐 Trying IP location via ${service.parser({}).source}`);
            const response = await fetch(service.url, { timeout: 5000 });
            
            if (response.ok) {
                const data = await response.json();
                const locationData = service.parser(data);
                
                if (locationData.city && locationData.country) {
                    console.log(`✅ IP location found: ${locationData.city}, ${locationData.country}`);
                    return locationData;
                }
            }
        } catch (error) {
            console.log(`❌ ${service.parser({}).source} failed:`, error.message);
            continue; // Try next service
        }
    }
    
    // If all IP services fail, return basic fallback
    return {
        type: 'failed',
        message: 'All IP location services unavailable',
        timestamp: new Date().toISOString(),
        source: 'ip_fallback'
    };
}

// Method 3: Get location from timezone (approximate)
async function getLocationFromTimezone() {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Map common timezones to approximate locations
        const timezoneLocations = {
            'America/New_York': { city: 'New York', country: 'United States', country_code: 'US' },
            'America/Los_Angeles': { city: 'Los Angeles', country: 'United States', country_code: 'US' },
            'America/Toronto': { city: 'Toronto', country: 'Canada', country_code: 'CA' },
            'America/Vancouver': { city: 'Vancouver', country: 'Canada', country_code: 'CA' },
            'Europe/London': { city: 'London', country: 'United Kingdom', country_code: 'GB' },
            'Europe/Paris': { city: 'Paris', country: 'France', country_code: 'FR' },
            'Asia/Tokyo': { city: 'Tokyo', country: 'Japan', country_code: 'JP' },
            'Asia/Shanghai': { city: 'Shanghai', country: 'China', country_code: 'CN' },
            'Asia/Mumbai': { city: 'Mumbai', country: 'India', country_code: 'IN' },
            'Australia/Sydney': { city: 'Sydney', country: 'Australia', country_code: 'AU' }
        };
        
        const location = timezoneLocations[timezone];
        
        if (location) {
            return {
                type: 'timezone_based',
                city: location.city,
                country: location.country,
                country_code: location.country_code,
                timezone: timezone,
                accuracy: 'timezone_level',
                source: 'browser_timezone',
                timestamp: new Date().toISOString(),
                note: 'Approximate location based on timezone'
            };
        } else {
            return {
                type: 'timezone_only',
                timezone: timezone,
                accuracy: 'timezone_level',
                source: 'browser_timezone',
                timestamp: new Date().toISOString(),
                note: 'Only timezone information available'
            };
        }
    } catch (error) {
        return {
            type: 'failed',
            error: 'Timezone detection failed',
            timestamp: new Date().toISOString(),
            source: 'timezone_fallback'
        };
    }
}

// Method 4: Get location from network information
async function getLocationFromNetwork() {
    try {
        const networkInfo = {};
        
        // Get connection info if available
        if (navigator.connection) {
            networkInfo.connectionType = navigator.connection.effectiveType;
            networkInfo.downlink = navigator.connection.downlink;
            networkInfo.rtt = navigator.connection.rtt;
        }
        
        // Get language and locale info
        networkInfo.language = navigator.language;
        networkInfo.languages = navigator.languages;
        
        // Extract country code from language if possible
        let countryCode = null;
        if (navigator.language.includes('-')) {
            countryCode = navigator.language.split('-')[1].toUpperCase();
        }
        
        // Map country codes to countries
        const countryMap = {
            'US': 'United States', 'CA': 'Canada', 'GB': 'United Kingdom', 
            'FR': 'France', 'DE': 'Germany', 'IT': 'Italy', 'ES': 'Spain',
            'JP': 'Japan', 'CN': 'China', 'IN': 'India', 'AU': 'Australia'
        };
        
        return {
            type: 'network_based',
            country: countryMap[countryCode] || 'Unknown',
            country_code: countryCode || 'XX',
            language: navigator.language,
            accuracy: 'country_level',
            source: 'browser_network',
            timestamp: new Date().toISOString(),
            networkInfo: networkInfo,
            note: 'Location inferred from browser settings'
        };
        
    } catch (error) {
        return {
            type: 'failed',
            error: 'Network detection failed',
            timestamp: new Date().toISOString(),
            source: 'network_fallback'
        };
    }
}

// Track signin location and add to history
async function trackSigninLocation(userId) {
    try {
        const currentLocation = await getCurrentLocation();
        const signinDateTime = new Date().toISOString();
        
        const signinRecord = {
            location: currentLocation,
            datetime: signinDateTime,
            type: 'signin'
        };
        
        // Add to pending updates to batch with other operations
        const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '{}');
        if (!pendingUpdates.locationHistory) {
            pendingUpdates.locationHistory = [];
        }
        pendingUpdates.locationHistory.push(signinRecord);
        localStorage.setItem('pendingUpdates', JSON.stringify(pendingUpdates));
        
        console.log('📍 Signin location tracked:', currentLocation);
        
    } catch (error) {
        console.warn('Failed to track signin location:', error);
    }
}

// ============================================================================
// 🚀 USER SIGNUP WITH COMPREHENSIVE DATA CAPTURE
// ============================================================================

async function freeSignUp(email, password, fullName, selectedCountry) {
    try {
        console.log('🚀 Starting comprehensive user signup...');
        
        // Get location data during signup
        const signupLocation = await getCurrentLocation();
        const signupDateTime = new Date().toISOString();
        
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Generate all user attributes
        const uniqueUserId = generateUniqueUserId();
        const referralCode = generateReferralCode();
        const userCoupon = generateUserCoupon(email, signupDateTime);
        
        // Comprehensive user profile with all requested attributes
        const compactProfile = {
            // New comprehensive fields
            UserID: uniqueUserId,
            SignID: email,
            Full_Name: fullName,
            Date_Signup: signupDateTime,
            Country: selectedCountry,
            Location_Signup: signupLocation,
            Location_Signin: [{
                location: signupLocation,
                datetime: signupDateTime,
                type: 'signup'
            }],
            Referal_code: referralCode,
            User_Coupon: userCoupon,
            Subscription: "N",
            Plan: null,
            Date_Subscription_Start: null,
            Date_Subscription_End: null,
            
            // Legacy compact fields (for backward compatibility)
            id: uniqueUserId,
            e: email,
            n: fullName,
            c: selectedCountry.substring(0, 2).toUpperCase(),
            sub: {
                s: "f",          // freemium status
                p: null,         // no plan
                st: signupDateTime.split('T')[0],
                ed: null         // no end date
            },
            pg: {},             // Progress tracking
            st: [],             // Statistics
            cr: signupDateTime,  // Created timestamp
            ll: signupDateTime   // Last login
        };
        
        // Store user profile in Firestore
        await db.collection('users').doc(user.uid).set(compactProfile);
        trackWrite();
        
        // Store in local storage for immediate access
        localStorage.setItem('userProfile', JSON.stringify(compactProfile));
        localStorage.setItem('profileLastSync', Date.now().toString());
        
        console.log('✅ User created with comprehensive data:', {
            uid: user.uid,
            UserID: uniqueUserId,
            fullName: fullName,
            email: email,
            country: selectedCountry,
            location: signupLocation.type,
            referralCode: referralCode,
            userCoupon: userCoupon
        });
        
        // Success logged to console - no popup needed
        console.log(`✅ Account created successfully! Welcome to IELTS Practice! Location: ${signupLocation.city || 'Detected'}, Referral Code: ${referralCode}, Coupon: ${userCoupon}`);
        
        return { success: true, user, profile: compactProfile };
        
    } catch (error) {
        console.error('❌ Signup failed:', error);
        // Remove popup - error handling moved to calling function
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 🔑 USER SIGNIN WITH LOCATION TRACKING
// ============================================================================

async function freeSignIn(email, password) {
    try {
        console.log('🔑 User signing in...');
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Track signin location
        await trackSigninLocation(user.uid);
        
        // Get user profile
        const userDoc = await db.collection('users').doc(user.uid).get();
        trackRead();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Update last login and execute any pending updates
            const updates = { ll: new Date().toISOString() };
            
            // Handle pending location history
            const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '{}');
            if (pendingUpdates.locationHistory && pendingUpdates.locationHistory.length > 0) {
                updates.Location_Signin = firebase.firestore.FieldValue.arrayUnion(...pendingUpdates.locationHistory);
                localStorage.removeItem('pendingUpdates'); // Clear pending updates
            }
            
            await db.collection('users').doc(user.uid).update(updates);
            trackWrite();
            
            // Store updated profile locally
            const updatedProfile = { ...userData, ...updates };
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            localStorage.setItem('profileLastSync', Date.now().toString());
            
            console.log('✅ User signed in successfully');
            // Welcome back logged to console - no popup needed
        console.log('✅ Welcome back to IELTS Practice!');
            
            return { success: true, user, profile: updatedProfile };
            
        } else {
            throw new Error('User profile not found');
        }
        
    } catch (error) {
        console.error('❌ Signin failed:', error);
        // Remove popup - error handling moved to calling function
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 🏋️ FREEMIUM ACCESS CONTROL
// ============================================================================

// Check if a practice is accessible (Practice 1 = free, others = premium)
function checkPracticeAccess(practiceId) {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const subscription = userProfile.sub || {};
    
    // Extract practice number from ID (e.g., "listening_practice_1" -> 1)
    const practiceNumber = parseInt(practiceId.match(/practice_(\d+)/)?.[1] || practiceId.match(/_(\d+)/)?.[1] || "999");
    
    // Practice 1 is always free for signed-in users
    if (practiceNumber === 1) {
        return {
            hasAccess: true,
            accessLevel: 'free',
            reason: 'Practice 1 is free for all users'
        };
    }
    
    // Premium content - check subscription
    if (subscription.s === 'a') { // Active subscription
        const endDate = subscription.ed ? new Date(subscription.ed) : null;
        if (!endDate || endDate > new Date()) {
            return {
                hasAccess: true,
                accessLevel: 'premium',
                reason: 'Active subscription'
            };
        }
    }
    
    // No access - show subscription prompt
    return {
        hasAccess: false,
        accessLevel: 'blocked',
        reason: 'Premium content requires subscription'
    };
}

// Show subscription prompt for premium content
function showSubscriptionPrompt(practiceTitle) {
    const message = `🔒 Premium Content\n\n"${practiceTitle}" requires a subscription.\n\n✅ Practice 1 is FREE\n🎯 Unlock ALL practices with subscription\n\nWould you like to subscribe now?`;
    
    if (confirm(message)) {
        window.location.href = '/subscription.html';
    }
}

// Get user's access level
function getAccessLevel() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const subscription = userProfile.sub;
    
    if (!subscription) return 'none';
    
    if (subscription.s === 'a') {
        const endDate = subscription.ed ? new Date(subscription.ed) : null;
        if (!endDate || endDate > new Date()) {
            return 'premium';
        } else {
            return 'expired';
        }
    } else if (subscription.s === 'f') {
        return 'freemium';
    }
    
    return 'none';
}

// Initialize practice buttons with access control
function initializePracticeButtons() {
    const practiceButtons = document.querySelectorAll('[data-practice-id]');
    
    practiceButtons.forEach(button => {
        const practiceId = button.getAttribute('data-practice-id');
        const access = checkPracticeAccess(practiceId);
        
        if (!access.hasAccess) {
            // Add lock icon and disable premium content
            const lockIcon = ' 🔒';
            if (!button.textContent.includes('🔒')) {
                button.textContent += lockIcon;
            }
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                showSubscriptionPrompt(button.textContent.replace(' 🔒', ''));
            });
            
            button.style.opacity = '0.7';
            button.style.cursor = 'pointer';
        } else if (access.accessLevel === 'free') {
            // Add free badge
            const freeIcon = ' 🆓';
            if (!button.textContent.includes('🆓')) {
                button.textContent += freeIcon;
            }
        }
    });
}

// ============================================================================
// 👥 ADMIN MANAGEMENT (BACKEND ONLY)
// ============================================================================

// Create new admin
async function createAdmin(adminData) {
    try {
        const newAdmin = {
            Coupon_Code: adminData.couponCode,
            Role: adminData.role,
            Admin_Name: adminData.adminName,
            id: `admin_${Date.now()}`,
            created: new Date().toISOString(),
            last_login: null,
            status: 'active',
            email: adminData.email,
            created_by: auth.currentUser?.uid || 'system',
            department: adminData.department || 'General'
        };
        
        const docRef = await db.collection('admins').add(newAdmin);
        trackWrite();
        
        console.log('✅ Admin created:', docRef.id);
        return { success: true, adminId: docRef.id };
        
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        return { success: false, error: error.message };
    }
}

// Get all admins
async function getAllAdmins() {
    try {
        const adminsQuery = await db.collection('admins')
            .orderBy('created', 'desc')
            .get();
        
        trackRead();
        
        const admins = [];
        adminsQuery.forEach(doc => {
            admins.push({
                firebaseId: doc.id,
                ...doc.data()
            });
        });
        
        return admins;
        
    } catch (error) {
        console.error('Error fetching admins:', error);
        return [];
    }
}

// Get admin by coupon code
async function getAdminByCoupon(couponCode) {
    try {
        const adminQuery = await db.collection('admins')
            .where('Coupon_Code', '==', couponCode)
            .limit(1)
            .get();
        
        trackRead();
        
        if (!adminQuery.empty) {
            const adminDoc = adminQuery.docs[0];
            return {
                firebaseId: adminDoc.id,
                ...adminDoc.data()
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('Error fetching admin by coupon:', error);
        return null;
    }
}

// Get admin analytics data (backend processing only)
function getAdminRoleAnalytics(admins) {
    const roleStats = {};
    
    admins.forEach(admin => {
        const role = admin.Role;
        roleStats[role] = (roleStats[role] || 0) + 1;
    });
    
    return {
        totalAdmins: admins.length,
        activeAdmins: admins.filter(a => a.status === 'active').length,
        inactiveAdmins: admins.filter(a => a.status === 'inactive').length,
        roleDistribution: roleStats,
        averageAdminsPerRole: admins.length / Object.keys(roleStats).length
    };
}

// ============================================================================
// 🔄 SUBSCRIPTION MANAGEMENT
// ============================================================================

async function subscribeToplanFree(planType, duration) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const now = new Date();
        const endDate = new Date();
        
        // Calculate end date based on plan
        switch (duration) {
            case 'weekly':
                endDate.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                endDate.setMonth(now.getMonth() + 1);
                break;
            case 'quarterly':
                endDate.setMonth(now.getMonth() + 3);
                break;
            default:
                endDate.setMonth(now.getMonth() + 1);
        }
        
        const subscriptionUpdates = {
            // New comprehensive fields
            Subscription: "Y",
            Plan: duration.charAt(0).toUpperCase(),  // W, M, Q
            Date_Subscription_Start: now.toISOString(),
            Date_Subscription_End: endDate.toISOString(),
            
            // Legacy compact fields
            sub: {
                s: "a",                    // active
                p: planType,               // plan type
                st: now.toISOString().split('T')[0],
                ed: endDate.toISOString().split('T')[0]
            },
            ll: now.toISOString()
        };
        
        await db.collection('users').doc(user.uid).update(subscriptionUpdates);
        trackWrite();
        
        // Update local storage
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        Object.assign(userProfile, subscriptionUpdates);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        console.log('✅ Subscription activated:', { planType, duration });
        return { success: true };
        
    } catch (error) {
        console.error('❌ Subscription failed:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 🚪 SIGN OUT
// ============================================================================

async function firebaseSignOut() {
    try {
        await auth.signOut();
        
        // Clear local storage
        localStorage.removeItem('userProfile');
        localStorage.removeItem('profileLastSync');
        localStorage.removeItem('localSessions');
        localStorage.removeItem('pendingUpdates');
        
        console.log('✅ User signed out');
        alert('✅ Signed out successfully!');
        
        // Redirect to home page
        window.location.href = '/';
        
    } catch (error) {
        console.error('❌ Sign out failed:', error);
        alert('❌ Sign out failed: ' + error.message);
    }
}

// ============================================================================
// 📊 USAGE MONITORING
// ============================================================================

function showFreeTierStats() {
    console.log(`📊 Firebase Usage Today:
📖 Reads: ${readCount}
✏️ Writes: ${writeCount}
💾 Storage: ~${localStorage.length} items in local storage
🆓 Free Tier Limits:
   📖 Reads: 50,000/day
   ✏️ Writes: 20,000/day
   💾 Storage: 1GB`);
}

// ============================================================================
// 🌐 GLOBAL FUNCTIONS
// ============================================================================

// Make functions globally available
window.freeSignUp = freeSignUp;
window.freeSignIn = freeSignIn;
window.firebaseSignOut = firebaseSignOut;
window.subscribeToplanFree = subscribeToplanFree;
window.checkPracticeAccess = checkPracticeAccess;
window.getAccessLevel = getAccessLevel;
window.initializePracticeButtons = initializePracticeButtons;
window.showFreeTierStats = showFreeTierStats;

// Admin management functions (backend only - no UI)
window.createAdmin = createAdmin;
window.getAllAdmins = getAllAdmins;
window.getAdminByCoupon = getAdminByCoupon;
window.getAdminRoleAnalytics = getAdminRoleAnalytics;

// Auto-initialize practice buttons when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializePracticeButtons, 1000);
});

console.log('🆓 IELTS-Practice Firebase Integration Loaded Successfully!');
console.log('🎯 Project: IELTS-Practice (ielts-practice-acd24)');
console.log('📍 Location Tracking: AGGRESSIVE (No permission prompts)');
console.log('👥 Admin System: BACKEND READY');
console.log('🎮 Freemium Model: Practice 1 FREE + Subscription');
console.log('🔒 Security: PRODUCTION MODE with comprehensive rules'); 