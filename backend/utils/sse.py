from __future__ import annotations

from typing import AsyncIterator, Iterable

from starlette.responses import StreamingResponse


def sse_response(events: Iterable[str] | AsyncIterator[str]) -> StreamingResponse:
    async def event_stream():
        if hasattr(events, "__aiter__"):
            async for evt in events:  # type: ignore[attr-defined]
                yield f"data: {evt}\n\n"
        else:
            for evt in events:  # type: ignore[not-an-iterable]
                yield f"data: {evt}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
