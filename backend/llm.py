import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=os.environ.get("OPENAI_API_KEY", ""),
            base_url=os.environ.get("LLM_BASE_URL", ""),
        )
    return _client


async def call_llm(prompt: str, input_text: str) -> str:
    client = get_client()
    response = await client.chat.completions.create(
        model=os.environ["LLM_MODEL"],
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
    raw = (response.choices[0].message.content or "").strip().upper()
    if raw.startswith("YES"):
        return "YES"
    if raw.startswith("NO"):
        return "NO"
    raise ValueError(f"LLM did not return YES/NO, got: {raw!r}")
