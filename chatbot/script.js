// DOM Elements
const floatingBtn = document.getElementById("floatingBtn");
const chatContainer = document.getElementById("chatContainer");
const overlay = document.getElementById("overlay");
const sendBtn = document.getElementById("send-btn");
const clearBtn = document.getElementById("clear-btn");
const textOutput = document.getElementById("text-output");
const conversation = document.getElementById("conversation");
const statusBar = document.getElementById("status-bar");
const statusText = document.getElementById("status-text");
const apiBtn = document.getElementById("api-btn");
const apiModal = document.getElementById("api-modal");
const apiKeyInput = document.getElementById("api-key-input");
const saveApiBtn = document.getElementById("save-api-btn");
const clearApiBtn = document.getElementById("clear-api-btn");
const languageSelect = document.getElementById("language-select");

// Language Texts
const languageTexts = {
  "bn-BD": {
    ready: "প্রস্তুত",
    processing: "প্রক্রিয়াকরণ হচ্ছে...",
    placeholder: "টাইপ করুন...",
    send: "পাঠান",
    greeting: "হ্যালো! আমি আপনাকে কিভাবে সাহায্য করতে পারি?",
    noAnswer: "দুঃখিত, আমি আপনার প্রশ্নের উত্তর খুঁজে পাইনি। অনুগ্রহ করে অন্য ভাবে প্রশ্নটি করুন।"
  },
  "en-US": {
    ready: "Ready",
    processing: "Processing...",
    placeholder: "Type your message...",
    send: "Send",
    greeting: "Hello! How can I assist you today?",
    noAnswer: "Sorry, I couldn't find an answer to your question. Please try rephrasing."
  },
  "mixed": {
    ready: "প্রস্তুত/Ready",
    processing: "প্রক্রিয়াকরণ/Processing...",
    placeholder: "টাইপ করুন/Type...",
    send: "পাঠান/Send",
    greeting: "হ্যালো/Hello! How can I help you today?",
    noAnswer: "দুঃখিত/Sorry, I couldn't find an answer. অনুগ্রহ করে/Please try again."
  }
};

// E-commerce FAQ Dataset
const faqData = [
  { question: "আমি কীভাবে অর্ডার করতে পারি?", answer: "পণ্য পেজে 'কার্টে যোগ করুন' ক্লিক করে চেকআউট সম্পন্ন করুন।" },
  { question: "পেমেন্ট অপশন কী?", answer: "বিকাশ, নগদ, কার্ড এবং ক্যাশ অন ডেলিভারি গ্রহণযোগ্য।" },
  { question: "ডেলিভারি সময় কত?", answer: "ঢাকার ভিতরে ১-২ দিন, অন্যান্য এলাকায় ৩-৫ কার্যদিবস।" },
  { question: "অর্ডার ট্র্যাক কিভাবে করব?", answer: "আপনার অ্যাকাউন্টে অর্ডার হিষ্ট্রি থেকে ট্র্যাক করতে পারবেন।" },
  { question: "রিটার্ন পলিসি কী?", answer: "পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।" },
  { question: "ওয়ারেন্টি ক্লেইম করব কিভাবে?", answer: "কাস্টমার কেয়ারে প্রুফ অফ পার্চেজ সহ যোগাযোগ করুন।" },
  { question: "ডেলিভারি চার্জ কত?", answer: "ঢাকায় ৬০ টাকা, বিভাগীয় শহরে ১২০ টাকা।" },
  { question: "কাস্টমার কেয়ারে যোগাযোগ কিভাবে?", answer: "০৯৬৩৮১১১৬৬৬ নম্বরে কল করুন অথবা help@eshop.com.bd তে ইমেইল করুন।" }
];

// Configuration
const OPENAI_MODEL = "gpt-4";
let OPENAI_API_KEY = localStorage.getItem('openai_api_key') || "";
let currentLanguage = "bn-BD";
let isChatVisible = false;

