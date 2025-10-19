from __future__ import annotations
import os
from azure.identity import ManagedIdentityCredential, get_bearer_token_provider
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from .config import settings

# Azure config via env
EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT", "text-embedding-3-large")
CHAT_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-2024-08-06-tpm")
API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "https://<your-endpoint>.openai.azure.com")
SCOPES = "https://cognitiveservices.azure.com/.default"
CLIENT_ID = os.getenv("AZURE_CLIENT_ID", None)

def _get_token_provider():
    try:
        cred = ManagedIdentityCredential(client_id=CLIENT_ID)
        provider = get_bearer_token_provider(cred, SCOPES)
        print("[AzureOpenAI] Managed Identity token provider initialized.")
        return provider
    except Exception as e:
        print(f"[AzureOpenAI] Managed Identity not available: {e}")
        return None

_token_provider = _get_token_provider()

def get_embedder():
    if os.getenv("USE_AZURE_OPENAI", "false").lower() == "true" and _token_provider:
        return AzureOpenAIEmbeddings(
            azure_deployment=EMBEDDING_DEPLOYMENT,
            openai_api_version=API_VERSION,
            azure_endpoint=AZURE_ENDPOINT,
            azure_ad_token_provider=_token_provider,
        )
    else:
        print("[AzureOpenAI] Using API key fallback for embeddings.")
        return OpenAIEmbeddings(model=settings.OPENAI_EMBED_MODEL, api_key=settings.OPENAI_API_KEY)

def get_chat_llm():
    if os.getenv("USE_AZURE_OPENAI", "false").lower() == "true" and _token_provider:
        return AzureChatOpenAI(
            azure_deployment=CHAT_DEPLOYMENT,
            openai_api_version=API_VERSION,
            azure_endpoint=AZURE_ENDPOINT,
            azure_ad_token_provider=_token_provider,
            model_version="gpt-4o",
            temperature=0.2,
        )
    else:
        print("[AzureOpenAI] Using API key fallback for chat.")
        return ChatOpenAI(model=settings.OPENAI_CHAT_MODEL, api_key=settings.OPENAI_API_KEY, temperature=0.2)
