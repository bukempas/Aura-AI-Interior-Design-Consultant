# Aura: AI Interior Design Consultant ✨

**Aura** is an interactive room makeover application that leverages the power of Google's Gemini models to reimagine your living spaces. Simply upload a photo of your room, and Aura will transform it into a variety of professional interior design styles.

![Aura Preview](https://picsum.photos/seed/interior/1200/600)

## 🚀 Key Features

- **AI Room Makeover**: Instantly transform your space into styles like Mid-Century Modern, Scandinavian, Industrial, Bohemian, and more.
- **Interactive Compare Slider**: Drag between your original photo and the AI-generated design to see the transformation in real-time.
- **AI Design Consultant**: A context-aware chat interface powered by Gemini 3 Pro that provides professional design advice and shoppable links.
- **Iterative Refinement**: Refine your design through natural language (e.g., "Make the rug blue" or "Add more plants") and see the visual updates instantly.
- **Responsive & Modern UI**: A sleek, high-performance interface built with React, Tailwind CSS, and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Animations**: motion (Framer Motion)
- **AI Models**:
  - `gemini-2.5-flash-image`: For high-fidelity image-to-image transformations.
  - `gemini-3-pro-preview`: For the intelligent design consultant and search-grounded advice.
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aura-ai-interior.git
   cd aura-ai-interior
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to `http://localhost:3000` in your browser.

## 📖 Usage

1. **Upload**: Click the upload area to select a photo of your room.
2. **Select Style**: Choose a design style from the carousel below the image.
3. **Compare**: Use the slider to compare the original and reimagined designs.
4. **Chat**: Use the chat interface on the right to ask questions or request specific changes to the design.

## 🛡️ Privacy

Your photos are processed securely via the Gemini API and are not stored permanently on our servers.

## 📄 License

This project is licensed under the Apache-2.0 License.
