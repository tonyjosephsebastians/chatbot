# Backend (FastAPI)
## Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # set OPENAI_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```


## Azure OpenAI (Managed Identity)
Set in `backend/.env`:
```
USE_AZURE_OPENAI=true
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-10-21
AZURE_OPENAI_DEPLOYMENT=gpt-4o-2024-08-06-tpm
AZURE_OPENAI_EMBED_DEPLOYMENT=text-embedding-3-large
AZURE_CLIENT_ID=<your-ua-mi-client-id>   # optional
OPENAI_API_KEY=sk-placeholder            # fallback for local
```
