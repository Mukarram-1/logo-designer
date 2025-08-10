import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// This is a simple AI-powered icon generator
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    try {
      // Use Groq AI to suggest an appropriate icon based on the prompt
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an AI that suggests appropriate icons and text for logos based on text prompts.
            Analyze the user's prompt carefully for any styling preferences they mention.
            
            Respond in JSON format with the following properties:
            1. "icon": The name of a Lucide icon that best matches the prompt. All icon names should end with 'Icon'.
            2. "text": A short brand name or slogan (1-3 words) that would work well with this icon in a logo.
            3. "textColor": A hex color code for the text based on the prompt.
            4. "fontSize": A number representing text size (16-48) based on the prompt, or 24 if not specified.
            5. "iconColor": A hex color code for the icon based on the promp.
            6. "backgroundColor": A hex color for the background based on the prompt, or empty if not specified.
            7. "iconSize": A number representing icon size (32-512) based on the prompt, or 200 if not specified.
            8. "borderRadius": A number (0-100) for background corner radius, or 32 if not specified.
            
            Example response:
            { 
              "icon": "ShoppingCartIcon", 
              "text": "Quick Cart", 
              "textColor": "#ffffff", 
              "fontSize": 24, 
              "iconColor": "#ffffff", 
              "backgroundColor": "#2C8C99",
              "iconSize": 200,
              "borderRadius": 32
            }
            
            Choose from popular Lucide icons that are likely to exist in the library.
            When considering styling, try to match what the user is requesting while ensuring good readability and aesthetics.`
          },
          {
            role: "user",
            content: prompt
          },
        ],
        model: "deepseek-r1-distill-llama-70b",
      });
      
      // Extract the icon suggestion from the AI response
      const responseText = response.choices[0]?.message?.content?.trim() || "";
      // console.log("AI Response in backend:", responseText);
      
      let iconName = "ZapIcon";
      let logoText = "";
      
      try {
        // Try to parse the response as JSON
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (error) {
          console.log('Response is not in JSON format, extracting with regex:', error);
          
          // Try to find JSON object in the response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedResponse = JSON.parse(jsonMatch[0]);
            } catch (jsonError) {
              console.error('Failed to parse extracted JSON:', jsonError);
              throw new Error('Failed to parse JSON from response');
            }
          } else {
            throw new Error('No JSON object found in response');
          }
        }
        
        iconName = parsedResponse.icon || "ZapIcon";
        logoText = parsedResponse.text || "";
        
        // Extract additional styling properties if available
        const textColor = parsedResponse.textColor || "#ffffff";
        const fontSize = parsedResponse.fontSize || 24;
        const iconColor = parsedResponse.iconColor || "#ffffff";
        const backgroundColor = parsedResponse.backgroundColor || "";
        const iconSize = parsedResponse.iconSize || 200;
        const borderRadius = parsedResponse.borderRadius || 32;
        
        // Use the AI-provided values (no need to analyze prompt again here)
        
        return NextResponse.json({ 
          iconName,
          logoText,
          textColor,
          fontSize,
          iconColor,
          backgroundColor,
          iconSize,
          borderRadius,
          success: true
        });
      } catch (parseError) {
        // If parsing fails, try to extract the icon name from the text response
        console.error('Failed to parse AI response:', parseError);
        console.log('Response text:', responseText);
        
        // Try multiple regex patterns to extract information
        
        // Try to extract icon name using regex for different patterns
        const iconPatterns = [
          /["']?icon["']?\s*[:=]\s*["']([^"']+)["']/i,
          /icon:?\s*([A-Z][a-zA-Z]+)/i,
          /icon\s+(?:is|should\s+be)\s+(?:a|the)?\s*([A-Z][a-zA-Z]+)/i,
          /([A-Z][a-zA-Z]+Icon)/i,
          /I\s+suggest\s+(?:a|the)?\s*([A-Z][a-zA-Z]+)/i
        ];
        
        for (const pattern of iconPatterns) {
          const match = responseText.match(pattern);
          if (match && match[1]) {
            iconName = match[1].trim();
            if (!iconName.endsWith("Icon")) {
              iconName = iconName + "Icon";
            }
            break;
          }
        }
        
        // Try to extract text similarly with different patterns
        const textPatterns = [
          /["']?text["']?\s*[:=]\s*["']([^"']+)["']/i,
          /text:?\s*["']?([^"'\n]+)["']?/i,
          /text\s+(?:is|should\s+be)\s+["']?([^"'\n.]+)["']?/i,
          /slogan:?\s*["']?([^"'\n]+)["']?/i,
          /brand\s+name:?\s*["']?([^"'\n]+)["']?/i,
          /name:?\s*["']?([^"'\n]+)["']?/i
        ];
        
        for (const pattern of textPatterns) {
          const match = responseText.match(pattern);
          if (match && match[1]) {
            logoText = match[1].trim();
            break;
          }
        }
        
        // If we still don't have text, try to extract any quoted text
        if (!logoText) {
          const quotedText = responseText.match(/["']([^"']{3,20})["']/);
          if (quotedText && quotedText[1]) {
            logoText = quotedText[1].trim();
          }
        }
      }
      
      // Ensure we have an icon name that likely exists in Lucide
      if (!iconName.endsWith("Icon") || iconName.length < 5) {
        iconName = "ZapIcon"; // Fallback to a known icon
      }
      
      // If we still don't have text, extract a name from the prompt
      if (!logoText) {
        const words = prompt.split(/\s+/);
        const importantWords = words.filter((word: string) => 
          word.length > 3 && 
          !['with', 'for', 'that', 'this', 'from', 'have', 'what', 'when', 'where', 'who', 'will', 'are', 'and', 'the'].includes(word.toLowerCase())
        );
        
        if (importantWords.length > 0) {
          logoText = importantWords
            .slice(0, Math.min(2, importantWords.length))
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        } else {
          logoText = "Brand";
        }
      }
      
      // Analyze the prompt for styling instructions
      const styleInfo = analyzePromptForStyles(prompt);
      
      return NextResponse.json({ 
        iconName: iconName,
        logoText: logoText,
        textColor: styleInfo.textColor,
        fontSize: styleInfo.fontSize,
        iconColor: styleInfo.iconColor,
        backgroundColor: styleInfo.backgroundColor,
        iconSize: styleInfo.iconSize,
        borderRadius: styleInfo.borderRadius,
        success: true
      });
    } catch (aiError) {
      console.error('Error using AI for icon generation:', aiError);
      // Fallback to keyword matching if AI fails
      const { iconName, logoText } = suggestIconAndTextForPrompt(prompt);
      // Analyze the prompt for styling instructions
      const styleInfo = analyzePromptForStyles(prompt);
      return NextResponse.json({ 
        iconName: iconName,
        logoText: logoText,
        textColor: styleInfo.textColor,
        fontSize: styleInfo.fontSize,
        iconColor: styleInfo.iconColor,
        backgroundColor: styleInfo.backgroundColor,
        iconSize: styleInfo.iconSize,
        borderRadius: styleInfo.borderRadius,
        success: true,
        usedFallback: true
      });
    }
  } catch (error) {
    console.error('Error in generate-icon API:', error);
    return NextResponse.json(
      { error: 'Failed to generate icon' },
      { status: 500 }
    );
  }
}

// Fallback function for keyword-based icon matching
function suggestIconAndTextForPrompt(prompt: string): { iconName: string; logoText: string } {
  // Existing keyword matching logic (kept as fallback)
  const promptLower = prompt.toLowerCase();
  const words = promptLower.split(/\s+/);
  
  // Extract potential brand names from the prompt
  const potentialNames: string[] = [];
  
  // Try to extract nouns or important words for the brand name
  const importantWords = words.filter(word => 
    word.length > 3 && 
    !['with', 'for', 'that', 'this', 'from', 'have', 'what', 'when', 'where', 'who', 'will', 'are', 'and', 'the'].includes(word)
  );
  
  if (importantWords.length > 0) {
    // Capitalize first letter of each word for brand name
    const brandName = importantWords
      .slice(0, Math.min(2, importantWords.length))
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    potentialNames.push(brandName);
  }
  
  // Add some default names based on keywords in the prompt
  const keywordToNames: Record<string, string[]> = {
    "shop": ["ShopEasy", "QuickBuy", "CartMart"],
    "store": ["StoreIt", "EasyShop", "BuyNow"],
    "food": ["TastyBite", "FoodFusion", "FlavorFix"],
    "tech": ["TechPro", "InnoTech", "DigiSmart"],
    "travel": ["TravelEase", "JourneyPro", "WanderWay"],
    "health": ["VitalCare", "HealthHub", "WellnessOne"],
    "finance": ["FinancePro", "MoneyWise", "WealthHub"],
    "education": ["LearnSmart", "EduHub", "BrainBoost"],
    "music": ["SoundWave", "MusicHub", "BeatBox"],
    "fitness": ["FitZone", "ActiveLife", "PowerFit"],
  };
  
  for (const [keyword, names] of Object.entries(keywordToNames)) {
    if (promptLower.includes(keyword)) {
      potentialNames.push(...names);
    }
  }
  
  // If no names found, add some generic ones
  if (potentialNames.length === 0) {
    potentialNames.push("BrandPro", "SmartLogo", "LogoMark", "IconBrand");
  }
  
  // Pick a random name
  const logoText = potentialNames[Math.floor(Math.random() * potentialNames.length)];
  
  // Rest of the existing code for icon selection
  // Simplified version of the keyword mapping
  const keywordToIcons: Record<string, string[]> = {
    // Nature & weather
    "sun": ["Sun", "Sunrise", "Sunset", "SunMedium"],
    "moon": ["Moon", "CloudMoon", "MoonStar"],
    "star": ["Star", "Stars", "Sparkles"],
    "cloud": ["Cloud", "CloudFog", "CloudRain", "CloudSnow"],
    "water": ["Droplets", "Waves", "Swim"],
    "fire": ["Flame", "Zap"],
    
    // Tech & computers
    "computer": ["Laptop", "Monitor", "Pc", "Server"],
    "phone": ["Smartphone", "Phone", "TabletSmartphone"],
    "camera": ["Camera", "Video"],
    "music": ["Music", "Headphones", "Radio"],
    
    // Communication & social
    "mail": ["Mail", "Mailbox", "AtSign"],
    "message": ["MessageSquare", "MessageCircle", "MessagesSquare"],
    "user": ["User", "UserCircle", "Users"],
    "heart": ["Heart", "HeartPulse"],
    
    // Navigation & time
    "map": ["Map", "MapPin", "Navigation"],
    "clock": ["Clock", "Timer", "Stopwatch"],
    "calendar": ["Calendar", "CalendarDays"],
    
    // Security & files
    "lock": ["Lock", "LockKeyhole", "Shield"],
    "file": ["File", "FileText", "FileCode"],
    "folder": ["Folder", "FolderOpen"],
    
    // Tools & settings
    "tool": ["Tool", "Wrench", "Hammer"],
    "setting": ["Settings", "Sliders"],
    
    // Transport & commerce
    "car": ["Car", "CarFront", "Truck"],
    "plane": ["Plane", "PlaneTakeoff"],
    "money": ["DollarSign", "CircleDollarSign", "Banknote"],
    "shop": ["ShoppingBag", "ShoppingCart"],
    
    // Misc
    "food": ["UtensilsCrossed", "Apple"],
    "health": ["Heart", "Activity", "Stethoscope"],
    "logo": ["Zap", "Star", "CircleDot", "Hexagon", "Diamond"],
  };
  
  // Scoring system for icon matching
  const iconScores: Record<string, number> = {};
  
  // Process each word in the prompt
  for (const word of words) {
    for (const [keyword, icons] of Object.entries(keywordToIcons)) {
      if (keyword === word || keyword.includes(word) || word.includes(keyword)) {
        const matchScore = keyword === word ? 3 : (keyword.includes(word) ? 2 : 1);
        icons.forEach(icon => {
          iconScores[icon] = (iconScores[icon] || 0) + matchScore;
        });
      }
    }
  }
  
  // Select an icon based on scores
  let selectedIconName: string;
  if (Object.keys(iconScores).length > 0) {
    const sortedIcons = Object.entries(iconScores)
      .sort((a, b) => b[1] - a[1])
      .map(([icon]) => icon);
    
    selectedIconName = sortedIcons[0];
  } else {
    // Fallback to default icons
    const defaultIcons = ["Star", "Circle", "Square", "Zap", "Diamond"];
    selectedIconName = defaultIcons[Math.floor(Math.random() * defaultIcons.length)];
  }
  
  // Return both the icon name and text
  return { 
    iconName: selectedIconName.endsWith("Icon") ? selectedIconName : `${selectedIconName}Icon`,
    logoText 
  };
}

// Function to analyze the prompt for styling information
function analyzePromptForStyles(prompt: string): { 
  textColor: string;
  fontSize: number;
  iconColor: string;
  backgroundColor: string;
  iconSize: number;
  borderRadius: number;
} {
  const promptLower = prompt.toLowerCase();
  
  // Default values
  let textColor = "#ffffff";
  let fontSize = 24;
  let iconColor = "#ffffff";
  let backgroundColor = "";
  let iconSize = 200;
  let borderRadius = 32;
  
  // Check for color mentions in text
  const textColorMatch = promptLower.match(/text (?:color|colour)(?: in| is| should be)? (black|white|red|blue|green|yellow|purple|pink|orange|gray|grey|gold|silver|teal|navy|brown)/i);
  if (textColorMatch) {
    const colorName = textColorMatch[1].toLowerCase();
    const colorMap: Record<string, string> = {
      black: "#000000", white: "#ffffff", red: "#ff0000", blue: "#0000ff",
      green: "#008000", yellow: "#ffff00", purple: "#800080", pink: "#ffc0cb",
      orange: "#ffa500", gray: "#808080", grey: "#808080", gold: "#ffd700",
      silver: "#c0c0c0", teal: "#008080", navy: "#000080", brown: "#a52a2a"
    };
    textColor = colorMap[colorName] || textColor;
  }
  
  // Check for hex color codes for text
  const hexTextColorMatch = promptLower.match(/text (?:color|colour)(?: in| is| should be)? (#[0-9a-f]{3,6})/i);
  if (hexTextColorMatch) {
    textColor = hexTextColorMatch[1];
  }
  
  // Check for font size mentions
  const fontSizeMatch = promptLower.match(/(?:font|text) size(?: is| should be)? (small|medium|large|extra large|tiny|huge)/i);
  if (fontSizeMatch) {
    const sizeMap: Record<string, number> = {
      tiny: 16, small: 20, medium: 24, large: 32, "extra large": 42, huge: 48
    };
    fontSize = sizeMap[fontSizeMatch[1].toLowerCase()] || fontSize;
  }
  
  // Check for numeric font size
  const numericFontSizeMatch = promptLower.match(/(?:font|text) size(?: is| should be)? (\d+)(px)?/i);
  if (numericFontSizeMatch) {
    const size = parseInt(numericFontSizeMatch[1]);
    if (size > 0 && size < 100) { // Reasonable range
      fontSize = size;
    }
  }
  
  // Check for icon color
  const iconColorMatch = promptLower.match(/icon (?:color|colour)(?: in| is| should be)? (black|white|red|blue|green|yellow|purple|pink|orange|gray|grey|gold|silver|teal|navy|brown)/i);
  if (iconColorMatch) {
    const colorName = iconColorMatch[1].toLowerCase();
    const colorMap: Record<string, string> = {
      black: "#000000", white: "#ffffff", red: "#ff0000", blue: "#0000ff",
      green: "#008000", yellow: "#ffff00", purple: "#800080", pink: "#ffc0cb",
      orange: "#ffa500", gray: "#808080", grey: "#808080", gold: "#ffd700",
      silver: "#c0c0c0", teal: "#008080", navy: "#000080", brown: "#a52a2a"
    };
    iconColor = colorMap[colorName] || iconColor;
  }
  
  // Check for hex color codes for icon
  const hexIconColorMatch = promptLower.match(/icon (?:color|colour)(?: in| is| should be)? (#[0-9a-f]{3,6})/i);
  if (hexIconColorMatch) {
    iconColor = hexIconColorMatch[1];
  }
  
  // Check for icon size
  const iconSizeMatch = promptLower.match(/icon size(?: is| should be)? (small|medium|large|extra large|tiny|huge)/i);
  if (iconSizeMatch) {
    const sizeMap: Record<string, number> = {
      tiny: 64, small: 128, medium: 200, large: 300, "extra large": 400, huge: 512
    };
    iconSize = sizeMap[iconSizeMatch[1].toLowerCase()] || iconSize;
  }
  
  // Check for numeric icon size
  const numericIconSizeMatch = promptLower.match(/icon size(?: is| should be)? (\d+)(px)?/i);
  if (numericIconSizeMatch) {
    const size = parseInt(numericIconSizeMatch[1]);
    if (size > 32 && size <= 512) { // Reasonable range
      iconSize = size;
    }
  }
  
  // Check for background color
  const bgColorMatch = promptLower.match(/(?:background|bg) (?:color|colour)(?: in| is| should be)? (black|white|red|blue|green|yellow|purple|pink|orange|gray|grey|gold|silver|teal|navy|brown)/i);
  if (bgColorMatch) {
    const colorName = bgColorMatch[1].toLowerCase();
    const colorMap: Record<string, string> = {
      black: "#000000", white: "#ffffff", red: "#ff0000", blue: "#0000ff",
      green: "#008000", yellow: "#ffff00", purple: "#800080", pink: "#ffc0cb",
      orange: "#ffa500", gray: "#808080", grey: "#808080", gold: "#ffd700",
      silver: "#c0c0c0", teal: "#008080", navy: "#000080", brown: "#a52a2a"
    };
    backgroundColor = colorMap[colorName] || backgroundColor;
  }
  
  // Check for hex color codes for background
  const hexBgColorMatch = promptLower.match(/(?:background|bg) (?:color|colour)(?: in| is| should be)? (#[0-9a-f]{3,6})/i);
  if (hexBgColorMatch) {
    backgroundColor = hexBgColorMatch[1];
  }
  
  // Check for border radius
  const borderRadiusMatch = promptLower.match(/(?:border radius|rounded|corners)(?: is| should be)? (small|medium|large|square|circle|rounded)/i);
  if (borderRadiusMatch) {
    const radiusMap: Record<string, number> = {
      square: 0, small: 8, medium: 16, rounded: 24, large: 32, circle: 100
    };
    borderRadius = radiusMap[borderRadiusMatch[1].toLowerCase()] || borderRadius;
  }
  
  // Check for numeric border radius
  const numericBorderRadiusMatch = promptLower.match(/(?:border radius|rounded|corners)(?: is| should be)? (\d+)(px)?/i);
  if (numericBorderRadiusMatch) {
    const radius = parseInt(numericBorderRadiusMatch[1]);
    if (radius >= 0 && radius <= 100) { // Reasonable range
      borderRadius = radius;
    }
  }
  
  return { textColor, fontSize, iconColor, backgroundColor, iconSize, borderRadius };
} 