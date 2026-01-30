from pydantic import BaseModel
from typing import Literal, Optional
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from openai import AsyncOpenAI
from httpx import AsyncClient
from pydantic_ai.providers.openai import OpenAIProvider


class BrowserAction(BaseModel):
    action: Literal["goto", "click", "fill", "done"]
    url: Optional[str] = None
    selector: Optional[str] = None
    text: Optional[str] = None


custom_http_client = AsyncClient(timeout=60)

client = AsyncOpenAI(
    base_url='http://localhost:11434/v1',
    api_key='your-dummy-api-key',
)

model = OpenAIModel('qwen3:4b', provider=OpenAIProvider(base_url='http://localhost:11434/v1/', http_client=custom_http_client))

async def browser_action_tool(
    action: str,
    url: Optional[str] = None,
    selector: Optional[str] = None,
    text: Optional[str] = None,
) -> str:
    """
    Controls the browser.

    action: one of 'goto', 'click', 'fill', or 'done'
    url: used only for goto
    selector: CSS selector for click/fill
    text: text for fill
    """
    # your actual Playwright execution happens here
    return f"Executed {action} on {selector or url}"

agent = Agent(
    model,
    tools=[browser_action_tool],
    system_prompt="""
You control a web browser using Playwright.

Decide the NEXT browser action only.
Be incremental.
Use CSS selectors.
When finished, return action = "done".
""",
)
