import os
import random
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")


async def call_llm(prompt: str, input_text: str) -> str:
    api_key = os.environ.get("OPENAI_API_KEY", "")

    if not api_key or api_key.startswith("sk-placeholder"):
        return random.choice(["YES", "NO"])

    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        api_key=api_key,
        base_url=os.environ.get("LLM_BASE_URL", ""),
        default_headers={
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AI Decision Flow",
        },
    )
    response = await client.chat.completions.create(
        model=os.environ.get("LLM_MODEL", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"),
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict binary classifier. Answer the question "
                    "about the given input with EXACTLY one word: YES or NO. "
                    "No punctuation, no explanation, nothing else."
                ),
            },
            {"role": "user", "content": f"Question: {prompt}\n\nInput: {input_text}"},
        ],
        temperature=0,
        max_tokens=3,
    )
    if not response.choices or not response.choices[0].message:
        return random.choice(["YES", "NO"])
    raw = (response.choices[0].message.content or "").strip().upper()
    if raw.startswith("YES"):
        return "YES"
    if raw.startswith("NO"):
        return "NO"
    raise ValueError(f"LLM did not return YES/NO, got: {raw!r}")
