# Career Roadmap App - Frontend

This is the frontend application for the Career Roadmap App, built with React Native and Material-UI (MUI).

## 🚀 Recent Updates

The application has been converted from React web components to React Native with Material-UI components, providing:
- **Cross-platform compatibility** with React Native
- **Modern UI components** from Material-UI
- **Consistent design system** across all pages
- **Responsive layouts** that work on mobile and web

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile development
- **Material-UI (MUI)** - React component library following Material Design
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Firebase** - Authentication and backend services

## 📱 Pages Converted

All pages have been converted to use React Native components with MUI styling:

1. **Home.jsx** - Landing page with career roadmaps, internships, events, and job openings
2. **Login.jsx** - User authentication with email/password and Google sign-in
3. **Signup.jsx** - User registration with form validation
4. **Profile.jsx** - User profile management and editing
5. **Questionnaire.jsx** - AI-powered career assessment questionnaire

## 🎨 Material-UI Components Used

- **Layout**: `Box`, `Container`, `Grid`, `Paper`
- **Navigation**: `Tabs`, `Tab`, `Button`
- **Forms**: `TextField`, `Checkbox`, `FormControlLabel`
- **Feedback**: `Alert`, `CircularProgress`, `LinearProgress`
- **Data Display**: `Card`, `CardContent`, `Typography`, `Chip`, `Avatar`
- **Icons**: Material Design icons from `@mui/icons-material`

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📦 Key Dependencies

```json
{
  "@mui/material": "^5.15.6",
  "@mui/icons-material": "^5.15.6",
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "react-native": "^0.73.4",
  "react-native-web": "^0.19.10"
}
```

## 🎯 Features

### Home Page
- Interactive dashboard with tabs for different content types
- Career roadmaps with skill requirements
- Internship opportunities with company details
- Upcoming events and workshops
- Current job openings with salary information

### Authentication
- Email/password login and registration
- Google OAuth integration
- Form validation and error handling
- Responsive design for mobile and desktop

### Profile Management
- User profile editing
- Career interests and skills management
- Real-time updates with backend API

### AI Questionnaire
- Multi-step career assessment
- Progress tracking with visual indicators
- AI-powered career suggestions
- Restart functionality for new assessments

## 🔧 Development

### Component Structure
Each page follows a consistent pattern:
- React Native imports for cross-platform compatibility
- Material-UI components for consistent styling
- Responsive design with MUI's breakpoint system
- Form handling with MUI's form components

### Styling Approach
- **MUI System**: Uses MUI's `sx` prop for component styling
- **Responsive Design**: Leverages MUI's breakpoint system
- **Theme Consistency**: Follows Material Design principles
- **Custom Colors**: Brand-specific color schemes maintained

### State Management
- React hooks for local state management
- Context API for authentication state
- Axios for API communication
- Form validation with real-time feedback

## 📱 Mobile-First Design

The application is designed with mobile users in mind:
- Touch-friendly button sizes and spacing
- Responsive layouts that adapt to screen sizes
- Optimized navigation for mobile devices
- Consistent spacing and typography scales

## 🌐 Web Compatibility

While built with React Native, the app maintains web compatibility:
- React Native Web for cross-platform rendering
- Responsive design that works on all screen sizes
- Touch and mouse interaction support
- SEO-friendly routing and structure

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 📚 Additional Resources

- [Material-UI Documentation](https://mui.com/)
- [React Native Documentation](https://reactnative.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Test on both mobile and web platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
