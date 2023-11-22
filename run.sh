APP_PATH="/Applications/Allotrix.app"

xattr -d com.apple.quarantine "$APP_PATH"

echo "Quarantine attribute removed for $APP_PATH"