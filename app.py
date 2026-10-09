from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PolyGlot Play API")

# Allow Frontend CORS Requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Practice Data Repository
DATA_STORE = {
    "zh": [
        {"q": "How do you say 'Hello' in Chinese?", "options": ["你好 (Nǐ hǎo)", "谢谢 (Xièxiè)", "再见 (Zàijiàn)", "对不起 (Duìbùqǐ)"], "answer": 0},
        {"q": "What is the meaning of '谢谢'?", "options": ["Sorry", "Thank you", "Goodbye", "Please"], "answer": 1}
    ],
    "de": [
        {"q": "How do you say 'Good morning' in German?", "options": ["Guten Morgen", "Guten Tag", "Gute Nacht", "Auf Wiedersehen"], "answer": 0}
    ],
    "en": [
        {"q": "Select the correct synonym for 'Rapid':", "options": ["Slow", "Quick", "Heavy", "Quiet"], "answer": 1}
    ]
}

class ScoreRecord(BaseModel):
    username: str
    language: str
    xp_earned: int

user_scores = []

@app.get("/api/questions/{lang_code}")
def get_questions(lang_code: str):
    return {"questions": DATA_STORE.get(lang_code, [])}

@app.post("/api/score")
def save_score(record: ScoreRecord):
    user_scores.append(record)
    return {"message": "Score saved successfully!", "total_records": len(user_scores)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)