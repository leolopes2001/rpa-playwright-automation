import asyncio
import ipaddress
import os
import socket
from datetime import datetime
from pathlib import Path
from typing import Awaitable, Callable
from playwright.async_api import async_playwright, Page, Browser
from loguru import logger
from config import TARGET_URL, HEADLESS, TIMEOUT_MS, OUTPUT_DIR, ARTIFACTS_DIR


logger.add("rpa.log", rotation="10 MB", retention="7 days", level="INFO")


async def assert_public_url(url: str):
    parsed = __import__("urllib.parse", fromlist=["urlparse"]).urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username:
        raise ValueError("URL HTTP/HTTPS publica invalida")
    addresses = await asyncio.get_running_loop().run_in_executor(
        None, lambda: socket.getaddrinfo(parsed.hostname, parsed.port, type=socket.SOCK_STREAM)
    )
    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            raise ValueError("A navegacao aponta para uma rede privada ou reservada")


class RPABot:
    def __init__(self, execution_id: str = "standalone"):
        self.browser: Browser | None = None
        self.page: Page | None = None
        self._playwright = None
        self.execution_id = execution_id
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        self.artifact_dir = Path(ARTIFACTS_DIR) / execution_id
        self.artifact_dir.mkdir(parents=True, exist_ok=True)

    async def start(self):
        self._playwright = await async_playwright().start()
        self.browser = await self._playwright.chromium.launch(headless=HEADLESS)
        context = await self.browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        )
        async def guard_navigation(route):
            if route.request.is_navigation_request():
                try:
                    await assert_public_url(route.request.url)
                except ValueError:
                    await route.abort("blockedbyclient")
                    return
            await route.continue_()

        await context.route("**/*", guard_navigation)
        self.page = await context.new_page()
        self.page.set_default_timeout(TIMEOUT_MS)
        logger.info("Navegador iniciado")

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self._playwright:
            await self._playwright.stop()
        logger.info("Navegador encerrado")

    async def screenshot(self, name: str):
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{ts}.png"
        path = self.artifact_dir / filename
        await self.page.screenshot(path=str(path), full_page=True)
        logger.info(f"Screenshot salvo: {path}")
        return {
            "name": filename,
            "key": f"{self.execution_id}/{filename}",
            "mimeType": "image/png",
            "size": path.stat().st_size,
        }

    async def navigate(self, url: str):
        await assert_public_url(url)
        logger.info(f"Navegando para: {url}")
        await self.page.goto(url, wait_until="domcontentloaded")

    async def run(
        self,
        url: str = TARGET_URL,
        progress: Callable[[str, int, str, dict | None], Awaitable[None]] | None = None,
    ):
        async def emit(event_type: str, percent: int, message: str, artifact=None):
            if progress:
                await progress(event_type, percent, message, artifact)

        await emit("STARTED", 10, "Worker iniciou o processamento")
        await self.start()
        try:
            await emit("BROWSER_READY", 25, "Navegador iniciado")
            await self.navigate(url)
            await emit("PAGE_LOADED", 50, "Pagina acessada")
            artifact = await self.screenshot("pagina_inicial")
            await emit("SCREENSHOT", 65, "Screenshot capturado", artifact)

            title = await self.page.title()
            logger.info(f"Título da página: {title}")

            links = await self.page.eval_on_selector_all(
                "a[href]",
                "els => els.slice(0, 10).map(e => ({text: e.innerText.trim(), href: e.href}))",
            )
            logger.info(f"Primeiros links encontrados: {links}")
            await emit("DATA_EXTRACTED", 90, "Dados encontrados")
            return {"title": title, "links": links, "screenshot": artifact}
        except Exception:
            logger.exception("Erro durante execucao")
            if self.page:
                await self.screenshot("erro")
            raise
        finally:
            await self.stop()


async def main():
    bot = RPABot()
    result = await bot.run()
    logger.info(f"Resultado: {result}")


if __name__ == "__main__":
    asyncio.run(main())
