#!/bin/bash

# API Base URL
BASE_URL="http://localhost:3001/api"
BACKGROUND_GREEN='\033[42m'
text_reset='\033[0m'
text_bold='\033[1m'
text_red='\033[31m'
text_green='\033[32m'

echo -e "${text_bold}🚀 API Test Script Started...${text_reset}"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to run this script."
    exit 1
fi

# 1. Register User
echo 
echo -e "${text_bold}1. Registering User...${text_reset}"
REGISTER_PAYLOAD='{
  "mbti": "INTJ",
  "baseline_answers": {
    "q1_caution": "A",
    "q2_calmness": "D",
    "q3_logic": "A",
    "q4_cooperativeness": "C",
    "q5_positivity": "B"
  }
}'

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD")

echo "Response: $REGISTER_RESPONSE"

USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user_id')

if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
    echo -e "${text_red}❌ Registration failed.${text_reset}"
    exit 1
else
    echo -e "${text_green}✅ User Registered with ID: $USER_ID${text_reset}"
fi

# 2. Submit Game 1 (Terms of Service)
echo 
echo -e "${text_bold}2. Submitting Game 1 (Terms of Service)...${text_reset}"
GAME1_PAYLOAD='{
  "user_id": "'"$USER_ID"'",
  "game_type": 1,
  "data": {
    "totalTime": 120,
    "finalAction": "agree",
    "reachedBottom": true,
    "scrollEvents": [
      {"position": 0, "timestamp": 0},
      {"position": 5000, "timestamp": 15000}
    ],
    "hiddenInput": "確認済み",
    "checkboxStates": {
      "readConfirm": {"checked": true, "changed": true},
      "mailMagazine": {"checked": false, "changed": true},
      "thirdPartyShare": {"checked": false, "changed": true}
    },
    "popupStats": {"timeToClose": 1200, "clickCount": 1}
  }
}'

GAME1_RESPONSE=$(curl -s -X POST "$BASE_URL/games/submit" \
  -H "Content-Type: application/json" \
  -d "$GAME1_PAYLOAD")

echo "Response: $GAME1_RESPONSE"
STATUS1=$(echo $GAME1_RESPONSE | jq -r '.status')

if [ "$STATUS1" == "success" ]; then
    echo -e "${text_green}✅ Game 1 Submitted.${text_reset}"
else
    echo -e "${text_red}❌ Game 1 Submission Failed.${text_reset}"
fi

# 3. Submit Game 2 (AI Chat)
echo 
echo -e "${text_bold}3. Submitting Game 2 (AI Chat)...${text_reset}"
GAME2_PAYLOAD='{
  "user_id": "'"$USER_ID"'",
  "game_type": 2,
  "data": {
    "inputMethod": "voice",
    "turnCount": 2,
    "turns": [
      {
        "turnIndex": 1,
        "inputMethod": "voice",
        "reactionTimeMs": 1200,
        "speechDurationMs": 8500,
        "silenceDurationMs": 500,
        "volumeDb": -25.3,
        "transcribedText": "パスワードを入力しても弾かれます"
      },
      {
        "turnIndex": 2,
        "inputMethod": "text",
        "reactionTimeMs": null,
        "speechDurationMs": null,
        "silenceDurationMs": null,
        "volumeDb": null,
        "transcribedText": "別の方法を試します"
      }
    ]
  }
}'

GAME2_RESPONSE=$(curl -s -X POST "$BASE_URL/games/submit" \
  -H "Content-Type: application/json" \
  -d "$GAME2_PAYLOAD")

echo "Response: $GAME2_RESPONSE"
STATUS2=$(echo $GAME2_RESPONSE | jq -r '.status')

if [ "$STATUS2" == "success" ]; then
    echo -e "${text_green}✅ Game 2 Submitted.${text_reset}"
else
    echo -e "${text_red}❌ Game 2 Submission Failed.${text_reset}"
fi

# 4. Submit Game 3 (Group Chat)
echo 
echo -e "${text_bold}4. Submitting Game 3 (Group Chat)...${text_reset}"
GAME3_PAYLOAD='{
  "user_id": "'"$USER_ID"'",
  "game_type": 3,
  "data": {
    "tutorialViewTime": 5200,
    "stages": [
      {"stageId": 1, "selectedOptionId": 2, "reactionTime": 3400, "isTimeout": false},
      {"stageId": 2, "selectedOptionId": 1, "reactionTime": 1800, "isTimeout": false},
      {"stageId": 3, "selectedOptionId": 3, "reactionTime": 4500, "isTimeout": false},
      {"stageId": 4, "selectedOptionId": 0, "reactionTime": 10000, "isTimeout": true},
      {"stageId": 5, "selectedOptionId": 1, "reactionTime": 2200, "isTimeout": false}
    ]
  }
}'

GAME3_RESPONSE=$(curl -s -X POST "$BASE_URL/games/submit" \
  -H "Content-Type: application/json" \
  -d "$GAME3_PAYLOAD")

echo "Response: $GAME3_RESPONSE"
STATUS3=$(echo $GAME3_RESPONSE | jq -r '.status')

if [ "$STATUS3" == "success" ]; then
    echo -e "${text_green}✅ Game 3 Submitted.${text_reset}"
else
    echo -e "${text_red}❌ Game 3 Submission Failed.${text_reset}"
fi

# 5. Get Results
echo 
echo -e "${text_bold}5. Getting Results...${text_reset}"
RESULT_RESPONSE=$(curl -s -X GET "$BASE_URL/results/$USER_ID")

echo "Response: $RESULT_RESPONSE"
ACCURACY_SCORE=$(echo $RESULT_RESPONSE | jq -r '.accuracy_score // "null"')

if [ "$ACCURACY_SCORE" != "null" ]; then
     echo -e "${text_green}✅ Results Retrieved. Accuracy Score: $ACCURACY_SCORE${text_reset}"
else
     echo -e "${text_red}❌ Failed to retrieve valid results.${text_reset}"
fi

# 6. Test Voice (Gemini)
echo 
echo -e "${text_bold}6. Testing Voice (Gemini)...${text_reset}"
VOICE_PAYLOAD='{
  "user_id": "'"$USER_ID"'",
  "message": "テストです。パスワードを忘れました。"
}'

VOICE_RESPONSE=$(curl -s -X POST "$BASE_URL/voice/respond" \
  -H "Content-Type: application/json" \
  -d "$VOICE_PAYLOAD")

echo "Response: $VOICE_RESPONSE"
RESPONSE_TEXT=$(echo $VOICE_RESPONSE | jq -r '.response // "null"')

if [ "$RESPONSE_TEXT" != "null" ]; then
    echo -e "${text_green}✅ Voice API Success. Response: $RESPONSE_TEXT${text_reset}"
else
    echo -e "${text_red}❌ Voice API Failed.${text_reset}"
fi

echo 
echo -e "${BACKGROUND_GREEN}${text_bold} 🎉 All Tests Completed! ${text_reset}"
