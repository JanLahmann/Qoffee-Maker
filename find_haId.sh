#!/bin/sh

echo "Guided User Script to get haId of all connected Home Connect Devices:"
echo "---------------------------------------------------------------------"
echo "Reading .env file... Process will be aborted if no .env file is found. Be sure to have set correct values in .env file."

export $(grep -v "^#" ".env" | xargs -d "\n")

echo "Guided User Script to get haId of all connected Home Connect Devices:"
echo "---------------------------------------------------------------------"

echo "Getting access token... The browser will be opened. Please login and allow access to the app. Then copy the URL of the browser and paste it here."
nohup xdg-open "$HOMECONNECT_API_URL/security/oauth/authorize?client_id=$HOMECONNECT_CLIENT_ID&redirect_uri=$HOMECONNECT_REDIRECT_URL&response_type=code" </dev/null &>/dev/null &
# get user URL
read -p "URL: " URL
# parse code parameter form URL
CODE=$(echo $URL | awk -F'[=&]' '{print $2}' | awk -F'%' '{print $1}')

echo $CODE

ACCESS_TOKEN=$(curl POST "$HOMECONNECT_API_URL/security/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "client_id=$HOMECONNECT_CLIENT_ID" \
  --data-urlencode "client_secret=$HOMECONNECT_CLIENT_SECRET" \
  --data-urlencode "redirect_uri=$HOMECONNECT_REDIRECT_URL" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=$CODE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Access token: $ACCESS_TOKEN"

curl -X GET "$HOMECONNECT_API_URL/api/homeappliances" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo "Process finished: Find your appliances haId in the list above."
