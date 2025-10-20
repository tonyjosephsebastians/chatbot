from __future__ import annotations
from typing import Dict, Any
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from .llm_provider import get_chat_llm
from .ingest import load_faiss
from .config import settings

BASE_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "You are a helpful assistant that answers strictly using the provided context.\n"
        "If the answer is not in the context, say you don't know.\n\n"
        "Context:\n{context}\n\nQuestion: {question}\n\nAnswer:"
    )
)

def make_qa_chain(vs):
    retriever = vs.as_retriever(search_kwargs={"k": 5})
    llm = get_chat_llm()
    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": BASE_PROMPT},
        return_source_documents=True,
    )
    return chain

def answer_question(question: str) -> Dict[str, Any]:
    vs = load_faiss(settings.INDEX_DIR)
    chain = make_qa_chain(vs)
    res = chain.invoke({"query": question})
    answer = res.get("result", "")
    sources = res.get("source_documents", []) or []
    citations = []
    for d in sources:
        md = d.metadata or {}
        citations.append({
        "source": md.get("source"),
        "chunk": md.get("chunk"),
        "page": md.get("page", i // 5 + 1),  # ← Adds a pseudo page number
        "preview": doc.page_content[:200]
    })
    return {"answer": answer, "citations": citations}
