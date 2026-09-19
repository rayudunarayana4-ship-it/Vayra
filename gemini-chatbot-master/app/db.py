from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

try:
    from bson import ObjectId
    from pymongo import MongoClient
    from pymongo.errors import PyMongoError
except ImportError:  # pragma: no cover - enables retrieval-only local tests
    ObjectId = None
    MongoClient = None
    PyMongoError = Exception

from .config import settings

client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=3000) if MongoClient else None
database = client[settings.mongodb_database] if client else None
documents = database["documents"] if database is not None else None
conversations = database["conversations"] if database is not None else None
memory_documents: list[dict[str, Any]] = []
memory_conversations: dict[str, dict[str, Any]] = {}

try:
    if client is None:
        raise PyMongoError("pymongo is not installed")
    client.admin.command("ping")
    mongo_available = True
except PyMongoError:
    # The storefront chatbot remains usable in local/demo deployments without
    # a MongoDB process. Data lasts for the lifetime of that API process.
    mongo_available = False


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def save_document(title: str, content: str, chunks: list[dict[str, Any]]) -> str:
    if not mongo_available:
        document_id = uuid4().hex
        memory_documents.append({"_id": document_id, "title": title, "content": content, "chunks": chunks, "created_at": utc_now()})
        return document_id
    result = documents.insert_one({
        "title": title,
        "content": content,
        "chunks": chunks,
        "created_at": utc_now(),
    })
    return str(result.inserted_id)


def document_exists(title: str) -> bool:
    if not mongo_available:
        return any(item["title"] == title for item in memory_documents)
    return documents.count_documents({"title": title}, limit=1) > 0


def replace_document(title: str, content: str, chunks: list[dict[str, Any]]) -> str:
    if not mongo_available:
        memory_documents[:] = [item for item in memory_documents if item["title"] != title]
        return save_document(title, content, chunks)
    documents.delete_many({"title": title})
    return save_document(title, content, chunks)


def list_documents() -> list[dict[str, Any]]:
    if not mongo_available:
        return [{"id": item["_id"], "title": item["title"], "created_at": item["created_at"].isoformat()} for item in sorted(memory_documents, key=lambda item: item["created_at"], reverse=True)]
    return [
        {"id": str(item["_id"]), "title": item["title"], "created_at": item["created_at"].isoformat()}
        for item in documents.find({}, {"title": 1, "created_at": 1}).sort("created_at", -1)
    ]


def create_conversation(title: str) -> str:
    if not mongo_available:
        conversation_id = uuid4().hex
        memory_conversations[conversation_id] = {"title": title[:80] or "New conversation", "messages": [], "created_at": utc_now(), "updated_at": utc_now()}
        return conversation_id
    result = conversations.insert_one({
        "title": title[:80] or "New conversation",
        "messages": [],
        "created_at": utc_now(),
        "updated_at": utc_now(),
    })
    return str(result.inserted_id)


def add_message(conversation_id: str, role: str, content: str) -> None:
    if not mongo_available:
        conversation = memory_conversations.get(conversation_id)
        if conversation is None:
            raise ValueError("conversation_id does not exist")
        conversation["messages"].append({"role": role, "content": content, "created_at": utc_now()})
        conversation["updated_at"] = utc_now()
        return
    object_id = _conversation_object_id(conversation_id)
    conversations.update_one(
        {"_id": object_id},
        {"$push": {"messages": {"role": role, "content": content, "created_at": utc_now()}}, "$set": {"updated_at": utc_now()}},
    )


def get_messages(conversation_id: str) -> list[dict[str, str]]:
    if not mongo_available:
        conversation = memory_conversations.get(conversation_id)
        return [] if conversation is None else [{"role": item["role"], "content": item["content"]} for item in conversation["messages"]]
    conversation = conversations.find_one({"_id": _conversation_object_id(conversation_id)}, {"messages": 1})
    if not conversation:
        return []
    return [{"role": item["role"], "content": item["content"]} for item in conversation.get("messages", [])]


def _conversation_object_id(conversation_id: str) -> ObjectId:
    if ObjectId is None or not ObjectId.is_valid(conversation_id):
        raise ValueError("conversation_id must be a valid MongoDB ObjectId")
    return ObjectId(conversation_id)


def get_all_chunks() -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    if not mongo_available:
        source_documents = memory_documents
    else:
        source_documents = documents.find({}, {"title": 1, "chunks": 1})
    for document in source_documents:
        for chunk in document.get("chunks", []):
            chunks.append({
                "title": document["title"],
                "content": chunk["content"],
                "embedding": chunk.get("embedding"),
                "image_url": chunk.get("image_url"),
                "image_urls": chunk.get("image_urls", []),
            })
    return chunks
