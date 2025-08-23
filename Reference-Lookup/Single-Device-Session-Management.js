// ============================================================================
// 🔐 SINGLE-DEVICE SESSION MANAGEMENT SYSTEM
// Prevents account sharing by enforcing one active session per user
// ============================================================================

// 🆔 DEVICE FINGERPRINTING - Generate unique device identifier
function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = {
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent.substring(0, 100),
        canvas: canvas.toDataURL().substring(0, 50),
        timestamp: Date.now(),
        random: Math.random().toString(36).substring(2, 10)
    };
    
    // Create a hash of all fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    const deviceId = Math.abs(hash).toString(36) + '-' + fingerprint.random;
    console.log('🆔 Generated device fingerprint:', deviceId);
    
    return deviceId;
}

// 📱 GET OR CREATE DEVICE ID
function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = generateDeviceFingerprint();
        localStorage.setItem('deviceId', deviceId);
        console.log('🆕 New device ID created:', deviceId);
    } else {
        console.log('📱 Existing device ID found:', deviceId);
    }
    return deviceId;
}

// 🔍 CHECK FOR EXISTING ACTIVE SESSIONS
async function checkExistingSession(userId) {
    try {
        console.log('🔍 Checking for existing active sessions for user:', userId);
        
        const sessionsRef = db.collection('activeSessions').doc(userId);
        const sessionDoc = await sessionsRef.get();
        trackRead();
        
        if (sessionDoc.exists) {
            const sessionData = sessionDoc.data();
            const currentDeviceId = getDeviceId();
            
            console.log('📊 Found existing session data:', sessionData);
            console.log('📱 Current device ID:', currentDeviceId);
            
            // Check if there's an active session on a different device
            if (sessionData.deviceId !== currentDeviceId) {
                const sessionAge = Date.now() - new Date(sessionData.lastActivity).getTime();
                const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
                
                // If session is recent (within 24 hours), it's considered active
                if (sessionAge < maxSessionAge) {
                    console.log('❌ Active session found on different device');
                    return {
                        hasActiveSession: true,
                        currentDevice: sessionData.deviceInfo,
                        sessionStart: sessionData.loginTime,
                        lastActivity: sessionData.lastActivity
                    };
                } else {
                    console.log('🕒 Found stale session, will be replaced');
                    return { hasActiveSession: false };
                }
            } else {
                console.log('✅ Session exists for current device');
                return { hasActiveSession: false }; // Same device, allow login
            }
        } else {
            console.log('📝 No existing session found');
            return { hasActiveSession: false };
        }
        
    } catch (error) {
        console.error('❌ Error checking existing session:', error);
        return { hasActiveSession: false }; // Allow login on error
    }
}

// 🔄 CREATE NEW SESSION RECORD
async function createSessionRecord(userId, userProfile) {
    try {
        const deviceId = getDeviceId();
        const currentTime = new Date().toISOString();
        
        // Get device/browser information
        const deviceInfo = {
            browser: getBrowserInfo(),
            os: getOperatingSystem(),
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
        };
        
        const sessionData = {
            userId: userId,
            deviceId: deviceId,
            deviceInfo: deviceInfo,
            loginTime: currentTime,
            lastActivity: currentTime,
            userEmail: userProfile.SignID || userProfile.e,
            userName: userProfile.Full_Name || userProfile.n,
            ipInfo: await getLocationInfo() // Get location for security
        };
        
        // Store session in Firestore (overwrites any existing session)
        await db.collection('activeSessions').doc(userId).set(sessionData);
        trackWrite();
        
        // Store session info locally for periodic updates
        localStorage.setItem('currentSession', JSON.stringify({
            userId: userId,
            deviceId: deviceId,
            loginTime: currentTime
        }));
        
        console.log('✅ New session record created:', sessionData);
        return true;
        
    } catch (error) {
        console.error('❌ Error creating session record:', error);
        return false;
    }
}

// 📊 GET BROWSER INFORMATION
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.includes('Chrome')) {
        browserName = 'Chrome';
        browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edge')) {
        browserName = 'Edge';
        browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }
    
    return `${browserName} ${browserVersion}`;
}

