"use client";

export function subscribeToEvents(url: string, onMessage: (data: unknown) => void) {
  const source = new EventSource(url);
  source.onmessage = (evt) => {
    try {
      onMessage(JSON.parse(evt.data));
    } catch (err) {
      console.error("Unable to parse event", err);
    }
  };
  return () => source.close();
}
