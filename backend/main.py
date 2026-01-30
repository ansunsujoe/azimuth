import asyncio
import base64
from fastapi import FastAPI, WebSocket
from playwright.async_api import async_playwright
from agent import agent
from pydantic_ai import ToolCallPart
import json
from bs4 import BeautifulSoup

app = FastAPI()


def collapse_wrappers(soup):
    """
    Recursively collapse divs/spans that have a single child element
    and no important attributes.
    """
    changed = True
    while changed:
        changed = False
        for tag in soup.find_all(["div", "span"]):
            # Skip if tag has important attributes
            important_attrs = {"id", "href", "name", "aria-label"}
            has_important_attrs = any(
                k in important_attrs
                for k in tag.attrs
            )
            if has_important_attrs:
                continue

            # Check if exactly one child element
            children = [c for c in tag.contents if getattr(c, "name", None)]
            if len(children) == 1:
                child = children[0]
                tag.replace_with(child)
                changed = True


async def get_filtered_html(page):
    # Get full HTML
    html = await page.content()

    # Parse it
    soup = BeautifulSoup(html, 'html.parser')

    # Remove <script> and <style> tags
    for tag in soup(["script", "style", "noscript", "svg", "head", "header", "img"]):
        tag.decompose()

    for tag in soup.find_all("c-wiz"):
        tag.unwrap()

    # Optionally remove very large comments
    for comment in soup.find_all(string=lambda text: isinstance(text, type(soup.Comment))):
        if len(comment) > 200:  # threshold
            comment.extract()

    # Optionally remove hidden elements (display:none)
    for el in soup.select('[style*="display:none"]'):
        el.decompose()

    # Remove elements with aria-hidden="true"
    for el in soup.select('[aria-hidden="true"]'):
        el.decompose()

    # Filter attributes: keep id, class, href, name, data-*, aria-*
    allowed_attrs = {"id", "class", "href", "name", "aria-label"}
    for tag in soup.find_all(True):
        new_attrs = {}
        for k, v in tag.attrs.items():
            if k in allowed_attrs or k.startswith("data-"):
                new_attrs[k] = v
        tag.attrs = new_attrs

        # If aria-label or id exists, then make that the only attribute.
        if "id" in tag.attrs:
            tag.attrs = {"id": tag.attrs["id"]}
        elif "aria-label" in tag.attrs:
            tag.attrs = {"aria-label": tag.attrs["aria-label"]}
        elif "href" in tag.attrs:
            tag.attrs = {"href": tag.attrs["href"]}

    # Keep looping until no more empty tags are found
    removed = True
    while removed:
        removed = False
        for tag in soup.find_all(True):
            # If tag has no text (or only whitespace) and no children
            if (not tag.get_text(strip=True)) and (len(tag.find_all(recursive=False)) == 0):
                tag.decompose()
                removed = True

    collapse_wrappers(soup)

    # Get cleaned HTML string
    cleaned_html = soup.prettify()
    return cleaned_html


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page()

        user_command = await ws.receive_text()

        await ws.send_json({
            "type": "status",
            "state": "running"
        })

        html = ""
        cur_page = ""
        past_actions = ""

        while True:
            # Context engineering.
            context = ""
            if cur_page != "":
                context += f"The current page ({cur_page}) HTML is displayed below:\n{html}\n\n"
            if past_actions != "":
                context += f"Here are your past actions:\n{past_actions}\n"
            context += user_command

            result = await agent.run(context)
            new_messages = result.new_messages()
            for message in new_messages:
                for part in message.parts:
                    if isinstance(part, ToolCallPart):
                        arguments = json.loads(part.args)
                        await ws.send_json({"type": "action", "data": arguments})

                        if arguments["action"] == "done":
                            await ws.send_json({
                                "type": "status",
                                "state": "done"
                            })
                            await browser.close()
                            await ws.close()
                            return

                        if arguments["action"] == "goto":
                            cur_page = arguments["url"]
                            await page.goto(arguments["url"])

                        elif arguments["action"] == "click":
                            await page.click(arguments["selector"])

                        elif arguments["action"] == "fill":
                            await page.fill(arguments["selector"], arguments["text"])

                        html = await get_filtered_html(page)
                        screenshot = await page.screenshot()
                        image_b64 = base64.b64encode(screenshot).decode()

                        await ws.send_json({"type": "screenshot", "image": image_b64, "html": html})

                        context += f"\nLast action: {arguments}"
                        await asyncio.sleep(0.3)

        await browser.close()
