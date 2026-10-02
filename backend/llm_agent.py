import os
import json
from groq import Groq

import database as db
from serpapi_client import search_shopping

MODEL = "openai/gpt-oss-120b"

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_prices",
            "description": "Search live prices for a product across sellers right now.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Product to search for"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_tracked_products",
            "description": "List all products currently being tracked, with their IDs.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_price_history",
            "description": "Get the saved price-snapshot history for a tracked product ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {"type": "string"},
                },
                "required": ["product_id"],
            },
        },
    },
]


def _run_tool(name: str, args: dict):
    if name == "search_prices":
        results = search_shopping(args["query"])
        return json.dumps([r.model_dump() for r in results[:8]])
    if name == "get_tracked_products":
        return json.dumps(db.get_products())
    if name == "get_price_history":
        return json.dumps(db.get_snapshots(args["product_id"]))
    return json.dumps({"error": f"unknown tool {name}"})


def answer_question(question: str) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment")

    client = Groq(api_key=api_key)

    messages = [
        {
            "role": "system",
            "content": (
                "You are a price-intelligence assistant. You MUST use the provided "
                "tools to get real data before answering any question about prices, "
                "products, or history. Never invent prices or numbers. If multiple "
                "tool calls are needed, request them together in one turn."
            ),
        },
        {"role": "user", "content": question},
    ]

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    msg = response.choices[0].message

    if msg.tool_calls:
        messages.append(msg)
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments or "{}")
            result = _run_tool(call.function.name, args)
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call.id,
                    "content": result,
                }
            )

        final = client.chat.completions.create(model=MODEL, messages=messages)
        return final.choices[0].message.content

    return msg.content
