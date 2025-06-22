# Bias-Buster-Extension

Bias Buster is a browser extension that helps you identify political bias, sentiment, and emotionally charged language in news articles and social media posts as you browse the web.

## Features
- Analyzes the main content of the current web page for political bias and sentiment.
- Detects emotionally charged language.
- Provides a bias label, score, and confidence level in a user-friendly popup.
- Allows you to copy or clear analysis results easily.
- Offers improved accessibility and error handling.

## How It Works
1. Click the extension icon and then "Analyze This Page" in the popup.
2. The extension extracts the main text from the page and sends it to a Python backend for analysis.
3. The backend returns the bias analysis, which is displayed in the popup.

## Requirements
- Python 3.x
- Flask (for the backend server)
- Chrome or Chromium-based browser (for the extension)

## Setup
1. Clone this repository.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```bash
   python app.py
   ```
4. Load the `bias-buster-extension` folder as an unpacked extension in your browser's extensions page.

## Usage
- Navigate to any news article or social media post.
- Click the extension icon and then "Analyze This Page".
- View the bias analysis, copy results, or clear them as needed.

## License
MIT