// Initialize
apiKeyInput.value = OPENAI_API_KEY;
updateLanguageUI(currentLanguage);

// Toggle Chat Visibility
floatingBtn.addEventListener("click", toggleChat);
overlay.addEventListener("click", toggleChat);

function toggleChat() {
  isChatVisible = !isChatVisible;
  if (isChatVisible) {
    chatContainer.classList.add("visible");
    overlay.classList.add("visible");
    floatingBtn.innerHTML = '<i class="fas fa-times"></i>';
    floatingBtn.style.transform = 'scale(1.1) rotate(90deg)';
  } else {
    chatContainer.classList.remove("visible");
    overlay.classList.remove("visible");
    floatingBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
    floatingBtn.style.transform = '';
  }
}

// FAQ Matching Function
function findFAQAnswer(question) {
  const q = question.toLowerCase().trim();
  
  // Exact match check
  const exactMatch = faqData.find(item => 
    item.question.toLowerCase() === q
  );
  if (exactMatch) return exactMatch.answer;
  
  // Keyword matching for common questions
  const keywords = {
    "অর্ডার|order": "পণ্য পেজে 'কার্টে যোগ করুন' ক্লিক করে চেকআউট সম্পন্ন করুন।",
    "পেমেন্ট|payment": "বিকাশ, নগদ, কার্ড এবং ক্যাশ অন ডেলিভারি গ্রহণযোগ্য।",
    "ডেলিভারি|delivery": "ঢাকার ভিতরে ১-২ দিন, অন্যান্য এলাকায় ৩-৫ কার্যদিবস।",
    "ট্র্যাক|track": "আপনার অ্যাকাউন্টে অর্ডার হিষ্ট্রি থেকে ট্র্যাক করতে পারবেন।",
    "রিটার্ন|return": "পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।",
    "ওয়ারেন্টি|warranty": "কাস্টমার কেয়ারে প্রুফ অফ পার্চেজ সহ যোগাযোগ করুন।",
    "চার্জ|charge": "ঢাকায় ৬০ টাকা, বিভাগীয় শহরে ১২০ টাকা।",
    "যোগাযোগ|contact": "০৯৬৩৮১১১৬৬৬ নম্বরে কল করুন অথবা help@eshop.com.bd তে ইমেইল করুন।"
  };
  
  for (const [key, answer] of Object.entries(keywords)) {
    if (new RegExp(key, "i").test(q)) {
      return answer;
    }
  }
  
  return null;
}

