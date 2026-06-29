import type { ChatClientEvent } from '../types';
import { log } from './socket';

export const OUTBOUND_QUEUE_MAX = 50;

export type EmitFn = (event: ChatClientEvent) => void;

/**
 * Buffers outbound events while the socket is not connected so nothing is lost
 * during reconnects. Heartbeats are intentionally never queued (a stale
 * heartbeat is useless), and the queue drops the oldest event on overflow.
 */
export class OutboundQueue {
    private items: ChatClientEvent[] = [];

    constructor(private readonly max: number = OUTBOUND_QUEUE_MAX) {}

    enqueue(event: ChatClientEvent): void {
        if (event.type === 'presence.heartbeat') return;
        if (this.items.length >= this.max) {
            const dropped = this.items.shift();
            log('outbound queue overflow — dropped oldest', { droppedType: dropped?.type });
        }
        this.items.push(event);
        log('queued outbound (socket not open)', { type: event.type, queued: this.items.length });
    }

    flush(emit: EmitFn): void {
        if (this.items.length === 0) return;
        const pending = this.items;
        this.items = [];
        log('flushing outbound queue', { count: pending.length });
        for (const event of pending) emit(event);
    }

    clear(): void {
        this.items = [];
    }

    get size(): number {
        return this.items.length;
    }
}
