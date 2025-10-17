# Blackjack Basic Strategy Trainer

An Angular application designed to help users learn and practice optimal blackjack strategy through interactive drills, flashcards, and strategy charts.

[![Angular](https://img.shields.io/badge/Built%20with-Angular%2020-DD0031)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Blackjack Basic Strategy Trainer Screenshot](src/assets/screenshots/app-preview.png)

## Features

- **Strategy Charts**: Visual representation of optimal blackjack decisions based on your hand and the dealer's up card
- **Interactive Drills**: Practice making the right decision in randomly generated scenarios
- **Flashcard System**: Spaced repetition learning with SM-2 inspired algorithm for efficient memorization
- **Customizable Rules**: Support for different rule variations:
  - Dealer hits/stands on soft 17 (H17/S17)
  - Double after split (DAS)
  - Late surrender option
  - Multiple deck configurations (1-8 decks)
- **Performance Analytics**: Track your progress with detailed statistics on your weakest scenarios and decision trends
- **Keyboard Shortcuts**: Fast gameplay with keyboard controls (H, S, D, P, R) for Hit, Stand, Double, sPlit, and suRrender
- **Progressive Web App**: Fully offline capable with local storage for progress tracking
- **Accessibility Features**: WCAG compliant with keyboard navigation, ARIA attributes, and focus management

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)

### Installation

```bash
# Clone the repository
git clone https://github.com/craigmcginnis/BlackjackBasicStrategy.git

# Navigate to project directory
cd BlackjackBasicStrategy

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start
```

Visit `http://localhost:4200/` in your browser. The application will automatically reload when you make changes to the source files.

### Building for Production

```bash
# Build optimized production version
npm run build:prod

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in CI mode with code coverage
npm run test:ci
```

## Project Structure

- `src/app/core/` - Core services, models, and directives
- `src/app/features/` - Feature modules (drill, flashcards, strategy chart, settings, analytics)
- `src/styles/` - Global design tokens and styling utilities
- `src/assets/` - Static assets like images and icons

## Design Approach

This project follows a design token approach with BEM naming conventions for components. See [STYLE-MIGRATION.md](STYLE-MIGRATION.md) for detailed styling guidelines and the token system.

## Development Status

See [CHANGELOG.md](CHANGELOG.md) for release history and [SDLC.md](SDLC.md) for development roadmap.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [The Wizard of Odds](https://wizardofodds.com/games/blackjack/strategy/calculator/) for blackjack strategy calculations
- Angular team for their excellent framework and tools
