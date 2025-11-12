from __future__ import annotations

from typing import Any

from starlette.websockets import WebSocket


async def broadcast_json(websocket: WebSocket, message: dict[str, Any]) -> None:
    await websocket.send_json(message)
