# VITRZ Frontend - Professional Virtual Try-On Experience

This is a modern, international-level React frontend for the VITRZ virtual try-on platform.

## 🌟 Features

- **Modern UI/UX Design**: International-standard interface with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices  
- **AI-Powered Try-On**: Integrates with your working api.py backend
- **Drag & Drop Upload**: Intuitive image upload with preview
- **Real-time Processing**: Live status updates during try-on processing
- **Professional Styling**: Uses modern design patterns and typography

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Your working backend (api.py on port 8000)
- AI Stylist API (port 5001)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend-tryon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and visit:
```
http://localhost:3000
```

## 🔧 Backend Integration

The frontend automatically connects to:

- **Main Backend**: `http://localhost:8000` (your working api.py)
- **AI Stylist API**: `http://localhost:5001` (styling recommendations)

Make sure both services are running before starting the frontend.

## 📱 How It Works

### 3-Step Process:

1. **Upload Photo**: Users upload their photo using drag & drop
2. **Select Clothing**: Choose from categorized clothing items
3. **Try On**: AI processes the virtual try-on and shows results

### Key Components:

- `Header.js` - Navigation and status indicator
- `ImageUpload.js` - Drag & drop image upload with preview
- `ClothingSelector.js` - Category-based clothing selection
- `App.js` - Main application logic and workflow

## 🎨 Design Features

### Visual Design:
- Modern gradient backgrounds
- Glass-morphism effects
- Smooth animations with Framer Motion
- Professional typography (Inter + Playfair Display)
- International color palette

### User Experience:
- Intuitive 3-step workflow
- Real-time status indicators
- Progress animations
- Error handling with toasts
- Mobile-responsive design

### Technical Features:
- React 18 with hooks
- Styled Components for styling
- Framer Motion for animations
- React Dropzone for file uploads
- Axios for API communication
- React Toastify for notifications

## 🌐 International Standards

The frontend follows international web standards:

- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Optimized loading and rendering
- **SEO**: Proper meta tags and structure
- **Mobile First**: Responsive design approach
- **Modern Standards**: ES6+, semantic HTML, CSS Grid/Flexbox

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 641px - 1024px  
- **Desktop**: > 1024px

## 🚀 Deployment

### Build for Production:

```bash
npm run build
```

### Deploy to Popular Platforms:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop build folder
- **AWS S3**: Upload build folder
- **GitHub Pages**: Use gh-pages package

## 🔧 Configuration

### Environment Variables:

Create a `.env` file in the root:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_STYLIST_API_URL=http://localhost:5001
REACT_APP_VERSION=1.0.0
```

### API Endpoints Used:

**Main Backend (api.py):**
- `POST /api/upload/model` - Upload user photo
- `POST /api/upload/cloth` - Upload clothing image  
- `POST /api/tryon` - Process virtual try-on
- `GET /health` - Health check

**AI Stylist API:**
- `GET /api/clothing-items` - Get available clothing
- `POST /api/search-clothing` - Search clothing items
- `POST /api/virtual-tryon` - Alternative try-on method
- `GET /health` - Health check

## 🛠 Development

### Code Structure:
```
src/
├── components/          # Reusable UI components
├── services/           # API integration
├── styles/            # Global styles and themes
├── App.js            # Main application
└── index.js          # Entry point
```

### Adding New Features:

1. Create component in `components/`
2. Add API methods to `services/api.js`
3. Update styling in `styles/`
4. Integrate in `App.js`

## 🔍 Testing

Run tests:
```bash
npm test
```

Build and test:
```bash
npm run build
npm run serve
```

## 🌟 What Makes This International Level

### Design Excellence:
- Modern, clean interface following current design trends
- Professional color scheme and typography
- Consistent spacing and visual hierarchy
- International iconography and symbols

### User Experience:
- Intuitive workflow that needs no explanation
- Immediate feedback and status updates
- Error handling that guides users
- Mobile-optimized interface

### Technical Quality:
- Modern React patterns and best practices
- Performance optimized with lazy loading
- Accessibility features built-in
- SEO and social media ready

### Professional Features:
- Multi-language ready structure
- Analytics integration ready
- Error tracking and monitoring
- Scalable component architecture

## 🎯 Perfect for Your Needs

This frontend is specifically designed to showcase your working virtual try-on technology with:

- **Professional appearance** that builds user trust
- **Smooth integration** with your existing backend
- **International standards** for global reach
- **Modern technology** that's maintainable and scalable

Ready to impress users worldwide! 🌍✨