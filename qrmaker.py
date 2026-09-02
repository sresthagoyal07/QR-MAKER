from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import qrcode
import io
import base64

app = FastAPI(title="SRAVA QR Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QRRequest(BaseModel):
    url: str

@app.get("/")
def home():
    return {"message": "SRAVA QR Code API Running!"}

@app.post("/generate-qr")
async def generate_qr(payload: QRRequest):
    user_url = payload.url.strip()
    
    if not user_url:
        raise HTTPException(status_code=400, detail="URL is required.")

    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(user_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        base64_encoded_img = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {
            "status": "success",
            "image_base64": base64_encoded_img
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating QR Code: {str(e)}")