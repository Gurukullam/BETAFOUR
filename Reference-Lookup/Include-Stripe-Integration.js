/**
 * Include Stripe Integration - IELTS Practice Module
 * Add this script to your IELTS index.html to enable Stripe payments
 */

// ========================================
// AUTO-INCLUDE STRIPE INTEGRATION
// ========================================

(function() {
    'use strict';
    
    console.log('🚀 Loading Stripe Integration for IELTS...');
    
    // Function to load external scripts
    function loadScript(src, onLoad, onError) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = onLoad;
        script.onerror = onError;
        document.head.appendChild(script);
        return script;
    }
    
    // Function to add CSS for Stripe integration
    function addStripeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Stripe Integration Styles */
            .stripe-test-banner {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 0.8rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                text-align: center;
                font-weight: 500;
            }
            
            .stripe-card-element {
                padding: 0.7rem;
                border: 2px solid #ddd;
                border-radius: 8px;
                background: white;
                transition: border-color 0.3s ease;
            }
            
            .stripe-card-element:focus-within {
                border-color: #8b4513;
                box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
            }
            
            .stripe-card-errors {
                color: #dc3545;
                font-size: 0.9rem;
                margin-top: 0.5rem;
                min-height: 1.2rem;
            }
            
            .stripe-processing {
                position: relative;
                overflow: hidden;
            }
            
            .stripe-processing::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: stripeProcessing 1.5s infinite;
            }
            
            @keyframes stripeProcessing {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .stripe-success-animation {
                animation: stripeSuccess 0.6s ease-out;
            }
            
            @keyframes stripeSuccess {
                0% { transform: scale(0.9); opacity: 0; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Function to initialize Stripe integration
    function initializeStripeIntegration() {
        console.log('🔧 Initializing Stripe Integration...');
        
        // Add Stripe-specific styles
        addStripeStyles();
        
        // Load Stripe.js first
        loadScript(
            'https://js.stripe.com/v3/',
            function() {
                console.log('✅ Stripe.js loaded successfully');
                
                // Load our Stripe integration
                loadScript(
                    '../Reference-Lookup/Stripe-Integration.js',
                    function() {
                        console.log('✅ Stripe Integration loaded successfully');
                        
                        // Hook into existing premium modal
                        hookIntoExistingModal();
                        
                        // Add Stripe information to console
                        displayStripeInfo();
                        
                        console.log('🎉 Stripe Integration ready!');
                    },
                    function() {
                        console.error('❌ Failed to load Stripe Integration script');
                        console.log('💡 Make sure Reference-Lookup/Stripe-Integration.js exists');
                    }
                );
            },
            function() {
                console.error('❌ Failed to load Stripe.js');
                console.log('💡 Check internet connection and try again');
            }
        );
    }
    
    // Function to hook into existing premium modal
    function hookIntoExistingModal() {
        // Override the existing showPremiumModal function to include Stripe
        const originalShowPremiumModal = window.showPremiumModal;
        
        if (typeof originalShowPremiumModal === 'function') {
            window.showPremiumModal = function() {
                console.log('🚀 Enhanced showPremiumModal called');
                
                // Call original function
                originalShowPremiumModal.call(this);
                
                // Force Stripe integration initialization (multiple attempts for reliability)
                let attempts = 0;
                const maxAttempts = 5;
                
                function initializeStripeWithRetry() {
                    attempts++;
                    console.log(`🔄 Stripe initialization attempt ${attempts}/${maxAttempts}`);
                    
                    if (window.StripeIntegration && typeof window.StripeIntegration.initialize === 'function') {
                        console.log('✅ Stripe integration found, initializing...');
                        window.StripeIntegration.initialize();
                        console.log('🎯 Stripe payment form should now be active');
                    } else if (attempts < maxAttempts) {
                        console.log('⏳ Stripe integration not ready, retrying...');
                        setTimeout(initializeStripeWithRetry, 200);
                    } else {
                        console.error('❌ Failed to initialize Stripe integration after 5 attempts');
                    }
                }
                
                // Start initialization immediately, then retry if needed
                setTimeout(initializeStripeWithRetry, 50);
            };
            
            console.log('✅ Enhanced Stripe modal hook installed');
        } else {
            console.log('⚠️ Original showPremiumModal function not found');
        }
        
        // Add openSubscriptionModal function for locked content
        window.openSubscriptionModal = function() {
            console.log('🔓 Opening subscription modal from locked content');
            window.showPremiumModal();
        };
        
        // Force Stripe integration on plan selection
        function forceStripeOnPlanSelection() {
            const planRadios = document.querySelectorAll('input[name="subscriptionPlan"]');
            planRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.checked) {
                        console.log('📋 Plan selected, forcing Stripe integration...');
                        
                        // Force initialize Stripe integration
                        setTimeout(() => {
                            if (window.StripeIntegration && typeof window.StripeIntegration.initialize === 'function') {
                                console.log('🎯 Re-initializing Stripe for plan selection');
                                window.StripeIntegration.initialize();
                            }
                        }, 100);
                    }
                });
            });
        }
        
        // Watch for plan selection changes
        setTimeout(forceStripeOnPlanSelection, 500);
        
        console.log('✅ Added openSubscriptionModal for locked content');
        console.log('✅ Added plan selection Stripe integration enforcement');
        
        // Add Stripe customer portal link to authenticated buttons
        addCustomerPortalLink();
    }
    
    // Function to add customer portal link (disabled)
    function addCustomerPortalLink() {
        // ❌ Manage Subscription button removed per user request
        console.log('ℹ️ Customer portal button disabled');
    }
    
    // Function to display Stripe information in console
    function displayStripeInfo() {
        console.log(`
🎯 STRIPE INTEGRATION READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Test Mode: Active
✅ Integration: Loaded
✅ Payment Form: Enhanced with Stripe

🧪 TEST CARDS:
• Success: 4242 4242 4242 4242
• Decline: 4000 0000 0000 0002
• 3D Secure: 4000 0027 6000 3184

📋 AVAILABLE PLANS:
• Weekly: $4.99 CAD
• Monthly: $14.99 CAD  
• Quarterly: $29.99 CAD

🔧 CONSOLE COMMANDS:
• StripeIntegration.isTestMode() - Check test mode
• StripeIntegration.testCards - View test cards
• StripeIntegration.openCustomerPortal() - Open portal

💡 Next Steps:
1. Configure your Stripe API keys
2. Set up products in Stripe Dashboard
3. Test with provided test cards
        `);
    }
    
    // Function to check if Stripe integration is needed
    function shouldLoadStripeIntegration() {
        // Check if premium modal exists
        const premiumModal = document.getElementById('premiumModal');
        if (!premiumModal) {
            console.log('⚠️ Premium modal not found - Stripe integration not needed');
            return false;
        }
        
        // Check if Stripe is already loaded
        if (window.StripeIntegration) {
            console.log('⚠️ Stripe integration already loaded');
            return false;
        }
        
        return true;
    }
    
    // Main initialization
    function init() {
        if (shouldLoadStripeIntegration()) {
            console.log('🚀 Starting Stripe Integration initialization...');
            initializeStripeIntegration();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Global reference for debugging
    window.StripeLoader = {
        version: '1.0.0',
        status: 'loading',
        reinitialize: init
    };
    
})();

// ========================================
// INTEGRATION INSTRUCTIONS
// ========================================

/*
TO INTEGRATE STRIPE PAYMENTS INTO YOUR IELTS INDEX.HTML:

1. Add this script tag before the closing </body> tag:
   <script src="Reference-Lookup/Include-Stripe-Integration.js"></script>

2. Make sure these files exist:
   - Reference-Lookup/Stripe-Integration.js
   - Reference-Lookup/Stripe_Subscription_Implementation_Strategy.md
   - Backend-Setup/stripe-webhook-handler.html

3. Configure your Stripe API keys in Stripe-Integration.js:
   - Replace 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' with your actual publishable key
   - Replace price IDs with your actual Stripe price IDs

4. Test the integration:
   - Open the premium modal
   - Select a subscription plan
   - Use test card: 4242424242424242
   - Verify payment processing

5. For production:
   - Replace test keys with live keys
   - Update webhook endpoints
   - Test with real cards

TROUBLESHOOTING:
- Check browser console for any errors
- Verify all script files are accessible
- Ensure Stripe Dashboard is configured
- Test webhook endpoints are working

SUPPORT:
- Review the implementation strategy document
- Check Stripe Dashboard for payment logs
- Use browser dev tools for debugging
*/ 