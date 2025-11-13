# IMGtoCal

A web application that extracts text from images using OCR technology and converts detected event information into Google Calendar entries.

## Overview

IMGtoCal simplifies the process of digitizing event information from physical documents, screenshots, or images. Upload an image containing event details, and the application will automatically extract the text, identify event information, and optionally push the events directly to your Google Calendar.

<img width="1706" height="959" alt="Screenshot 2025-11-12 at 11 02 51 PM" src="https://github.com/user-attachments/assets/119cc5c4-6d25-4d92-8af6-ce374e937db3" />


## The Problem

Event information often comes in various formats: posters, flyers, screenshots, or printed schedules. Manually transcribing this information into your calendar is time-consuming and error-prone. IMGtoCal automates this process by combining optical character recognition (OCR) with AI-powered event parsing to streamline event creation.

## Features

- **Image to Text Extraction**: Upload images in JPG or PNG format (up to 5MB) and extract text using OCR technology
- **Copy-able Text Output**: View and copy extracted text for any use
- **AI-Powered Event Parsing**: Optional AI analysis to detect and structure event information (name, description, date, time)
- **Google Calendar Integration**: Push parsed events directly to your Google Calendar (requires authentication)
- **Manual Event Creation**: Create calendar events manually with a built-in form interface
- **No Sign-In Required**: Core OCR and text extraction features work without authentication
- **Modern Dark UI**: Clean, professional interface with black and grey color scheme

## Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **React Dropzone** - Drag-and-drop file upload
- **React DateTime Picker** - Date and time selection components
- **Tesseract.js 4.1.1** - Client-side OCR (Optical Character Recognition)

### Backend Services
- **OpenAI GPT-3.5 API** - Natural language processing for event parsing
- **Supabase Auth** - Authentication provider with OAuth support
- **Google Calendar API** - Calendar integration for event creation

### Styling
- **Custom CSS** - Jost font family with black/grey color palette
- **4px border radius** - Consistent modern design language

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/IMGtocal.git
cd IMGtocal
```

2. Install dependencies:
```bash
cd client
npm install
```

3. Set up environment variables:
Create a `.env` file in the client directory with:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage

### Extract Text from Images (No Sign-In Required)
1. Navigate to the "Upload Image" tab
2. Drag and drop an image or click to browse
3. View the extracted text
4. Click "Copy Text" to copy the extracted content

### Parse Events with AI (Optional)
1. After extracting text, click "Parse Events with AI"
2. Review the detected events
3. Sign in with Google to push events to your calendar

### Manual Event Creation (Requires Sign-In)
1. Navigate to the "Manual Input" tab
2. Sign in with your Google account
3. Fill in event details (name, description, start time, end time)
4. Click "Create Event" to add to your Google Calendar

## Project Structure

```
IMGtocal/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventBox.js        # Event card component
│   │   │   ├── ImageUpload.js     # Main upload and OCR logic
│   │   │   ├── ManualInput.js     # Manual event form
│   │   │   └── UploadArea.js      # Drag-and-drop upload zone
│   │   ├── App.js                 # Main application component
│   │   ├── App.css                # Application styles
│   │   └── index.js               # Application entry point
│   └── package.json
├── LICENSE
└── README.md
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Telmen Bayarbaatar

## Acknowledgments

- Tesseract.js for providing client-side OCR capabilities
- OpenAI for natural language processing
- Supabase for authentication infrastructure
- Google Calendar API for calendar integration
