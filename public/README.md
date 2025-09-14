# ⚡ Jinra Frontend

A beautiful, responsive frontend for **Jinra** - the smart news feed with AI summaries.

## Features

- **Keyboard Navigation** - Use arrow keys to browse articles
- **Mobile Support** - Swipe gestures for mobile devices
- **Smart Summaries** - Clean 60-word summaries for each article
- **Modern Design** - Beautiful cards with smooth animations
- **Real-time Updates** - Refresh button to get latest news
- **Progress Tracking** - See your progress through the news feed

## Controls

### Desktop
- **↓ or →** - Next article
- **↑ or ←** - Previous article
- **R** - Refresh articles
- **🔄 Button** - Refresh articles

### Mobile
- **Swipe up/left** - Next article
- **Swipe down/right** - Previous article
- **Tap refresh button** - Refresh articles

## How to Use

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   ```
   http://localhost:3000
   ```

3. **Navigate articles:**
   - Press the down arrow key to see the next article
   - Each article shows a clean summary perfect for quick reading
   - Click "Read Full Article →" to open the original source

## Design Features

- **Gradient Background** - Beautiful purple gradient
- **Card-based Layout** - Clean, modern article cards
- **Smooth Animations** - Slide-in effects and hover animations
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Loading States** - Smooth loading and error handling
- **Progress Bar** - Visual progress indicator at the top

## Technical Details

- **Vanilla JavaScript** - No frameworks, pure JS
- **CSS Grid & Flexbox** - Modern layout techniques
- **Fetch API** - Async data loading
- **Touch Events** - Mobile gesture support
- **Keyboard Events** - Desktop navigation
- **Local Storage** - Optional state persistence

## Customization

The frontend is designed to be easily customizable:

- **Colors**: Edit the CSS variables in `styles.css`
- **Layout**: Modify the HTML structure in `index.html`
- **Behavior**: Update the JavaScript logic in `script.js`
- **API Endpoints**: Change the API base URL in `script.js`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Fast Loading** - Optimized images and minimal dependencies
- **Smooth Scrolling** - Hardware-accelerated animations
- **Efficient Updates** - Only updates changed content
- **Memory Management** - Proper cleanup and garbage collection
