import asyncio
import os
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser
from loguru import logger
from config import TARGET_URL, HEADLESS, TIMEOUT_MS, OUTPUT_DIR


logger.add("rpa.log", rotation="10 MB", retention="7 days", level="INFO")


class RPABot:
    def __init__(self):
        self.browser: Browser | None = None
        self.page: Page | None = None
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        os.makedirs("screenshots", exist_ok=True)

    async def start(self):
        self._playwright = await async_playwright().start()
        self.browser = await self._playwright.chromium.launch(headless=HEADLESS)
        context = await self.browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        )
        self.page = await context.new_page()
        self.page.set_default_timeout(TIMEOUT_MS)
        logger.info("Navegador iniciado")

    async def stop(self):
        if self.browser:
            await self.browser.close()
        await self._playwright.stop()
        logger.info("Navegador encerrado")

    async def screenshot(self, name: str):
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = f"screenshots/{name}_{ts}.png"
        await self.page.screenshot(path=path, full_page=True)
        logger.info(f"Screenshot salvo: {path}")
        return path

    async def navigate(self, url: str):
        logger.info(f"Navegando para: {url}")
        await self.page.goto(url, wait_until="domcontentloaded")

    async def run(self):
        await self.start()
        try:
            await self.navigate(TARGET_URL)
            await self.screenshot("pagina_inicial")

            title = await self.page.title()
            logger.info(f"Título da página: {title}")

            links = await self.page.eval_on_selector_all(
                "a[href]",
                "els => els.slice(0, 10).map(e => ({text: e.innerText.trim(), href: e.href}))",
            )
            logger.info(f"Primeiros links encontrados: {links}")

            return {"title": title, "links": links, "status": "success"}
        except Exception as e:
            logger.error(f"Erro durante execução: {e}")
            await self.screenshot("erro")
            return {"status": "error", "message": str(e)}
        finally:
            await self.stop()


async def main():
    bot = RPABot()
    result = await bot.run()
    logger.info(f"Resultado: {result}")


if __name__ == "__main__":
    asyncio.run(main())