// Modified sendToAI function
// Enhanced FAQ Matching with NLP-like understanding
function findFAQAnswer(userQuestion) {
  const question = userQuestion.toLowerCase().trim();
  
  // Common question patterns and their answers
  const questionPatterns = [
    {
      patterns: ["অর্ডার করব কিভাবে|how to order|order korbo kivabe|kichu kinte chai"],
      answer: "আপনি আমাদের ওয়েবসাইটে পণ্য নির্বাচন করে 'কার্টে যোগ করুন' বাটনে ক্লিক করতে পারেন। এরপর চেকআউট পেজে আপনার ঠিকানা ও পেমেন্ট তথ্য প্রদান করে অর্ডার সম্পন্ন করুন।"
    },
    {
      patterns: ["পেমেন্ট অপশন|payment option|kichu payment system|কিভাবে পেমেন্ট করব"],
      answer: "আমরা বিকাশ, নগদ, রকেট, ক্রেডিট/ডেবিট কার্ড এবং ক্যাশ অন ডেলিভারি (COD) পেমেন্ট অপশন গ্রহণ করি।"
    },
    {
      patterns: ["ডেলিভারি কত দিন লাগে|delivery time|product pite koto din lagbe"],
      answer: "সাধারণত ঢাকার ভিতরে ১-২ কার্যদিবস এবং ঢাকার বাইরে ৩-৫ কার্যদিবস সময় লাগে। বিশেষ ক্ষেত্রে এটি পরিবর্তিত হতে পারে।"
    },
    {
      patterns: ["অর্ডার ট্র্যাক|track my order|order kothay dekhabe"],
      answer: "আপনি আমাদের ওয়েবসাইটে 'আমার অর্ডার' সেকশনে গিয়ে অথবা আপনার অর্ডার নম্বর ব্যবহার করে অর্ডার ট্র্যাক করতে পারবেন।"
    },
    {
      patterns: ["প্রোডাক্ট রিটার্ন|return policy|product ferot dite chai"],
      answer: "আপনি পণ্য গ্রহণের ৭ দিনের মধ্যে রিটার্ন করতে পারবেন, শর্ত থাকে যে পণ্য অপরিবর্তিত অবস্থায় এবং আসল প্যাকেজিংয়ে থাকতে হবে।"
    }
  ];

  // Check for direct matches first
  const directMatch = faqData.find(item => 
    item.question.toLowerCase() === question
  );
  if (directMatch) return directMatch.answer;

  // Check for pattern matches
  for (const pattern of questionPatterns) {
    for (const pat of pattern.patterns) {
      if (new RegExp(pat, "i").test(question)) {
        return pattern.answer;
      }
    }
  }

  // If no match found, try to generate from similar questions
  const similarQuestions = faqData.filter(item => 
    question.includes(item.question.substring(0, 10).toLowerCase()) || 
    item.question.toLowerCase().includes(question.substring(0, 5))
  );

  if (similarQuestions.length > 0) {
    return similarQuestions[0].answer;
  }

  return null;
}

// Enhanced Greeting Message
const professionalGreetings = {
  "bn-BD": "প্রিয় গ্রাহক, শুভেচ্ছা নিন। আমরা কিভাবে আপনাকে সাহায্য করতে পারি? আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ।",
  "en-US": "Dear customer, warm greetings. How may we assist you today? Thank you for contacting us.",
  "mixed": "প্রিয় গ্রাহক/Dear customer, শুভেচ্ছা নিন/Greetings. আমরা কিভাবে আপনাকে সাহায্য করতে পারি?/How may we assist you?"
};

// Update initialization to use professional greeting
function updateLanguageUI(lang) {
  currentLanguage = lang;
  statusText.textContent = getText("ready");
  textOutput.placeholder = getText("placeholder");
  sendBtn.querySelector("span").textContent = getText("send");
  
  // Update greeting with professional message
  if (conversation.children.length === 1) {
    conversation.innerHTML = `
      <div class="flex justify-start">
        <div class="bg-gray-600 rounded-lg p-2 md:p-3 max-w-xs">
          <p class="text-xs md:text-sm">${professionalGreetings[currentLanguage]}</p>
        </div>
      </div>
    `;
  }
}

// Modified sendToAI function with enhanced understanding
async function sendToAI() {
  const message = textOutput.value.trim();
  if (!message) return;
  
  // Add user message to conversation
  addMessageToConversation(message, "user");
  textOutput.value = "";
  
  // First check FAQ with enhanced matching
  const faqAnswer = findFAQAnswer(message);
  if (faqAnswer) {
    addMessageToConversation(faqAnswer, "assistant");
    return;
  }
  
  // If no FAQ match, proceed with API call
  if (!OPENAI_API_KEY) {
    updateStatus(getText("noAnswer"), "error");
    apiModal.classList.remove("hidden");
    return;
  }
  
  updateStatus(getText("processing"), "processing");
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: currentLanguage === "bn-BD" ? 
              "আপনি একজন পেশাদার ই-কমার্স সহায়ক। ব্যবহারকারীর প্রশ্নের সংক্ষিপ্ত, স্পষ্ট এবং বন্ধুত্বপূর্ণ উত্তর দিন। উত্তর ২-৩ বাক্যের মধ্যে সীমাবদ্ধ রাখুন।" :
              currentLanguage === "mixed" ?
              "You are a professional e-commerce assistant. Provide concise, clear and friendly answers to user questions in a mix of Bengali and English. Keep responses to 2-3 sentences." :
              "You are a professional e-commerce assistant. Provide concise, clear and friendly answers in 2-3 sentences."
          },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    if (!response.ok) throw new Error("API request failed");
    
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || getText("noAnswer");
    addMessageToConversation(aiResponse, "assistant");
    
  } catch (error) {
    addMessageToConversation(getText("noAnswer"), "error");
    console.error("Error:", error);
  }
  
  updateStatus(getText("ready"), "ready");
}
// Helper Functions
function getText(key) {
  return languageTexts[currentLanguage][key] || key;
}

