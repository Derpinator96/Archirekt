import requests
import numpy as np
import cv2

# Create a dummy image
img = np.zeros((500, 500), dtype=np.uint8)
# Draw a simple box (walls)
cv2.rectangle(img, (50, 50), (450, 450), 255, 3)

# encode
_, buffer = cv2.imencode('.png', img)

res = requests.post(
    "http://localhost:8000/api/parse-floorplan", 
    files={"file": ("test.png", buffer.tobytes(), "image/png")}
)

print(res.status_code)
try:
    print(res.json())
except Exception as e:
    print(res.text)
