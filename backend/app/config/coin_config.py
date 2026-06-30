# app/config/coin_config.py

EXAM_TYPE_PRICES = {
    "quiz": 1,
    "mid": 3,
    "final": 5
}

# Recharge packages (amount_in_taka -> coins)
RECHARGE_PACKAGES = {
    20: 60,   # 20 tk = 60 coins
    50: 160,  # 50 tk = 160 coins
    100: 330, # 100 tk = 330 coins
    200: 680, # 200 tk = 680 coins
    500: 1750 # 500 tk = 1750 coins
}

# Coin validity in days
COIN_VALIDITY_DAYS = 0.5
SEARCH_RESULT_VALIDITY_DAYS = 0.5


# app/config/ocr_config.py
TESSERACT_PATH = "C:\Program Files\Tesseract-OCR"  # Adjust based on your OS
# OCR_COST = 3
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']