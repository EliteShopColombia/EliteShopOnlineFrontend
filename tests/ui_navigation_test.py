"""CP-38 - Navegacion y visualizacion del cliente web.

Sesion de prueba manual asistida con Selenium + Firefox headless sobre el
build de produccion servido localmente. Verifica que el flujo principal de
navegacion se complete y que no existan errores de visualizacion ni de
consola que impidan el uso.

Ejecucion:
    /tmp/venv-fm/bin/python tests/ui_navigation_test.py
"""
import json
import os
import sys
import time
import urllib.request

from selenium import webdriver
from selenium.webdriver.firefox.options import Options

BASE = os.environ.get("UI_BASE_URL", "http://127.0.0.1:4173")
RESULT_PATH = "/tmp/build/ui_result.json"

ROUTES = [
    ("/", "catalogo"),
    ("/login", "inicio de sesion"),
    ("/register", "registro"),
    ("/checkout", "checkout"),
    ("/seller", "registro de vendedor"),
]

VIEWPORTS = [
    ("escritorio 1440x900", 1440, 900),
    ("movil 390x844", 390, 844),
]


def check_backend():
    url = "https://destinations-dot-initial-authors.trycloudflare.com/api/v1/products"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return r.status
    except Exception as exc:  # noqa: BLE001
        return f"no accesible ({type(exc).__name__})"


def main():
    results = []
    backend_status = check_backend()
    print(f"[CP-38] Backend desplegado: {backend_status}")

    opts = Options()
    opts.add_argument("-headless")
    driver = webdriver.Firefox(options=opts)
    failures = []

    try:
        for viewport_name, width, height in VIEWPORTS:
            driver.set_window_size(width, height)
            for route, label in ROUTES:
                driver.get(BASE + route)
                time.sleep(1.2)
                body = driver.find_element("tag name", "body")
                text = body.text.strip()
                size = body.size
                overflow = driver.execute_script(
                    "return document.documentElement.scrollWidth > "
                    "document.documentElement.clientWidth + 2;"
                )
                blank = len(text) < 20
                collapsed = size["width"] < 200 or size["height"] < 200
                entry = {
                    "viewport": viewport_name,
                    "route": route,
                    "label": label,
                    "title": driver.title,
                    "chars": len(text),
                    "overflow_x": bool(overflow),
                    "blank": blank,
                    "collapsed": collapsed,
                }
                results.append(entry)
                status = "OK  "
                if blank or collapsed or overflow:
                    status = "FALLA"
                    failures.append(entry)
                print(f"  [{status}] {viewport_name:20s} {route:12s} "
                      f"chars={len(text):5d} overflow={overflow}")
    finally:
        driver.quit()

    summary = {
        "backend_status": str(backend_status),
        "routes_checked": len(results),
        "failures": len(failures),
        "results": results,
    }
    os.makedirs(os.path.dirname(RESULT_PATH), exist_ok=True)
    with open(RESULT_PATH, "w", encoding="utf-8") as fh:
        json.dump(summary, fh, indent=1, ensure_ascii=False)

    print(f"\n[CP-38] rutas verificadas={len(results)} fallos={len(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
