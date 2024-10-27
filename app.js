// Original code references
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const answerDisplay = document.getElementById('answer-display');
const submitBtn = document.getElementById('submit-btn');
const userInput = document.querySelector('#user-input');
const fileInput = document.getElementById('file-input'); // New input for file uploads

// Function to speak text
function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1.2;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);

    // Display spoken text
    answerDisplay.textContent = text;
}

// Greet based on time of day
function wishMe() {
    const day = new Date();
    const hour = day.getHours();
    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Boss...");
    } else {
        speak("Good Evening sir...");
    }
}

// Initialize greeting on page load
window.addEventListener('load', () => {
    speak("Initializing JARVIS...");
    wishMe();
    console.log("App loaded successfully"); // Confirm app load
})

// Insert extracted text into the input field
function insertTextToInput(text) {
    userInput.value = text;
    speak("Text extracted successfully. Please verify before submitting.");
}

// File handling based on file type
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        speak("No file selected. Please upload a valid file.");
        return;
    }

    const fileType = file.type;
    if (fileType === "application/pdf") {
        readPDF(file);
    } else if (fileType === "text/plain") {
        readTextFile(file);
    } else if (fileType.startsWith("image/")) {
        readImageFile(file);
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        readDocxFile(file);
    } else if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        readExcelFile(file);
    } else {
        speak("Unsupported file format.");
    }
});

// OCR for images using Tesseract.js
async function readImageFile(file) {
    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const { data: { text } } = await Tesseract.recognize(reader.result, 'eng', {
                logger: m => console.log(m) // Optional logger
            });
            insertTextToInput(text);
        } catch (error) {
            console.error("Error during OCR:", error);
            speak("Error reading the text from the image.");
        }
    };
    reader.readAsDataURL(file);
}

// Text file reader
function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const text = reader.result;
        insertTextToInput(text);
    };
    reader.readAsText(file);
}

// PDF file reader using PDF.js
async function readPDF(file) {
    const reader = new FileReader();
    reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let pdfText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            pdfText += pageText + "\n";
        }
        insertTextToInput(pdfText);
    };
    reader.readAsArrayBuffer(file);
}

// DOCX file reader using mammoth.js
function readDocxFile(file) {
    const reader = new FileReader();
    reader.onload = async () => {
        const arrayBuffer = reader.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(result => {
                const text = result.value;
                insertTextToInput(text);
            })
            .catch(err => {
                console.error("Error reading DOCX file:", err);
                speak("Error reading the Word document.");
            });
    };
    reader.readAsArrayBuffer(file);
}

// Excel file reader using SheetJS
function readExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        let excelText = "";

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const sheetText = XLSX.utils.sheet_to_csv(sheet); // Convert to CSV for easier reading
            excelText += sheetText + "\n";
        });
        insertTextToInput(excelText);
    };
    reader.readAsArrayBuffer(file);
}

// Voice recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    clearTimeout(timeout); // Clear timeout if speech is detected
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};

// Event listener for manual text input submission
submitBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        takeCommand(message); // Process the command
    } else {
        speak("Please enter or upload some text.");
    }
});

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();

    // Set timeout to prompt user if no speech is detected
    timeout = setTimeout(() => {
        speak("Please say something, I didn't hear you.");
    }, 7000);
});

// Command processing
function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello') || message.includes('yooo') || message.includes('sup')) {
        speak("Hello Sir, How May I Help You");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("when is star legend event starting")) {
        speak("Star Legends event starts on 24/10/2024 which is Thursday" );
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (message.includes("open instagram")) {
        window.open("https://instagram.com", "_blank");
        speak("Opening Instagram...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "This is what I found on the internet regarding " + message;
        speak(finalText);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace(" ", "+")}`, "_blank");
        const finalText = "This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak("The time is " + time);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        speak("Today's date is " + date);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        speak("Opening Calculator");
    } else {
        speak("Sorry, I didn't understand that.");
    }
}
