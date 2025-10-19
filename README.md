# DocChat Next (TD-style)
- **Frontend:** Next.js (TypeScript), TD green/white theme with embedded TD-style logo
- **Backend:** FastAPI + LangChain + FAISS (no Docker)
- **Auth:** admin/admin (admin), frp/pass (user)
- **Features:** Admin ingests Excel/CSV/Word docx → FAISS; Chat with citations; Export Word

## Run (2 terminals)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # set OPENAI_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm i
npm run dev
# open http://localhost:3000
```
