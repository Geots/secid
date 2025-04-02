# SecId - Secure Identity Generator

A powerful tool for generating random user profiles and managing temporary email addresses for testing and development purposes.

## Features

### Random Data Generation
- Generate realistic user profiles with names, addresses, and contact information
- Customizable options for gender, country, and language
- Option to include avatar images
- Multilingual support for generating data in different languages

### Temporary Email Management
- Generate disposable email addresses
- Check inbox for incoming messages
- Read email contents
- Delete unwanted messages
- Perfect for testing email verification flows

### Data Export
- Export generated profiles in multiple formats:
  - JSON
  - CSV
  - SQL
  - XML
- Easy integration with other systems and databases

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/secid.git
cd secid
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Generating Profiles
1. Use the "Generate Profile" section to customize your profile generation options
2. Select gender, country, and other preferences
3. Click "Generate Profile" to create a new profile
4. Generated profiles will appear in the grid below

### Managing Temporary Emails
1. Click "Generate New Email" to create a temporary email address
2. Use this email for testing verification flows
3. Check the inbox for incoming messages
4. Read or delete messages as needed

### Exporting Data
1. Generate one or more profiles
2. Choose your preferred export format
3. Click the export button to download the data

## API Integration

The tool uses the following APIs:
- [Faker.js](https://fakerjs.dev/) for generating random data
- [1SecMail API](https://www.1secmail.com/api/v1/) for temporary email management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
