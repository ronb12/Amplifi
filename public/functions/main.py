import firebase_admin
from firebase_admin import credentials, firestore, auth
import stripe
import functions_framework
from flask import Request, jsonify
import os
import json
from datetime import datetime, timedelta

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Initialize Stripe with secret key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'your_stripe_secret_key_here')

@functions_framework.http
def create_payment_intent(request: Request):
    """Create a payment intent for tip payments"""
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        # Get request data
        data = request.get_json()
        amount = data.get('amount')  # Amount in cents
        currency = data.get('currency', 'usd')
        recipient_id = data.get('recipientId')
        recipient_name = data.get('recipientName')
        
        # Verify user authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'recipient_id': recipient_id,
                'recipient_name': recipient_name,
                'sender_id': user_id,
                'type': 'tip'
            },
            automatic_payment_methods={
                'enabled': True,
            }
        )
        
        # Store tip record in Firestore
        tip_data = {
            'senderId': user_id,
            'recipientId': recipient_id,
            'recipientName': recipient_name,
            'amount': amount / 100,  # Convert back to dollars
            'currency': currency,
            'status': 'pending',
            'stripePaymentIntentId': payment_intent.id,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        db.collection('tips').add(tip_data)
        
        return jsonify({
            'clientSecret': payment_intent.client_secret,
            'paymentIntentId': payment_intent.id
        })
        
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@functions_framework.http
def create_subscription(request: Request):
    """Create a subscription for premium features"""
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        data = request.get_json()
        price_id = data.get('priceId')
        customer_id = data.get('customerId')
        
        # Verify user authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{'price': price_id}],
            metadata={
                'user_id': user_id,
                'type': 'subscription'
            }
        )
        
        # Update user profile with subscription info
        db.collection('users').document(user_id).update({
            'subscriptionId': subscription.id,
            'subscriptionStatus': subscription.status,
            'subscriptionCreated': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        })
        
        return jsonify({
            'subscriptionId': subscription.id,
            'status': subscription.status
        })
        
    except Exception as e:
        print(f"Error creating subscription: {str(e)}")
        return jsonify({'error': str(e)}), 500

@functions_framework.http
def create_customer(request: Request):
    """Create a Stripe customer for a user"""
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        
        # Verify user authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Create Stripe customer
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={
                'user_id': user_id,
                'platform': 'amplifi'
            }
        )
        
        # Update user profile with customer ID
        db.collection('users').document(user_id).update({
            'stripeCustomerId': customer.id,
            'updatedAt': datetime.utcnow()
        })
        
        return jsonify({
            'customerId': customer.id,
            'email': customer.email
        })
        
    except Exception as e:
        print(f"Error creating customer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@functions_framework.http
def get_payment_methods(request: Request):
    """Get payment methods for a customer"""
    if request.method != 'GET':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        customer_id = request.args.get('customerId')
        
        # Verify user authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Get payment methods
        payment_methods = stripe.PaymentMethod.list(
            customer=customer_id,
            type='card'
        )
        
        return jsonify({
            'paymentMethods': payment_methods.data
        })
        
    except Exception as e:
        print(f"Error fetching payment methods: {str(e)}")
        return jsonify({'error': str(e)}), 500

@functions_framework.http
def create_setup_intent(request: Request):
    """Create a setup intent for saving payment methods"""
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        data = request.get_json()
        customer_id = data.get('customerId')
        
        # Verify user authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Create setup intent
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=['card'],
            metadata={
                'user_id': user_id,
                'type': 'setup_intent'
            }
        )
        
        return jsonify({
            'clientSecret': setup_intent.client_secret,
            'setupIntentId': setup_intent.id
        })
        
    except Exception as e:
        print(f"Error creating setup intent: {str(e)}")
        return jsonify({'error': str(e)}), 500

@functions_framework.http
def process_webhook(request: Request):
    """Handle Stripe webhooks for payment events"""
    if request.method != 'POST':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        # Get the webhook secret
        webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', 'whsec_your_webhook_secret_here')
        
        # Get the webhook payload
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            return jsonify({'error': 'Invalid payload'}), 400
        except stripe.error.SignatureVerificationError as e:
            return jsonify({'error': 'Invalid signature'}), 400
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            await handle_payment_success(payment_intent)
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            await handle_payment_failure(payment_intent)
        elif event['type'] == 'customer.subscription.created':
            subscription = event['data']['object']
            await handle_subscription_created(subscription)
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            await handle_subscription_updated(subscription)
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            await handle_subscription_deleted(subscription)
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        return jsonify({'error': str(e)}), 500

