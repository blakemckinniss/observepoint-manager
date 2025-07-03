# ObservePoint Web Interface

A modern web interface for managing ObservePoint Web Journeys, actions, and rules through the ObservePoint API.

## Features

- **Web Journey Management**: View, create, edit, and delete web journeys
- **Action Management**: Add, edit, remove, and reorder actions within journeys
- **Journey Execution**: Run journeys and monitor their status
- **Results Viewing**: Check the results from completed journeys
- **Rule Management**: Create and manage validation rules for journeys
- **Real-time Updates**: Live status updates for running journeys

## Tech Stack

- **React** with TypeScript for type-safe development
- **Vite** for fast development and building
- **Tailwind CSS v4** with zero-configuration and CSS-first approach
- **React Query** for efficient data fetching and caching
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

## Setup

1. Clone the repository:
   ```bash
   cd observepoint-web-interface
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

5. Configure your ObservePoint API key:
   - Click the Settings icon in the top-right corner
   - Enter your ObservePoint API key
   - The key will be validated and stored securely in your browser's localStorage
   - You can find your API key at https://app.observepoint.com/my-profile

   Alternatively, you can set your API key via environment variable:
   - Copy `.env.example` to `.env`
   - Uncomment and set `VITE_OBSERVEPOINT_API_KEY=your_api_key_here`

## Configuration

The application can be configured in two ways:

### 1. In-App Configuration (Recommended)
- Navigate to the Settings page (gear icon in top-right)
- Enter your ObservePoint API key
- The key is validated and stored securely in localStorage
- No server-side storage - your key stays in your browser

### 2. Environment Variables
- `VITE_OBSERVEPOINT_API_KEY`: Your ObservePoint API key (optional)
- `VITE_OBSERVEPOINT_API_BASE_URL`: API base URL (defaults to https://api.observepoint.com/v2)

Note: API keys configured in the app take precedence over environment variables.

## Usage

### Web Journeys

The application is configured to work with specific web journeys:
- Journey ID: 493257
- Journey ID: 478548

From the Web Journeys page, you can:
- View journey details and status
- Run journeys with a single click
- Edit journey configurations
- Manage journey actions

### Actions

Within each journey, you can:
- Add new actions (click, navigate, input, wait, scroll, JavaScript)
- Edit existing actions
- Reorder actions
- Delete actions

### Rules

Create validation rules to ensure your journeys work correctly:
- Tag presence/absence checks
- Variable value validation
- Network request verification
- Custom JavaScript rules

## API Integration

The application uses the ObservePoint REST API v2. Key endpoints include:

- `/web-journeys` - Manage web journeys
- `/web-journeys/{id}/actions` - Manage journey actions
- `/web-journeys/{id}/run` - Execute journeys
- `/web-journeys/{id}/runs` - View journey runs
- `/rules` - Manage validation rules

## Development

### Project Structure

```
src/
├── api/          # API client and configuration
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── pages/        # Page components
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Security Notes

- API keys are stored locally in your browser's localStorage
- Keys are never sent to any server except ObservePoint's API
- Never commit your API key to version control
- The `.env` file is gitignored by default
- Always use HTTPS in production
- Consider implementing additional authentication layers
- Users can manage their own API keys through the Settings page

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly set in the `.env` file
- Verify the API key has the necessary permissions

### CORS Issues
- The ObservePoint API should allow CORS requests
- If issues persist, consider using a proxy server

### Rate Limiting
- The API client includes automatic retry logic
- Implement appropriate error handling for 429 responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.