// 💻 GET OPERATING SYSTEM
function getOperatingSystem() {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    if (/Android/.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    
    return platform;
}

// 🌍 GET LOCATION INFO (FOR SECURITY MONITORING)
async function getLocationInfo() {
    try {
        // Use same location tracking as existing system
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        return {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            ip: data.ip || 'Unknown',
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    } catch (error) {
        console.log('Location detection failed, using fallback');
        return {
            country: 'Unknown',
            city: 'Unknown',
            ip: 'Unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
}

// ⏰ UPDATE SESSION ACTIVITY (HEARTBEAT)
async function updateSessionActivity(userId) {
    try {
        const currentSession = localStorage.getItem('currentSession');
        if (!currentSession) return;
        
        const sessionInfo = JSON.parse(currentSession);
        const currentTime = new Date().toISOString();
        
        // Update last activity timestamp in Firestore
        await db.collection('activeSessions').doc(userId).update({
            lastActivity: currentTime
        });
        trackWrite();
        
        console.log('💓 Session heartbeat updated');
        
    } catch (error) {
        console.error('❌ Error updating session activity:', error);
    }
}

// 🧹 CLEANUP SESSION ON LOGOUT
async function cleanupSession(userId) {
    try {
        console.log('🧹 Cleaning up session for user:', userId);
        
        // Remove session from Firestore
        await db.collection('activeSessions').doc(userId).delete();
        trackWrite();
        
        // Clear local session data
        localStorage.removeItem('currentSession');
        localStorage.removeItem('deviceId');
        
        console.log('✅ Session cleaned up successfully');
        
    } catch (error) {
        console.error('❌ Error cleaning up session:', error);
    }
}

// ⚠️ SHOW SESSION CONFLICT MODAL
function showSessionConflictModal(existingSessionInfo) {
    const modal = document.createElement('div');
    modal.id = 'sessionConflictModal';
    modal.className = 'modal';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        justify-content: center;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    const deviceInfo = existingSessionInfo.currentDevice;
    const lastActivity = new Date(existingSessionInfo.lastActivity).toLocaleString();
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        ">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
            <h2 style="color: #dc3545; margin-bottom: 1rem; font-size: 1.5rem;">Account Already Active</h2>
            <p style="margin-bottom: 1.5rem; color: #666; line-height: 1.6;">
                Your account is currently signed in on another device. For security reasons, 
                only one active session is allowed per account.
            </p>
            
            <div style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
                text-align: left;
                border: 1px solid #dee2e6;
            ">
                <div style="font-weight: 600; color: #495057; margin-bottom: 0.5rem;">Current Active Session:</div>
                <div style="color: #666; font-size: 0.9rem;">
                    <div>📱 Device: ${deviceInfo.browser} on ${deviceInfo.os}</div>
                    <div>🌍 Location: ${deviceInfo.timezone}</div>
                    <div>⏰ Last Active: ${lastActivity}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <button id="forceLoginBtn" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-right: 10px;
                    transition: background-color 0.3s;
                " onmouseover="this.style.backgroundColor='#c82333'" 
                   onmouseout="this.style.backgroundColor='#dc3545'">
                    Sign In Here (End Other Session)
                </button>
                <button id="cancelLoginBtn" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background-color 0.3s;
                " onmouseover="this.style.backgroundColor='#5a6268'" 
                   onmouseout="this.style.backgroundColor='#6c757d'">
                    Cancel
                </button>
            </div>
            
            <p style="font-size: 0.8rem; color: #6c757d;">
                💡 To prevent account sharing, we limit each account to one active session. 
                Signing in here will automatically sign out the other device.
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    return new Promise((resolve) => {
        document.getElementById('forceLoginBtn').onclick = () => {
            document.body.removeChild(modal);
            resolve(true); // User chose to force login
        };
        
        document.getElementById('cancelLoginBtn').onclick = () => {
            document.body.removeChild(modal);
            resolve(false); // User chose to cancel
        };
    });
}

// 🔄 PERIODIC SESSION VALIDATION
function startSessionMonitoring(userId) {
    // Update session activity every 5 minutes
    const heartbeatInterval = setInterval(() => {
        updateSessionActivity(userId);
    }, 5 * 60 * 1000);
    
    // Validate session every 15 minutes
    const validationInterval = setInterval(async () => {
        try {
            const currentSession = localStorage.getItem('currentSession');
            if (!currentSession) {
                clearInterval(heartbeatInterval);
                clearInterval(validationInterval);
                return;
            }
            
            const sessionInfo = JSON.parse(currentSession);
            const sessionDoc = await db.collection('activeSessions').doc(userId).get();
            trackRead();
            
            if (!sessionDoc.exists) {
                console.log('❌ Session was terminated remotely');
                handleSessionTermination();
                clearInterval(heartbeatInterval);
                clearInterval(validationInterval);
                return;
            }
            
            const sessionData = sessionDoc.data();
            if (sessionData.deviceId !== sessionInfo.deviceId) {
                console.log('❌ Session taken over by another device');
                handleSessionTermination();
                clearInterval(heartbeatInterval);
                clearInterval(validationInterval);
            }
            
        } catch (error) {
            console.error('❌ Session validation error:', error);
        }
    }, 15 * 60 * 1000);
    
    // Store intervals for cleanup
    localStorage.setItem('sessionIntervals', JSON.stringify({
        heartbeat: heartbeatInterval,
        validation: validationInterval
    }));
}

// ❌ HANDLE SESSION TERMINATION
function handleSessionTermination() {
    // Clear all user data
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSubscriptionData');
    localStorage.removeItem('currentSession');
    localStorage.removeItem('userAuthenticated');
    
    // Show termination notice
    alert('🔐 Your session has been ended because you signed in on another device. Please sign in again to continue.');
    
    // Reload page to reset state
    window.location.reload();
}

// ============================================================================
// 🔑 MODIFIED SIGNIN FUNCTION WITH SESSION MANAGEMENT
// ============================================================================

// Enhanced freeSignIn function that includes session checking
async function freeSignInWithSessionCheck(email, password) {
    try {
        console.log('🔑 User signing in with session check...');
        
        // First, authenticate with Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check for existing active sessions
        const sessionCheck = await checkExistingSession(user.uid);
        
        if (sessionCheck.hasActiveSession) {
            console.log('⚠️ Active session detected on another device');
            
            // Show session conflict modal and wait for user decision
            const forceLogin = await showSessionConflictModal(sessionCheck);
            
            if (!forceLogin) {
                console.log('❌ User cancelled login due to session conflict');
                await auth.signOut(); // Sign out from Firebase
                throw new Error('Login cancelled due to active session on another device');
            }
            
            console.log('🔄 User chose to force login - terminating other session');
        }
        
        // Continue with normal login process
        await trackSigninLocation(user.uid);
        
        // Get user profile
        const userDoc = await db.collection('users').doc(user.uid).get();
        trackRead();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Create new session record (overwrites any existing session)
            await createSessionRecord(user.uid, userData);
            
            // Update last login and execute any pending updates
            const updates = { ll: new Date().toISOString() };
            
            // Handle pending location history
            const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '{}');
            if (pendingUpdates.locationHistory && pendingUpdates.locationHistory.length > 0) {
                updates.Location_Signin = firebase.firestore.FieldValue.arrayUnion(...pendingUpdates.locationHistory);
                localStorage.removeItem('pendingUpdates');
            }
            
            await db.collection('users').doc(user.uid).update(updates);
            trackWrite();
            
            // Store updated profile locally
            const updatedProfile = { ...userData, ...updates };
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            localStorage.setItem('profileLastSync', Date.now().toString());
            
            // Start session monitoring
            startSessionMonitoring(user.uid);
            
            console.log('✅ User signed in successfully with session management');
            return { success: true, user, profile: updatedProfile };
            
        } else {
            throw new Error('User profile not found');
        }
        
    } catch (error) {
        console.error('❌ Signin error:', error);
        throw error;
    }
}

// ============================================================================
// 🚪 ENHANCED SIGNOUT WITH SESSION CLEANUP
// ============================================================================

async function enhancedSignOut() {
    try {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // Clean up session record
            await cleanupSession(currentUser.uid);
        }
        
        // Sign out from Firebase
        await auth.signOut();
        
        // Clear all local data
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userSubscriptionData');
        localStorage.removeItem('currentSession');
        localStorage.removeItem('userAuthenticated');
        
        console.log('✅ User signed out successfully with session cleanup');
        return true;
        
    } catch (error) {
        console.error('❌ Signout error:', error);
        return false;
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// Initialize session management when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Single-device session management initialized');
    
    // Check if user is already authenticated and start session monitoring
    auth.onAuthStateChanged((user) => {
        if (user) {
            const currentSession = localStorage.getItem('currentSession');
            if (currentSession) {
                startSessionMonitoring(user.uid);
                console.log('🔄 Resumed session monitoring for authenticated user');
            }
        }
    });
});

// Export functions for use in main application
window.freeSignInWithSessionCheck = freeSignInWithSessionCheck;
window.enhancedSignOut = enhancedSignOut;
window.getDeviceId = getDeviceId; 