import os

timeout = 120
workers = 1
# Render provides the PORT environment variable. Fallback to 10000 which is common for Render.
bind = "0.0.0.0:" + str(os.environ.get('PORT', '10000'))