function updateLanguageUI(lang) {
  currentLanguage = lang;
  statusText.textContent = getText("ready");
  textOutput.placeholder = getText("placeholder");
  sendBtn.querySelector("span").textContent = getText("send");
  
  // Update greeting if conversation is empty
  if (conversation.children.length === 1) {
    conversation.innerHTML = `
      <div class="flex justify-start">
        <div class="bg-gray-600 rounded-lg p-2 md:p-3 max-w-xs">
          <p class="text-xs md:text-sm">${getText("greeting")}</p>
        </div>
      </div>
    `;
  }
}

function updateStatus(message, type) {
  const statusIcon = statusBar.querySelector("i");
  let iconClass = "fas fa-circle";
  let iconColor = "text-gray-500";
  
  if (type === "error") {
    iconClass = "fas fa-exclamation-circle";
    iconColor = "text-yellow-500";
  } else if (type === "processing") {
    iconClass = "fas fa-circle-notch fa-spin";
    iconColor = "text-blue-500";
  }
  
  statusIcon.className = `${iconClass} ${iconColor}`;
  statusText.textContent = message;
}

function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (key && key.startsWith("sk-")) {
    OPENAI_API_KEY = key;
    localStorage.setItem('openai_api_key', key);
    apiModal.classList.add("hidden");
    updateStatus(getText("ready"), "ready");
  } else {
    alert(currentLanguage === "bn-BD" ? 
      "অনুগ্রহ করে একটি বৈধ OpenAI API কী লিখুন ('sk-' দিয়ে শুরু)" :
      "Please enter a valid OpenAI API key (starting with 'sk-')");
  }
}

function clearApiKey() {
  OPENAI_API_KEY = "";
  localStorage.removeItem('openai_api_key');
  apiKeyInput.value = "";
  updateStatus(getText("ready"), "ready");
}

function addMessageToConversation(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `flex ${sender === "user" ? "justify-end" : "justify-start"}`;
  
  const bubble = document.createElement("div");
  let bubbleClass = "rounded-lg p-2 md:p-3 max-w-xs";
  
  if (sender === "user") {
    bubbleClass += " bg-indigo-500 text-white";
  } else if (sender === "error") {
    bubbleClass += " bg-red-500 text-white";
  } else {
    bubbleClass += " bg-gray-600";
  }
  
  bubble.className = bubbleClass;
  bubble.innerHTML = `<p class="text-xs md:text-sm">${message.replace(/\n/g, "<br>")}</p>`;
  
  messageDiv.appendChild(bubble);
  conversation.appendChild(messageDiv);
  conversation.scrollTop = conversation.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener("click", sendToAI);
clearBtn.addEventListener("click", () => {
  textOutput.value = "";
});

apiBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  apiModal.classList.toggle("hidden");
});

saveApiBtn.addEventListener("click", saveApiKey);
clearApiBtn.addEventListener("click", clearApiKey);

document.addEventListener("click", (e) => {
  if (!apiModal.contains(e.target) && e.target !== apiBtn) {
    apiModal.classList.add("hidden");
  }
});

// Language Selector
languageSelect.addEventListener("change", (e) => {
  currentLanguage = e.target.value;
  updateLanguageUI(currentLanguage);
});