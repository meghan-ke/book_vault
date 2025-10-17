# 📚 Book & Notes Vault

A modern, responsive personal digital library application for cataloging books and notes, tracking reading progress, and organizing content with advanced search capabilities.

## 🚀 Live Demo

Video Link: [https://youtu.be/S0Pu0_ZvqWs]
Deployment Github pages: [https://meghan-ke.github.io/book_vault/#dashboard]
Repo Link: [https://github.com/meghan-ke/book_vault.git]






Open `index.html` in your browser to view the application.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

## ✨ Features

### Core Functionality
- **Book Management**: Add, edit, and delete book entries
- **Notes System**: Create, edit, and organize personal notes
- **Reading Progress**: Track pages read and set weekly goals
- **Tag Organization**: Categorize books with custom tags
- **Advanced Search**: Regex-based search across titles, authors, and tags

### User Interface
- **Modern Design**: Clean, responsive interface with dark/light themes
- **Dashboard**: Visual statistics and reading progress charts
- **Library View**: Comprehensive book listing with search functionality
- **Notes Management**: Grid-based note organization with search
- **Settings**: Theme switching and data import/export

### Technical Features
- **Responsive Design**: Mobile-first approach with breakpoints
- **Local Storage**: Persistent data storage without backend
- **Modular Architecture**: Clean separation of concerns
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized rendering and smooth animations

## 🛠 Technologies Used

### Frontend
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Flexbox, Grid, Custom Properties, Animations
- **JavaScript (ES6+)**: Modules, Async/Await, Modern syntax
- **Chart.js**: Interactive data visualization

### Development Tools
- **Modular JavaScript**: ES6 modules for code organization
- **CSS Custom Properties**: Consistent theming system
- **Local Storage API**: Client-side data persistence
- **Fetch API**: Asynchronous data loading

## 📁 Project Structure

```
book_vault/
├── index.html              # Main application entry point
├── README.md               # Project documentation
├── seed.json              # Sample data for testing
├── styles/
│   └── main.css           # Main stylesheet with responsive design
└── scripts/
    ├── ui.js              # Main UI controller and event handling
    ├── state.js           # Application state management
    ├── storage.js          # Local storage operations
    ├── stats.js            # Statistics calculations
    ├── search.js           # Search functionality with regex
    ├── validators.js       # Input validation
    └── notes.js            # Notes management system
```

## 🚀 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/meghan-ke/book_vault.git
   cd book_vault
   ```

2. Open `index.html` in your browser:
   ```bash
   # Option 1: Direct file opening
   open index.html
   
   # Option 2: Using a local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📖 Usage

### Dashboard
- View reading statistics and progress
- Set and track weekly reading goals
- Monitor reading trends with interactive charts

### Library Management
- Add new books with title, author, pages, and tags
- Search books using regex patterns
- Edit or delete existing entries
- View comprehensive book listings

### Notes System
- Create and organize personal notes
- Search through note content
- Edit or delete notes as needed
- Grid-based layout for easy browsing

### Settings
- Switch between light and dark themes
- Import/export data as JSON
- Configure reading preferences

## 🔧 API Documentation

### State Management
```javascript
// Book operations
addBook(book)           // Add new book
deleteBook(index)       // Remove book by index
getBooks()              // Retrieve all books
setBooks(books)         // Replace book collection

// Notes operations
addNote(note)           // Create new note
updateNote(note)        // Update existing note
deleteNote(id)          // Remove note by ID
loadNotes()             // Get all notes
```

### Search Functionality
```javascript
// Regex-based search
searchBooks(query)      // Search books with regex support
// Supports patterns like: "fiction|mystery", "^The", ".*coffee.*"
```

### Storage Operations
```javascript
// Data persistence
loadSeed()              // Load sample data
exportBooks()           // Export data as JSON
importBooks(file)       // Import JSON data
```

## 📱 Screenshots

### Dashboard View
- Statistics cards showing total books, pages, and top tags
- Weekly reading goal tracker with progress visualization
- Interactive chart displaying reading trends over time

### Library Management
- Clean table layout with book information
- Advanced search functionality
- Action buttons for book management

### Notes System
- Grid-based note cards
- Search and filter capabilities
- Inline editing interface

### Responsive Design
- Mobile-optimized layouts
- Touch-friendly interactions
- Consistent experience across devices

## 🎯 Key Features Implementation

### Responsive Design
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-optimized interactions
- Consistent spacing system

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast themes

### Performance
- Efficient DOM manipulation
- Optimized rendering
- Smooth animations
- Minimal bundle size

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Ensure responsive design
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mwizerwa Keza Megane**
- Email: m.mwizerwa@alustudent.com
- GitHub: [@meghan-ke](https://github.com/meghan-ke)
- Project: [Book Vault Repository](https://github.com/meghan-ke/book_vault)

## 🙏 Acknowledgments

- Chart.js for data visualization
- Modern CSS techniques and best practices
- ES6+ JavaScript features
- Responsive design principles
- Accessibility guidelines (WCAG)

## 📊 Project Statistics

- **Lines of Code**: ~1,500+
- **Files**: 8 core files
- **Features**: 15+ implemented features
- **Browser Support**: All modern browsers
- **Responsive Breakpoints**: 4 (Mobile, Tablet, Desktop, Large Desktop)

---


*Built with ❤️ for book lovers and note-takers everywhere*