async def handle_payment_success(payment_intent):
    """Handle successful payment"""
    try:
        metadata = payment_intent.get('metadata', {})
        recipient_id = metadata.get('recipient_id')
        sender_id = metadata.get('sender_id')
        amount = payment_intent.get('amount') / 100  # Convert to dollars
        
        # Update tip status
        tips_ref = db.collection('tips')
        tips_query = tips_ref.where('stripePaymentIntentId', '==', payment_intent['id'])
        tips_docs = tips_query.stream()
        
        for tip_doc in tips_docs:
            tip_doc.reference.update({
                'status': 'completed',
                'updatedAt': datetime.utcnow()
            })
        
        # Update recipient's earnings
        earnings_ref = db.collection('earnings').document(recipient_id)
        earnings_doc = earnings_ref.get()
        
        if earnings_doc.exists:
            current_earnings = earnings_doc.to_dict()
            total_tips = current_earnings.get('totalTips', 0) + amount
            earnings_ref.update({
                'totalTips': total_tips,
                'lastUpdated': datetime.utcnow()
            })
        else:
            earnings_ref.set({
                'totalTips': amount,
                'totalEarnings': amount,
                'lastUpdated': datetime.utcnow()
            })
        
        print(f"Payment success processed: {payment_intent['id']}")
        
    except Exception as e:
        print(f"Error handling payment success: {str(e)}")

async def handle_payment_failure(payment_intent):
    """Handle failed payment"""
    try:
        # Update tip status to failed
        tips_ref = db.collection('tips')
        tips_query = tips_ref.where('stripePaymentIntentId', '==', payment_intent['id'])
        tips_docs = tips_query.stream()
        
        for tip_doc in tips_docs:
            tip_doc.reference.update({
                'status': 'failed',
                'updatedAt': datetime.utcnow()
            })
        
        print(f"Payment failure processed: {payment_intent['id']}")
        
    except Exception as e:
        print(f"Error handling payment failure: {str(e)}")

async def handle_subscription_created(subscription):
    """Handle subscription creation"""
    try:
        metadata = subscription.get('metadata', {})
        user_id = metadata.get('user_id')
        
        if user_id:
            db.collection('users').document(user_id).update({
                'subscriptionId': subscription['id'],
                'subscriptionStatus': subscription['status'],
                'subscriptionCreated': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            })
        
        print(f"Subscription created: {subscription['id']}")
        
    except Exception as e:
        print(f"Error handling subscription created: {str(e)}")

async def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    try:
        metadata = subscription.get('metadata', {})
        user_id = metadata.get('user_id')
        
        if user_id:
            db.collection('users').document(user_id).update({
                'subscriptionStatus': subscription['status'],
                'subscriptionUpdated': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            })
        
        print(f"Subscription updated: {subscription['id']}")
        
    except Exception as e:
        print(f"Error handling subscription updated: {str(e)}")

async def handle_subscription_deleted(subscription):
    """Handle subscription deletion"""
    try:
        metadata = subscription.get('metadata', {})
        user_id = metadata.get('user_id')
        
        if user_id:
            db.collection('users').document(user_id).update({
                'subscriptionStatus': 'canceled',
                'subscriptionCanceled': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            })
        
        print(f"Subscription deleted: {subscription['id']}")
        
    except Exception as e:
        print(f"Error handling subscription deleted: {str(e)}")

@functions_framework.http
def get_user_earnings(request: Request):
    """Get user earnings and payment history"""
    if request.method != 'GET':
        return jsonify({'error': 'Method not allowed'}), 405
    
    try:
        # Verify user authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        
        # Get earnings data
        earnings_doc = db.collection('earnings').document(user_id).get()
        earnings_data = earnings_doc.to_dict() if earnings_doc.exists else {}
        
        # Get recent tips
        tips_ref = db.collection('tips')
        tips_query = tips_ref.where('recipientId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING).limit(10)
        tips_docs = tips_query.stream()
        
        recent_tips = []
        for tip_doc in tips_docs:
            tip_data = tip_doc.to_dict()
            tip_data['id'] = tip_doc.id
            recent_tips.append(tip_data)
        
        return jsonify({
            'earnings': earnings_data,
            'recentTips': recent_tips
        })
        
    except Exception as e:
        print(f"Error fetching user earnings: {str(e)}")
        return jsonify({'error': str(e)}), 500 