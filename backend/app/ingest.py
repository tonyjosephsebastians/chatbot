from __future__ import annotations
import os
from typing import List
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from .config import settings
from .llm_provider import get_embedder

from unstructured.partition.docx import partition_docx
from unstructured.partition.text import partition_text
import pandas as pd

SUPPORTED_EXTS = {".docx", ".txt", ".xlsx", ".csv"}

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200

def extract_text_from_file(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext == ".docx":
        elements = partition_docx(filename=path)
        return "\n".join([e.text for e in elements if hasattr(e, "text") and e.text])
    if ext == ".txt":
        elements = partition_text(filename=path)
        return "\n".join([e.text for e in elements if hasattr(e, "text") and e.text])
    if ext == ".xlsx":
        df = pd.read_excel(path, sheet_name=None)
        parts = []
        for sheet, sdf in df.items():
            parts.append(f"# Sheet: {sheet}\n" + sdf.to_csv(index=False))
        return "\n\n".join(parts)
    if ext == ".csv":
        df = pd.read_csv(path)
        return df.to_csv(index=False)
    raise ValueError(f"Unsupported file type: {ext}")

def build_faiss_from_dir(upload_dir: str, index_dir: str):
    texts: list[Document] = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    for root, _, files in os.walk(upload_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext not in SUPPORTED_EXTS:
                continue
            full = os.path.join(root, f)
            try:
                raw = extract_text_from_file(full)
            except Exception as e:
                print("[WARN] failed to parse", full, e)
                continue
            chunks = splitter.split_text(raw)
            for i, ch in enumerate(chunks):
                texts.append(Document(page_content=ch, metadata={"source": f, "chunk": i}))
    if not texts:
        raise RuntimeError("No texts extracted; nothing to index.")
    embedder = get_embedder()
    vs = FAISS.from_documents(texts, embedding=embedder)
    os.makedirs(index_dir, exist_ok=True)
    vs.save_local(index_dir)
    return True

def load_faiss(index_dir: str):
    embedder = get_embedder()
    return FAISS.load_local(index_dir, embeddings=embedder, allow_dangerous_deserialization=True)
