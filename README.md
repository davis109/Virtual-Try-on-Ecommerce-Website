# Virtual Try-On E-commerce Website

A modern e-commerce website with virtual try-on functionality, built using React, Flask, and Stripe.

## Features

- Virtual try-on using AI technology
- Product catalog with filtering
- Shopping cart functionality
- Secure payment processing with Stripe
- User authentication
- Responsive design

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- Stripe account
- ComfyUI setup for virtual try-on

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd virtual-tryon-ecommerce
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

5. Start the backend server:
```bash
python api.py
```

6. Start the frontend development server:
```bash
cd frontend
npm start
```

## Usage

1. Browse products in the catalog
2. Use the virtual try-on feature to see how clothes look on you
3. Add items to your cart
4. Proceed to checkout
5. Enter shipping information and payment details
6. Complete your purchase

## Virtual Try-On

The virtual try-on feature allows users to:
- Upload their photo
- Select clothing items from the catalog
- See how the clothes would look on them
- Save and share their virtual try-on results

## Payment Processing

The website uses Stripe for secure payment processing. Make sure to:
1. Set up a Stripe account
2. Configure your Stripe API keys in the `.env` file
3. Set up webhook endpoints for payment notifications

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 